#!/usr/bin/env node
import 'dotenv/config';
import http from 'http';
import https from 'https';
import FormData from 'form-data';
import { ChatwootClient } from './shared/api-client.js';
// Admin panel imports
import { handleAdminRoute, tokenService, auditService, toolInstructionService, initializeDatabase } from './admin/index.js';
const client = new ChatwootClient();
// Helper function to download file from URL
async function downloadFileFromUrl(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    downloadFileFromUrl(redirectUrl).then(resolve).catch(reject);
                    return;
                }
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
                return;
            }
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                // Extract filename from URL or Content-Disposition header
                const contentDisposition = response.headers['content-disposition'];
                let fileName = 'attachment';
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (match && match[1]) {
                        fileName = match[1].replace(/['"]/g, '');
                    }
                }
                else {
                    // Extract from URL path
                    const urlPath = new URL(url).pathname;
                    const pathFileName = urlPath.split('/').pop();
                    if (pathFileName) {
                        fileName = pathFileName;
                    }
                }
                const contentType = response.headers['content-type'] || 'application/octet-stream';
                resolve({ buffer, fileName, contentType });
            });
            response.on('error', reject);
        }).on('error', reject);
    });
}
// Legacy API Key for backward compatibility
const LEGACY_API_KEY = process.env.MCP_API_KEY || 'chatwoot-mcp-secret-key';
// ============ MCP PROTOCOL TOOLS DEFINITION ============
// Tools disponíveis para o protocolo MCP (JSON-RPC)
const mcpTools = [
    // === SPECIALISTS (AGENDA/CALENDÁRIO) ===
    {
        name: 'list_specialists',
        description: 'Lista todos os especialistas/profissionais disponíveis para agendamento. IMPORTANTE: Use esta tool PRIMEIRO para obter o "id" do especialista antes de criar um agendamento. Retorna: id, name, email, phone, availabilities (horários disponíveis por dia da semana).',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'search_specialist_by_name',
        description: 'Busca um especialista pelo nome. Use quando o usuário mencionar o nome de um profissional para agendar. Retorna o especialista com seu "id" que deve ser usado em create_appointment.',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string', description: 'Nome ou parte do nome do especialista para buscar' },
            },
        },
    },
    {
        name: 'create_specialist',
        description: 'Cria um novo especialista/profissional no sistema de agendamento',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string', description: 'Nome do especialista' },
                email: { type: 'string', description: 'Email do especialista' },
                phone: { type: 'string', description: 'Telefone do especialista' },
                active: { type: 'boolean', description: 'Se está ativo' },
            },
        },
    },
    {
        name: 'get_specialist',
        description: 'Obtém detalhes completos de um especialista pelo ID, incluindo horários de disponibilidade',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: { type: 'number', description: 'ID do especialista (obtido de list_specialists ou search_specialist_by_name)' },
            },
        },
    },
    {
        name: 'get_available_slots',
        description: 'Obtém os horários disponíveis de um especialista para uma data específica. Use para verificar disponibilidade antes de criar um agendamento.',
        inputSchema: {
            type: 'object',
            required: ['specialist_id', 'date'],
            properties: {
                specialist_id: { type: 'number', description: 'ID do especialista (obtido de list_specialists ou search_specialist_by_name)' },
                date: { type: 'string', description: 'Data para verificar disponibilidade (formato: YYYY-MM-DD)' },
            },
        },
    },
    // === APPOINTMENTS (AGENDAMENTOS) ===
    {
        name: 'list_appointments',
        description: 'Lista todos os agendamentos. Pode filtrar por especialista ou status.',
        inputSchema: {
            type: 'object',
            properties: {
                specialist_id: { type: 'number', description: 'Filtrar por especialista (opcional)' },
                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'], description: 'Filtrar por status (opcional)' },
            },
        },
    },
    {
        name: 'create_appointment',
        description: `ATENÇÃO: Antes de usar esta tool, você DEVE executar os passos abaixo na ordem:

PASSO 1: Buscar especialista
- Use search_specialist_by_name com o nome do profissional
- Guarde o "id" retornado como specialist_id

PASSO 2: Verificar horários disponíveis
- Use get_available_slots com specialist_id e a data desejada
- Confirme o horário com o cliente

PASSO 3: Buscar ou cadastrar o cliente (OBRIGATÓRIO)
- Use search_contact_by_phone com o telefone do cliente
- Se encontrar: use o "id" retornado como contact_id
- Se NÃO encontrar: use create_contact para cadastrar, depois use o "id" retornado

PASSO 4: Criar o agendamento
- Passe TODOS os campos obrigatórios incluindo contact_id

⚠️ SEM contact_id o cliente NÃO aparecerá como participante do evento no calendário!`,
        inputSchema: {
            type: 'object',
            required: ['title', 'specialist_id', 'start_time', 'end_time', 'contact_id'],
            properties: {
                title: { type: 'string', description: 'Título do agendamento (ex: "Consulta - Nome do Paciente")' },
                description: { type: 'string', description: 'Detalhes: nome do paciente, telefone, observações' },
                specialist_id: { type: 'number', description: 'ID do especialista (OBRIGATÓRIO) - obtenha do PASSO 1' },
                start_time: { type: 'string', description: 'Data/hora início ISO 8601 (ex: 2026-01-20T14:00:00-03:00)' },
                end_time: { type: 'string', description: 'Data/hora fim ISO 8601 (ex: 2026-01-20T15:00:00-03:00)' },
                contact_id: { type: 'number', description: 'ID do cliente (OBRIGATÓRIO) - obtenha do PASSO 3. Sem este campo o cliente não aparece no evento!' },
            },
        },
    },
    {
        name: 'get_appointment',
        description: 'Obtém detalhes de um agendamento específico pelo ID',
        inputSchema: {
            type: 'object',
            required: ['appointment_id'],
            properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento' },
            },
        },
    },
    {
        name: 'update_appointment',
        description: 'Atualiza um agendamento existente (título, status, horários)',
        inputSchema: {
            type: 'object',
            required: ['appointment_id'],
            properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento a atualizar' },
                title: { type: 'string', description: 'Novo título' },
                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'], description: 'Novo status' },
                start_time: { type: 'string', description: 'Nova data/hora início (ISO 8601)' },
                end_time: { type: 'string', description: 'Nova data/hora fim (ISO 8601)' },
            },
        },
    },
    {
        name: 'delete_appointment',
        description: 'Cancela/deleta um agendamento',
        inputSchema: {
            type: 'object',
            required: ['appointment_id'],
            properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento a deletar' },
            },
        },
    },
    // === APPOINTMENT ATTACHMENTS (ANEXOS DE AGENDAMENTOS) ===
    {
        name: 'list_appointment_attachments',
        description: 'Lista todos os anexos de um agendamento. Retorna informações sobre cada arquivo anexado incluindo nome, tipo, tamanho e URL de download.',
        inputSchema: {
            type: 'object',
            required: ['appointment_id'],
            properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento' },
            },
        },
    },
    {
        name: 'get_appointment_attachment',
        description: 'Obtém detalhes de um anexo específico de um agendamento.',
        inputSchema: {
            type: 'object',
            required: ['appointment_id', 'attachment_id'],
            properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento' },
                attachment_id: { type: 'number', description: 'ID do anexo' },
            },
        },
    },
    {
        name: 'delete_appointment_attachment',
        description: 'Remove um anexo de um agendamento.',
        inputSchema: {
            type: 'object',
            required: ['appointment_id', 'attachment_id'],
            properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento' },
                attachment_id: { type: 'number', description: 'ID do anexo a remover' },
            },
        },
    },
    {
        name: 'download_appointment_attachment',
        description: 'Obtém a URL de download de um anexo de agendamento. Retorna uma URL segura e assinada que pode ser usada para baixar o arquivo. Útil para enviar links de documentos anexados ao cliente.',
        inputSchema: {
            type: 'object',
            required: ['appointment_id', 'attachment_id'],
            properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento' },
                attachment_id: { type: 'number', description: 'ID do anexo para download' },
            },
        },
    },
    {
        name: 'upload_appointment_attachment',
        description: `Faz upload de um arquivo como anexo de um agendamento. Use para anexar documentos, exames, receitas ou outros arquivos relevantes ao agendamento.

OPÇÕES DE UPLOAD:
1. Via URL: Forneça file_url com a URL pública do arquivo para download
2. Via Base64: Forneça file_content com o conteúdo codificado em base64 e file_name com o nome do arquivo

IMPORTANTE: Apenas uma das opções deve ser usada (file_url OU file_content+file_name)`,
        inputSchema: {
            type: 'object',
            required: ['appointment_id'],
            properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento para anexar o arquivo' },
                file_url: { type: 'string', description: 'URL pública do arquivo para download e anexação' },
                file_content: { type: 'string', description: 'Conteúdo do arquivo codificado em base64' },
                file_name: { type: 'string', description: 'Nome do arquivo (obrigatório quando usar file_content)' },
                file_type: { type: 'string', description: 'Tipo MIME do arquivo (ex: application/pdf, image/jpeg). Opcional.' },
            },
        },
    },
    // === CONTACTS (CLIENTES) ===
    {
        name: 'search_contact_by_phone',
        description: `Busca cliente pelo telefone. EXECUTE SEMPRE ANTES de create_appointment!
- Se encontrar: pegue o "id" do contato e use como contact_id no create_appointment
- Se NÃO encontrar: use create_contact para cadastrar, depois pegue o "id" retornado
O "id" do contato é OBRIGATÓRIO para criar agendamentos!`,
        inputSchema: {
            type: 'object',
            required: ['phone_number'],
            properties: {
                phone_number: { type: 'string', description: 'Telefone do cliente (ex: 21999999999)' },
            },
        },
    },
    {
        name: 'list_contacts',
        description: 'Lista todos os contatos/clientes cadastrados',
        inputSchema: {
            type: 'object',
            properties: {
                page: { type: 'number', description: 'Número da página' },
            },
        },
    },
    {
        name: 'create_contact',
        description: `Cria um novo contato/cliente. Use quando search_contact_by_phone não encontrar o cliente. Após criar, use o "id" retornado como contact_id no create_appointment.`,
        inputSchema: {
            type: 'object',
            required: ['name', 'phone_number'],
            properties: {
                name: { type: 'string', description: 'Nome completo do cliente' },
                email: { type: 'string', description: 'Email do cliente (opcional)' },
                phone_number: { type: 'string', description: 'Telefone do cliente com DDD (ex: +5521999999999)' },
            },
        },
    },
    {
        name: 'get_contact',
        description: 'Obtém detalhes completos de um contato pelo ID',
        inputSchema: {
            type: 'object',
            required: ['contact_id'],
            properties: {
                contact_id: { type: 'number', description: 'ID do contato' },
            },
        },
    },
    {
        name: 'search_contacts',
        description: 'Busca contatos por termo',
        inputSchema: {
            type: 'object',
            required: ['q'],
            properties: {
                q: { type: 'string', description: 'Termo de busca' },
            },
        },
    },
    {
        name: 'get_contact_appointments',
        description: 'Obtém todos os agendamentos de um contato específico. Retorna lista de agendamentos com detalhes do especialista e anexos.',
        inputSchema: {
            type: 'object',
            required: ['contact_id'],
            properties: {
                contact_id: { type: 'number', description: 'ID do contato para buscar agendamentos' },
            },
        },
    },
    // === CONVERSATIONS ===
    {
        name: 'list_conversations',
        description: 'Lista todas as conversas',
        inputSchema: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['open', 'resolved', 'pending'] },
                inbox_id: { type: 'number', description: 'Filtrar por inbox' },
            },
        },
    },
    {
        name: 'get_conversation',
        description: 'Obtém detalhes de uma conversa pelo ID',
        inputSchema: {
            type: 'object',
            required: ['conversation_id'],
            properties: {
                conversation_id: { type: 'number', description: 'ID da conversa' },
            },
        },
    },
    {
        name: 'list_messages',
        description: 'Lista mensagens de uma conversa',
        inputSchema: {
            type: 'object',
            required: ['conversation_id'],
            properties: {
                conversation_id: { type: 'number', description: 'ID da conversa' },
            },
        },
    },
    {
        name: 'create_message',
        description: 'Envia uma mensagem em uma conversa',
        inputSchema: {
            type: 'object',
            required: ['conversation_id', 'content'],
            properties: {
                conversation_id: { type: 'number', description: 'ID da conversa' },
                content: { type: 'string', description: 'Conteúdo da mensagem' },
                private: { type: 'boolean', description: 'Se é nota interna' },
            },
        },
    },
    // === AGENTS ===
    {
        name: 'list_agents',
        description: 'Lista todos os agentes',
        inputSchema: { type: 'object', properties: {} },
    },
    // === INBOXES ===
    {
        name: 'list_inboxes',
        description: 'Lista todas as inboxes (canais)',
        inputSchema: { type: 'object', properties: {} },
    },
    // === TEAMS ===
    {
        name: 'list_teams',
        description: 'Lista todos os times',
        inputSchema: { type: 'object', properties: {} },
    },
    // === LABELS ===
    {
        name: 'list_labels',
        description: 'Lista todas as labels/etiquetas disponíveis na conta',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'list_conversation_labels',
        description: 'Lista todas as labels/etiquetas atribuídas a uma conversa. Labels representam etapas do funil de vendas.',
        inputSchema: {
            type: 'object',
            required: ['conversation_id'],
            properties: {
                conversation_id: { type: 'number', description: 'ID da conversa' },
            },
        },
    },
    {
        name: 'add_conversation_labels',
        description: `Adiciona labels/etiquetas a uma conversa para marcar a etapa do funil.
IMPORTANTE: As labels devem existir previamente na conta. Use list_labels para ver as disponíveis.
Exemplo de uso: ["Novo Lead", "Em Negociação", "Agendado"]`,
        inputSchema: {
            type: 'object',
            required: ['conversation_id', 'labels'],
            properties: {
                conversation_id: { type: 'number', description: 'ID da conversa' },
                labels: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array com os nomes das labels a adicionar (ex: ["Novo Lead", "Agendado"])',
                },
            },
        },
    },
    {
        name: 'list_contact_labels',
        description: 'Lista todas as labels/etiquetas atribuídas a um contato.',
        inputSchema: {
            type: 'object',
            required: ['contact_id'],
            properties: {
                contact_id: { type: 'number', description: 'ID do contato' },
            },
        },
    },
    {
        name: 'add_contact_labels',
        description: `Adiciona labels/etiquetas a um contato.
IMPORTANTE: As labels devem existir previamente na conta. Use list_labels para ver as disponíveis.`,
        inputSchema: {
            type: 'object',
            required: ['contact_id', 'labels'],
            properties: {
                contact_id: { type: 'number', description: 'ID do contato' },
                labels: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array com os nomes das labels a adicionar',
                },
            },
        },
    },
    // === REPORTS ===
    {
        name: 'get_reports',
        description: 'Obtém relatórios',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Tipo de relatório' },
                since: { type: 'string', description: 'Data inicial' },
                until: { type: 'string', description: 'Data final' },
            },
        },
    },
    {
        name: 'get_report_summary',
        description: 'Obtém resumo de relatórios',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Tipo de relatório' },
                since: { type: 'string', description: 'Data inicial' },
                until: { type: 'string', description: 'Data final' },
            },
        },
    },
    // === WAITLIST (LISTA DE ESPERA) ===
    {
        name: 'list_waitlist_entries',
        description: 'Lista todas as entradas na lista de espera. Pode filtrar por especialista, contato ou status.',
        inputSchema: {
            type: 'object',
            properties: {
                specialist_id: { type: 'number', description: 'Filtrar por ID do especialista' },
                contact_id: { type: 'number', description: 'Filtrar por ID do contato' },
                status: { type: 'string', enum: ['pending', 'notified', 'accepted', 'declined', 'expired', 'cancelled'], description: 'Filtrar por status' },
                page: { type: 'number', description: 'Número da página' },
            },
        },
    },
    {
        name: 'create_waitlist_entry',
        description: `Adiciona um contato na lista de espera de um especialista.

PASSOS ANTES DE USAR:
1. Use search_specialist_by_name para obter o specialist_id
2. Use search_contact_by_phone para obter o contact_id (ou create_contact se não existir)

A entrada ficará com status "pending" até que um horário fique disponível.`,
        inputSchema: {
            type: 'object',
            required: ['specialist_id', 'contact_id'],
            properties: {
                specialist_id: { type: 'number', description: 'ID do especialista (obrigatório)' },
                contact_id: { type: 'number', description: 'ID do contato (obrigatório)' },
                preferred_date: { type: 'string', description: 'Data preferencial (formato: YYYY-MM-DD)' },
                preferred_time_start: { type: 'string', description: 'Horário inicial preferencial (formato: HH:MM)' },
                preferred_time_end: { type: 'string', description: 'Horário final preferencial (formato: HH:MM)' },
                notes: { type: 'string', description: 'Observações sobre a preferência do paciente' },
                priority: { type: 'number', description: 'Prioridade (1=alta, 2=média, 3=baixa). Padrão: 2' },
            },
        },
    },
    {
        name: 'get_waitlist_entry',
        description: 'Obtém detalhes de uma entrada específica na lista de espera',
        inputSchema: {
            type: 'object',
            required: ['waitlist_entry_id'],
            properties: {
                waitlist_entry_id: { type: 'number', description: 'ID da entrada na lista de espera' },
            },
        },
    },
    {
        name: 'update_waitlist_entry',
        description: 'Atualiza uma entrada na lista de espera (preferências, notas, prioridade)',
        inputSchema: {
            type: 'object',
            required: ['waitlist_entry_id'],
            properties: {
                waitlist_entry_id: { type: 'number', description: 'ID da entrada na lista de espera' },
                preferred_date: { type: 'string', description: 'Nova data preferencial (formato: YYYY-MM-DD)' },
                preferred_time_start: { type: 'string', description: 'Novo horário inicial preferencial (formato: HH:MM)' },
                preferred_time_end: { type: 'string', description: 'Novo horário final preferencial (formato: HH:MM)' },
                notes: { type: 'string', description: 'Novas observações' },
                priority: { type: 'number', description: 'Nova prioridade (1=alta, 2=média, 3=baixa)' },
            },
        },
    },
    {
        name: 'delete_waitlist_entry',
        description: 'Remove uma entrada da lista de espera (cancela a espera do paciente)',
        inputSchema: {
            type: 'object',
            required: ['waitlist_entry_id'],
            properties: {
                waitlist_entry_id: { type: 'number', description: 'ID da entrada na lista de espera a remover' },
            },
        },
    },
    {
        name: 'accept_waitlist_slot',
        description: `Aceita uma vaga oferecida da lista de espera.

Quando um horário fica disponível, o sistema notifica o paciente na lista de espera.
Use esta tool quando o paciente confirmar que deseja a vaga.
Isso criará automaticamente um agendamento para o paciente.`,
        inputSchema: {
            type: 'object',
            required: ['waitlist_entry_id'],
            properties: {
                waitlist_entry_id: { type: 'number', description: 'ID da entrada na lista de espera' },
                slot_start_time: { type: 'string', description: 'Horário de início da vaga aceita (ISO 8601)' },
                slot_end_time: { type: 'string', description: 'Horário de término da vaga aceita (ISO 8601)' },
            },
        },
    },
    {
        name: 'decline_waitlist_slot',
        description: `Recusa uma vaga oferecida da lista de espera.

Quando o paciente não pode aceitar a vaga oferecida, use esta tool.
A entrada volta para "pending" e o próximo na fila será notificado.`,
        inputSchema: {
            type: 'object',
            required: ['waitlist_entry_id'],
            properties: {
                waitlist_entry_id: { type: 'number', description: 'ID da entrada na lista de espera' },
                reason: { type: 'string', description: 'Motivo da recusa (opcional)' },
            },
        },
    },
    {
        name: 'get_waitlist_notification_setting',
        description: 'Obtém as configurações de notificação da lista de espera de um especialista',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: { type: 'number', description: 'ID do especialista' },
            },
        },
    },
    {
        name: 'update_waitlist_notification_setting',
        description: 'Atualiza as configurações de notificação da lista de espera de um especialista',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: { type: 'number', description: 'ID do especialista' },
                enabled: { type: 'boolean', description: 'Se as notificações automáticas estão ativas' },
                notification_template: { type: 'string', description: 'Template da mensagem. Placeholders: {{contact_name}}, {{specialist_name}}, {{slot_date}}, {{slot_time}}' },
                response_timeout_hours: { type: 'number', description: 'Horas para o paciente responder' },
                max_notifications_per_slot: { type: 'number', description: 'Máximo de pacientes a notificar por vaga' },
                auto_expire_hours: { type: 'number', description: 'Horas até a entrada expirar automaticamente' },
            },
        },
    },
];
// Executa uma tool MCP
async function executeMcpTool(name, args) {
    console.log(`[MCP TOOL] ${name}`, JSON.stringify(args));
    switch (name) {
        // Specialists
        case 'list_specialists':
            return await client.get(client.accountPath('/specialists'));
        case 'search_specialist_by_name': {
            // Busca especialista pelo nome (busca parcial, case-insensitive)
            const searchName = args.name.toLowerCase();
            const specialists = await client.get(client.accountPath('/specialists'));
            const found = specialists.filter((s) => s.name.toLowerCase().includes(searchName));
            if (found.length === 0) {
                return {
                    message: `Nenhum especialista encontrado com o nome "${args.name}"`,
                    suggestion: 'Use list_specialists para ver todos os especialistas disponíveis',
                    specialists: []
                };
            }
            return {
                message: `Encontrado(s) ${found.length} especialista(s)`,
                specialists: found.map((s) => ({
                    id: s.id,
                    name: s.name,
                    email: s.email,
                    phone: s.phone,
                    active: s.active,
                    availabilities: s.availabilities
                }))
            };
        }
        case 'create_specialist':
            return await client.post(client.accountPath('/specialists'), args);
        case 'get_specialist':
            return await client.get(client.accountPath(`/specialists/${args.specialist_id}`));
        case 'get_available_slots': {
            // Obtém horários disponíveis para uma data específica
            const specialistId = args.specialist_id;
            const date = args.date;
            return await client.get(client.accountPath(`/specialists/${specialistId}/available_slots`), { date });
        }
        // Appointments
        case 'list_appointments':
            return await client.get(client.accountPath('/appointments'), args);
        case 'create_appointment': {
            // Chatwoot API espera: { appointment: { ..., contact_ids: [id] } }
            const appointmentData = {
                title: args.title,
                specialist_id: args.specialist_id,
                start_time: args.start_time,
                end_time: args.end_time,
            };
            if (args.description) {
                appointmentData.description = args.description;
            }
            // Converter contact_id para contact_ids (array)
            if (args.contact_id) {
                appointmentData.contact_ids = [args.contact_id];
            }
            return await client.post(client.accountPath('/appointments'), { appointment: appointmentData });
        }
        case 'get_appointment':
            return await client.get(client.accountPath(`/appointments/${args.appointment_id}`));
        case 'update_appointment': {
            const id = args.appointment_id;
            const data = { ...args };
            delete data.appointment_id;
            return await client.patch(client.accountPath(`/appointments/${id}`), data);
        }
        case 'delete_appointment':
            await client.delete(client.accountPath(`/appointments/${args.appointment_id}`));
            return { success: true, message: `Appointment ${args.appointment_id} deleted` };
        // Appointment Attachments
        case 'list_appointment_attachments':
            return await client.get(client.accountPath(`/appointments/${args.appointment_id}/attachments`));
        case 'get_appointment_attachment':
            return await client.get(client.accountPath(`/appointments/${args.appointment_id}/attachments/${args.attachment_id}`));
        case 'delete_appointment_attachment':
            await client.delete(client.accountPath(`/appointments/${args.appointment_id}/attachments/${args.attachment_id}`));
            return { success: true, message: `Attachment ${args.attachment_id} deleted from appointment ${args.appointment_id}` };
        case 'download_appointment_attachment': {
            // Get the attachment details which includes the download URL
            const attachment = await client.get(client.accountPath(`/appointments/${args.appointment_id}/attachments/${args.attachment_id}`));
            return {
                attachment_id: attachment.id,
                file_name: attachment.file_name,
                file_type: attachment.file_type,
                file_size: attachment.file_size,
                download_url: attachment.download_url,
                file_url: attachment.file_url,
                message: `URL de download para o arquivo "${attachment.file_name}": ${attachment.download_url || attachment.file_url}`
            };
        }
        case 'upload_appointment_attachment': {
            const appointmentId = args.appointment_id;
            const fileUrl = args.file_url;
            const fileContent = args.file_content;
            const fileName = args.file_name;
            const fileType = args.file_type;
            if (!fileUrl && !fileContent) {
                return { error: true, message: 'Forneça file_url ou file_content para fazer upload' };
            }
            let buffer;
            let finalFileName;
            let finalFileType;
            if (fileUrl) {
                // Download file from URL
                const downloadResult = await downloadFileFromUrl(fileUrl);
                buffer = downloadResult.buffer;
                finalFileName = downloadResult.fileName;
                finalFileType = downloadResult.contentType;
            }
            else if (fileContent && fileName) {
                // Decode base64 content
                buffer = Buffer.from(fileContent, 'base64');
                finalFileName = fileName;
                finalFileType = fileType || 'application/octet-stream';
            }
            else {
                return { error: true, message: 'Quando usar file_content, file_name é obrigatório' };
            }
            // Create FormData and upload
            const formData = new FormData();
            formData.append('attachment[file]', buffer, {
                filename: finalFileName,
                contentType: finalFileType,
            });
            const uploadResult = await client.postFormData(client.accountPath(`/appointments/${appointmentId}/attachments`), formData);
            return {
                success: true,
                message: `Arquivo "${finalFileName}" anexado com sucesso ao agendamento ${appointmentId}`,
                attachment: {
                    id: uploadResult.id,
                    file_name: uploadResult.file_name,
                    file_type: uploadResult.file_type,
                    file_size: uploadResult.file_size,
                }
            };
        }
        // Contacts
        case 'search_contact_by_phone': {
            // Busca contato pelo telefone (usa a API de search do Chatwoot)
            const phoneNumber = args.phone_number.replace(/\D/g, ''); // Remove não-dígitos
            const searchResult = await client.get(client.accountPath('/contacts/search'), { q: phoneNumber });
            // Filtra resultados que contenham o número de telefone
            const contacts = searchResult?.payload || searchResult || [];
            const found = Array.isArray(contacts) ? contacts.filter((c) => {
                const contactPhone = (c.phone_number || '').replace(/\D/g, '');
                return contactPhone.includes(phoneNumber) || phoneNumber.includes(contactPhone);
            }) : [];
            if (found.length === 0) {
                return {
                    found: false,
                    message: `Nenhum contato encontrado com o telefone "${args.phone_number}". Use create_contact para cadastrar o cliente.`,
                    contacts: []
                };
            }
            return {
                found: true,
                message: `Encontrado(s) ${found.length} contato(s). Use o "id" do contato no campo contact_id do create_appointment.`,
                contacts: found.map((c) => ({
                    id: c.id,
                    name: c.name,
                    phone_number: c.phone_number,
                    email: c.email
                }))
            };
        }
        case 'list_contacts':
            return await client.get(client.accountPath('/contacts'), args);
        case 'create_contact':
            return await client.post(client.accountPath('/contacts'), args);
        case 'get_contact':
            return await client.get(client.accountPath(`/contacts/${args.contact_id}`));
        case 'search_contacts':
            return await client.get(client.accountPath('/contacts/search'), args);
        case 'get_contact_appointments':
            return await client.get(client.accountPath(`/contacts/${args.contact_id}/appointments`));
        // Conversations
        case 'list_conversations':
            return await client.get(client.accountPath('/conversations'), args);
        case 'get_conversation':
            return await client.get(client.accountPath(`/conversations/${args.conversation_id}`));
        case 'list_messages':
            return await client.get(client.accountPath(`/conversations/${args.conversation_id}/messages`));
        case 'create_message': {
            const convId = args.conversation_id;
            const msgData = { ...args };
            delete msgData.conversation_id;
            return await client.post(client.accountPath(`/conversations/${convId}/messages`), msgData);
        }
        // Others
        case 'list_agents':
            return await client.get(client.accountPath('/agents'));
        case 'list_inboxes':
            return await client.get(client.accountPath('/inboxes'));
        case 'list_teams':
            return await client.get(client.accountPath('/teams'));
        case 'list_labels':
            return await client.get(client.accountPath('/labels'));
        case 'list_conversation_labels': {
            const conversationId = args.conversation_id;
            return await client.get(client.accountPath(`/conversations/${conversationId}/labels`));
        }
        case 'add_conversation_labels': {
            const conversationId = args.conversation_id;
            const labels = args.labels;
            // Adiciona labels na conversa
            const conversationResult = await client.post(client.accountPath(`/conversations/${conversationId}/labels`), { labels });
            // Busca a conversa para obter o contact_id e sincronizar
            try {
                const conversation = await client.get(client.accountPath(`/conversations/${conversationId}`));
                const contactId = conversation?.meta?.sender?.id;
                if (contactId) {
                    // Busca labels atuais do contato
                    const currentContactLabels = await client.get(client.accountPath(`/contacts/${contactId}/labels`));
                    const currentLabels = currentContactLabels?.payload || [];
                    // Mescla labels existentes com as novas (sem duplicar)
                    const mergedLabels = [...new Set([...currentLabels, ...labels])];
                    // Adiciona as mesmas labels no contato
                    await client.post(client.accountPath(`/contacts/${contactId}/labels`), { labels: mergedLabels });
                }
            }
            catch (e) {
                // Se falhar ao sincronizar com contato, não interrompe - labels da conversa já foram adicionadas
                console.error('[Labels] Falha ao sincronizar labels com contato:', e);
            }
            return conversationResult;
        }
        case 'list_contact_labels': {
            const contactId = args.contact_id;
            return await client.get(client.accountPath(`/contacts/${contactId}/labels`));
        }
        case 'add_contact_labels': {
            const contactId = args.contact_id;
            const labels = args.labels;
            // Adiciona labels no contato
            const contactResult = await client.post(client.accountPath(`/contacts/${contactId}/labels`), { labels });
            // Busca conversas do contato para sincronizar
            try {
                const contactConversations = await client.get(client.accountPath(`/contacts/${contactId}/conversations`));
                const conversations = contactConversations?.payload || [];
                // Adiciona labels em todas as conversas abertas do contato
                for (const conv of conversations) {
                    if (conv.status === 'open' || conv.status === 'pending') {
                        try {
                            // Busca labels atuais da conversa
                            const currentConvLabels = await client.get(client.accountPath(`/conversations/${conv.id}/labels`));
                            const currentLabels = currentConvLabels?.payload || [];
                            // Mescla labels existentes com as novas
                            const mergedLabels = [...new Set([...currentLabels, ...labels])];
                            await client.post(client.accountPath(`/conversations/${conv.id}/labels`), { labels: mergedLabels });
                        }
                        catch (e) {
                            console.error(`[Labels] Falha ao sincronizar labels com conversa ${conv.id}:`, e);
                        }
                    }
                }
            }
            catch (e) {
                console.error('[Labels] Falha ao sincronizar labels com conversas:', e);
            }
            return contactResult;
        }
        case 'get_reports':
            return await client.get(client.accountPath('/reports'), args);
        case 'get_report_summary':
            return await client.get(client.accountPath('/reports/summary'), args);
        // Waitlist Entries
        case 'list_waitlist_entries': {
            const params = {};
            if (args.specialist_id)
                params.specialist_id = args.specialist_id;
            if (args.contact_id)
                params.contact_id = args.contact_id;
            if (args.status)
                params.status = args.status;
            if (args.page)
                params.page = args.page;
            return await client.get(client.accountPath('/appointment_waitlist_entries'), params);
        }
        case 'create_waitlist_entry': {
            const entryData = {
                specialist_id: args.specialist_id,
                contact_id: args.contact_id,
            };
            if (args.preferred_date)
                entryData.preferred_date = args.preferred_date;
            if (args.preferred_time_start)
                entryData.preferred_time_start = args.preferred_time_start;
            if (args.preferred_time_end)
                entryData.preferred_time_end = args.preferred_time_end;
            if (args.notes)
                entryData.notes = args.notes;
            if (args.priority !== undefined)
                entryData.priority = args.priority;
            return await client.post(client.accountPath('/appointment_waitlist_entries'), {
                appointment_waitlist_entry: entryData
            });
        }
        case 'get_waitlist_entry': {
            const entryId = args.waitlist_entry_id;
            return await client.get(client.accountPath(`/appointment_waitlist_entries/${entryId}`));
        }
        case 'update_waitlist_entry': {
            const entryId = args.waitlist_entry_id;
            const updateData = {};
            if (args.preferred_date)
                updateData.preferred_date = args.preferred_date;
            if (args.preferred_time_start)
                updateData.preferred_time_start = args.preferred_time_start;
            if (args.preferred_time_end)
                updateData.preferred_time_end = args.preferred_time_end;
            if (args.notes !== undefined)
                updateData.notes = args.notes;
            if (args.priority !== undefined)
                updateData.priority = args.priority;
            return await client.patch(client.accountPath(`/appointment_waitlist_entries/${entryId}`), {
                appointment_waitlist_entry: updateData
            });
        }
        case 'delete_waitlist_entry': {
            const entryId = args.waitlist_entry_id;
            await client.delete(client.accountPath(`/appointment_waitlist_entries/${entryId}`));
            return { success: true, message: `Entrada da lista de espera ${entryId} removida` };
        }
        case 'accept_waitlist_slot': {
            const entryId = args.waitlist_entry_id;
            const acceptData = {};
            if (args.slot_start_time)
                acceptData.slot_start_time = args.slot_start_time;
            if (args.slot_end_time)
                acceptData.slot_end_time = args.slot_end_time;
            const result = await client.post(client.accountPath(`/appointment_waitlist_entries/${entryId}/accept`), acceptData);
            return {
                success: true,
                message: 'Vaga aceita! Um agendamento foi criado automaticamente.',
                data: result
            };
        }
        case 'decline_waitlist_slot': {
            const entryId = args.waitlist_entry_id;
            const declineData = {};
            if (args.reason)
                declineData.reason = args.reason;
            const result = await client.post(client.accountPath(`/appointment_waitlist_entries/${entryId}/decline`), declineData);
            return {
                success: true,
                message: 'Vaga recusada. A entrada voltou para a lista de espera.',
                data: result
            };
        }
        case 'get_waitlist_notification_setting': {
            const specialistId = args.specialist_id;
            return await client.get(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`));
        }
        case 'update_waitlist_notification_setting': {
            const specialistId = args.specialist_id;
            const settingData = {};
            if (args.enabled !== undefined)
                settingData.enabled = args.enabled;
            if (args.notification_template !== undefined)
                settingData.notification_template = args.notification_template;
            if (args.response_timeout_hours !== undefined)
                settingData.response_timeout_hours = args.response_timeout_hours;
            if (args.max_notifications_per_slot !== undefined)
                settingData.max_notifications_per_slot = args.max_notifications_per_slot;
            if (args.auto_expire_hours !== undefined)
                settingData.auto_expire_hours = args.auto_expire_hours;
            return await client.patch(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`), {
                waitlist_notification_setting: settingData
            });
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
// Processa mensagem JSON-RPC do protocolo MCP
async function processMcpJsonRpc(message) {
    const { id, method, params } = message;
    console.log(`[MCP JSON-RPC] ${method}`, params ? JSON.stringify(params) : '');
    try {
        let result;
        switch (method) {
            case 'initialize':
                result = {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {},
                    },
                    serverInfo: {
                        name: 'chatwoot-mcp',
                        version: '1.0.0',
                    },
                };
                break;
            case 'notifications/initialized':
                return null; // Notificação, sem resposta
            case 'tools/list':
                // Get tools with custom instructions applied, filtering disabled tools
                const enabledTools = await toolInstructionService.getEnabledTools(mcpTools);
                result = { tools: enabledTools };
                break;
            case 'tools/call': {
                const toolName = params?.name;
                const toolArgs = (params?.arguments || {});
                if (!toolName) {
                    throw new Error('Tool name is required');
                }
                const toolResult = await executeMcpTool(toolName, toolArgs);
                result = {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(toolResult, null, 2),
                        },
                    ],
                };
                break;
            }
            case 'ping':
                result = {};
                break;
            default:
                return {
                    jsonrpc: '2.0',
                    id,
                    error: { code: -32601, message: `Method not found: ${method}` },
                };
        }
        return { jsonrpc: '2.0', id, result };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[MCP ERROR] ${errorMessage}`);
        return {
            jsonrpc: '2.0',
            id,
            error: { code: -32603, message: errorMessage },
        };
    }
}
// Skip token validation for local development (INSECURE)
const SKIP_TOKEN_VALIDATION = process.env.SKIP_TOKEN_VALIDATION === 'true';
// CORS - origens permitidas (separadas por vírgula)
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());
// Rate limiting map (per token/IP)
const rateLimitMap = new Map();
// Flag to track if database is initialized
let dbInitialized = false;
const server = http.createServer(async (req, res) => {
    // CORS headers
    const origin = req.headers.origin || '*';
    const isAllowed = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
    res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : ALLOWED_ORIGINS[0]);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Account-Id');
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    // Parse URL
    const authUrl = new URL(req.url || '/', `http://${req.headers.host}`);
    // Handle admin routes first
    if (authUrl.pathname.startsWith('/admin')) {
        let adminBody = {};
        if (req.method !== 'GET' && req.method !== 'DELETE') {
            adminBody = await parseBody(req);
        }
        const handled = await handleAdminRoute(req, res, authUrl.pathname, adminBody, mcpTools);
        if (handled)
            return;
    }
    // Get client info for audit logging
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];
    // Token validation context
    let tokenId;
    let tokenPermissions;
    // Verificar API Key (exceto para health check)
    if (authUrl.pathname !== '/' && authUrl.pathname !== '/health') {
        // Skip validation if SKIP_TOKEN_VALIDATION is enabled (for testing only!)
        if (!SKIP_TOKEN_VALIDATION) {
            // Support both X-API-Key header and Authorization: Bearer header
            let apiKey = req.headers['x-api-key'];
            // If no X-API-Key, try Authorization: Bearer
            if (!apiKey) {
                const authHeader = req.headers['authorization'];
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
                }
            }
            // Validate token (supports both legacy and database tokens)
            const validation = await tokenService.validateApiToken(apiKey);
            if (!validation.valid) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Unauthorized', message: validation.error || 'Invalid or missing X-API-Key header' }));
                return;
            }
            // Check endpoint permission
            const permission = tokenService.getPermissionForEndpoint(req.method || 'GET', authUrl.pathname);
            if (permission && validation.permissions) {
                const hasPermission = tokenService.hasPermission(validation.permissions, permission.category, permission.action);
                if (!hasPermission) {
                    res.writeHead(403);
                    res.end(JSON.stringify({
                        error: 'Forbidden',
                        message: `Token lacks ${permission.action} permission for ${permission.category}`
                    }));
                    return;
                }
            }
            tokenId = validation.tokenId;
            tokenPermissions = validation.permissions;
        }
    }
    // Rate limiting simples (por IP)
    const now = Date.now();
    if (!rateLimitMap.has(clientIp)) {
        rateLimitMap.set(clientIp, { count: 0, resetTime: now + 60000 });
    }
    const rateLimit = rateLimitMap.get(clientIp);
    if (now > rateLimit.resetTime) {
        rateLimit.count = 0;
        rateLimit.resetTime = now + 60000;
    }
    rateLimit.count++;
    if (rateLimit.count > 100) { // 100 requests per minute
        res.writeHead(429);
        res.end(JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded. Try again later.' }));
        return;
    }
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams);
    try {
        let body = {};
        if (req.method !== 'GET' && req.method !== 'DELETE') {
            body = await parseBody(req);
        }
        // Get account_id from query params, body, or header
        const accountId = params.account_id ||
            body.account_id ||
            req.headers['x-account-id'];
        // Set dynamic account ID if provided
        if (accountId) {
            client.setAccountId(accountId);
            // Remove account_id from params/body so it doesn't get passed to the API
            delete params.account_id;
            delete body.account_id;
        }
        else {
            client.clearAccountId();
        }
        // Validate that we have an account ID (either dynamic or from config)
        // Skip validation for health check and MCP protocol endpoints (initialize, tools/list, ping don't need account_id)
        const isMcpJsonRpc = path === '/mcp' && req.method === 'POST' && body.jsonrpc;
        const skipAccountValidation = path === '/' || path === '/health' || path === '/mcp/tools' || isMcpJsonRpc;
        if (!skipAccountValidation && !client.accountId) {
            res.writeHead(400);
            res.end(JSON.stringify({
                error: 'Missing account_id',
                message: 'Please provide account_id via query parameter, request body, X-Account-Id header, or configure CHATWOOT_ACCOUNT_ID environment variable'
            }));
            return;
        }
        let result;
        // ============ CONTACTS ============
        if (path === '/contacts' && req.method === 'GET') {
            result = await client.get(client.accountPath('/contacts'), params);
        }
        else if (path === '/contacts' && req.method === 'POST') {
            result = await client.post(client.accountPath('/contacts'), body);
        }
        else if (path.match(/^\/contacts\/\d+$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/contacts/${id}`));
        }
        else if (path.match(/^\/contacts\/\d+$/) && req.method === 'PATCH') {
            const id = path.split('/')[2];
            result = await client.patch(client.accountPath(`/contacts/${id}`), body);
        }
        else if (path.match(/^\/contacts\/\d+$/) && req.method === 'DELETE') {
            const id = path.split('/')[2];
            await client.delete(client.accountPath(`/contacts/${id}`));
            result = { success: true, message: `Contact ${id} deleted` };
        }
        else if (path === '/contacts/search' && req.method === 'GET') {
            result = await client.get(client.accountPath('/contacts/search'), params);
        }
        else if (path === '/contacts/filter' && req.method === 'POST') {
            result = await client.post(client.accountPath('/contacts/filter'), body);
        }
        else if (path.match(/^\/contacts\/\d+\/conversations$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/contacts/${id}/conversations`));
        }
        else if (path.match(/^\/contacts\/\d+\/appointments$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/contacts/${id}/appointments`));
        }
        // ============ CONVERSATIONS ============
        else if (path === '/conversations' && req.method === 'GET') {
            result = await client.get(client.accountPath('/conversations'), params);
        }
        else if (path === '/conversations' && req.method === 'POST') {
            result = await client.post(client.accountPath('/conversations'), body);
        }
        else if (path.match(/^\/conversations\/\d+$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/conversations/${id}`));
        }
        else if (path.match(/^\/conversations\/\d+$/) && req.method === 'PATCH') {
            const id = path.split('/')[2];
            result = await client.patch(client.accountPath(`/conversations/${id}`), body);
        }
        else if (path.match(/^\/conversations\/\d+\/toggle_status$/) && req.method === 'POST') {
            const id = path.split('/')[2];
            result = await client.post(client.accountPath(`/conversations/${id}/toggle_status`), body);
        }
        else if (path.match(/^\/conversations\/\d+\/assignments$/) && req.method === 'POST') {
            const id = path.split('/')[2];
            result = await client.post(client.accountPath(`/conversations/${id}/assignments`), body);
        }
        else if (path.match(/^\/conversations\/\d+\/labels$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/conversations/${id}/labels`));
        }
        else if (path.match(/^\/conversations\/\d+\/labels$/) && req.method === 'POST') {
            const id = path.split('/')[2];
            result = await client.post(client.accountPath(`/conversations/${id}/labels`), body);
        }
        // ============ MESSAGES ============
        else if (path.match(/^\/conversations\/\d+\/messages$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/conversations/${id}/messages`), params);
        }
        else if (path.match(/^\/conversations\/\d+\/messages$/) && req.method === 'POST') {
            const id = path.split('/')[2];
            result = await client.post(client.accountPath(`/conversations/${id}/messages`), body);
        }
        // ============ AGENTS ============
        else if (path === '/agents' && req.method === 'GET') {
            result = await client.get(client.accountPath('/agents'));
        }
        else if (path.match(/^\/agents\/\d+$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/agents/${id}`));
        }
        // ============ INBOXES ============
        else if (path === '/inboxes' && req.method === 'GET') {
            result = await client.get(client.accountPath('/inboxes'));
        }
        else if (path.match(/^\/inboxes\/\d+$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/inboxes/${id}`));
        }
        else if (path.match(/^\/inboxes\/\d+\/agents$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/inboxes/${id}/agents`));
        }
        // ============ TEAMS ============
        else if (path === '/teams' && req.method === 'GET') {
            result = await client.get(client.accountPath('/teams'));
        }
        else if (path === '/teams' && req.method === 'POST') {
            result = await client.post(client.accountPath('/teams'), body);
        }
        else if (path.match(/^\/teams\/\d+$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/teams/${id}`));
        }
        else if (path.match(/^\/teams\/\d+$/) && req.method === 'PATCH') {
            const id = path.split('/')[2];
            result = await client.patch(client.accountPath(`/teams/${id}`), body);
        }
        else if (path.match(/^\/teams\/\d+$/) && req.method === 'DELETE') {
            const id = path.split('/')[2];
            await client.delete(client.accountPath(`/teams/${id}`));
            result = { success: true, message: `Team ${id} deleted` };
        }
        // ============ SPECIALISTS ============
        else if (path === '/specialists' && req.method === 'GET') {
            result = await client.get(client.accountPath('/specialists'), params);
        }
        else if (path === '/specialists' && req.method === 'POST') {
            result = await client.post(client.accountPath('/specialists'), body);
        }
        else if (path.match(/^\/specialists\/\d+$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/specialists/${id}`));
        }
        else if (path.match(/^\/specialists\/\d+$/) && req.method === 'PATCH') {
            const id = path.split('/')[2];
            result = await client.patch(client.accountPath(`/specialists/${id}`), body);
        }
        else if (path.match(/^\/specialists\/\d+$/) && req.method === 'DELETE') {
            const id = path.split('/')[2];
            await client.delete(client.accountPath(`/specialists/${id}`));
            result = { success: true, message: `Specialist ${id} deleted` };
        }
        else if (path.match(/^\/specialists\/\d+\/availabilities$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/specialists/${id}/availabilities`));
        }
        else if (path.match(/^\/specialists\/\d+\/availabilities$/) && req.method === 'PUT') {
            const id = path.split('/')[2];
            result = await client.put(client.accountPath(`/specialists/${id}/availabilities`), body);
        }
        else if (path.match(/^\/specialists\/\d+\/available_slots$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/specialists/${id}/available_slots`), params);
        }
        // Search specialist by name
        else if (path === '/specialists/search' && req.method === 'GET') {
            const searchName = ((params.name || params.q) || '').toLowerCase();
            const specialists = await client.get(client.accountPath('/specialists'));
            const found = specialists.filter((s) => s.name.toLowerCase().includes(searchName));
            if (found.length === 0) {
                result = {
                    message: `Nenhum especialista encontrado com o nome "${params.name || params.q}"`,
                    specialists: []
                };
            }
            else {
                result = {
                    message: `Encontrado(s) ${found.length} especialista(s)`,
                    specialists: found.map((s) => ({
                        id: s.id,
                        name: s.name,
                        email: s.email,
                        phone: s.phone,
                        active: s.active,
                        availabilities: s.availabilities
                    }))
                };
            }
        }
        // ============ APPOINTMENTS ============
        else if (path === '/appointments' && req.method === 'GET') {
            result = await client.get(client.accountPath('/appointments'), params);
        }
        else if (path === '/appointments' && req.method === 'POST') {
            result = await client.post(client.accountPath('/appointments'), body);
        }
        else if (path.match(/^\/appointments\/\d+$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/appointments/${id}`));
        }
        else if (path.match(/^\/appointments\/\d+$/) && req.method === 'PATCH') {
            const id = path.split('/')[2];
            result = await client.patch(client.accountPath(`/appointments/${id}`), body);
        }
        else if (path.match(/^\/appointments\/\d+$/) && req.method === 'DELETE') {
            const id = path.split('/')[2];
            await client.delete(client.accountPath(`/appointments/${id}`));
            result = { success: true, message: `Appointment ${id} deleted` };
        }
        // ============ APPOINTMENT ATTACHMENTS ============
        else if (path.match(/^\/appointments\/\d+\/attachments$/) && req.method === 'GET') {
            const appointmentId = path.split('/')[2];
            result = await client.get(client.accountPath(`/appointments/${appointmentId}/attachments`));
        }
        else if (path.match(/^\/appointments\/\d+\/attachments\/\d+$/) && req.method === 'GET') {
            const appointmentId = path.split('/')[2];
            const attachmentId = path.split('/')[4];
            result = await client.get(client.accountPath(`/appointments/${appointmentId}/attachments/${attachmentId}`));
        }
        else if (path.match(/^\/appointments\/\d+\/attachments\/\d+$/) && req.method === 'DELETE') {
            const appointmentId = path.split('/')[2];
            const attachmentId = path.split('/')[4];
            await client.delete(client.accountPath(`/appointments/${appointmentId}/attachments/${attachmentId}`));
            result = { success: true, message: `Attachment ${attachmentId} deleted from appointment ${appointmentId}` };
        }
        // POST - Upload attachment to appointment
        else if (path.match(/^\/appointments\/\d+\/attachments$/) && req.method === 'POST') {
            const appointmentId = parseInt(path.split('/')[2], 10);
            const fileUrl = body.file_url;
            const fileContent = body.file_content;
            const fileName = body.file_name;
            const fileType = body.file_type;
            const attachmentType = body.attachment_type || 'document'; // Required field
            if (!fileUrl && !fileContent) {
                result = { error: true, message: 'Forneça file_url ou file_content para fazer upload' };
            }
            else if (fileUrl) {
                // Download file from URL
                const downloadResult = await downloadFileFromUrl(fileUrl);
                const finalFileName = fileName || downloadResult.fileName;
                const finalFileType = fileType || downloadResult.contentType;
                const uploadFormData = new FormData();
                uploadFormData.append('attachment[file]', downloadResult.buffer, {
                    filename: finalFileName,
                    contentType: finalFileType,
                });
                uploadFormData.append('attachment[attachment_type]', attachmentType);
                const uploadResult = await client.postFormData(client.accountPath(`/appointments/${appointmentId}/attachments`), uploadFormData);
                result = {
                    success: true,
                    message: `Arquivo "${finalFileName}" (${attachmentType}) anexado com sucesso ao agendamento ${appointmentId}`,
                    attachment: {
                        id: uploadResult.id,
                        file_name: uploadResult.file_name,
                        file_type: uploadResult.file_type,
                        file_size: uploadResult.file_size,
                    }
                };
            }
            else if (fileContent && fileName) {
                // Decode base64 content
                const buffer = Buffer.from(fileContent, 'base64');
                const finalFileType = fileType || 'application/octet-stream';
                const uploadFormData = new FormData();
                uploadFormData.append('attachment[file]', buffer, {
                    filename: fileName,
                    contentType: finalFileType,
                });
                uploadFormData.append('attachment[attachment_type]', attachmentType);
                const uploadResult = await client.postFormData(client.accountPath(`/appointments/${appointmentId}/attachments`), uploadFormData);
                result = {
                    success: true,
                    message: `Arquivo "${fileName}" (${attachmentType}) anexado com sucesso ao agendamento ${appointmentId}`,
                    attachment: {
                        id: uploadResult.id,
                        file_name: uploadResult.file_name,
                        file_type: uploadResult.file_type,
                        file_size: uploadResult.file_size,
                    }
                };
            }
            else {
                result = { error: true, message: 'Quando usar file_content, file_name é obrigatório' };
            }
        }
        // ============ WAITLIST ENTRIES ============
        else if (path === '/appointment_waitlist_entries' && req.method === 'GET') {
            result = await client.get(client.accountPath('/appointment_waitlist_entries'), params);
        }
        else if (path === '/appointment_waitlist_entries' && req.method === 'POST') {
            result = await client.post(client.accountPath('/appointment_waitlist_entries'), body);
        }
        else if (path.match(/^\/appointment_waitlist_entries\/\d+$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/appointment_waitlist_entries/${id}`));
        }
        else if (path.match(/^\/appointment_waitlist_entries\/\d+$/) && req.method === 'PATCH') {
            const id = path.split('/')[2];
            result = await client.patch(client.accountPath(`/appointment_waitlist_entries/${id}`), body);
        }
        else if (path.match(/^\/appointment_waitlist_entries\/\d+$/) && req.method === 'DELETE') {
            const id = path.split('/')[2];
            await client.delete(client.accountPath(`/appointment_waitlist_entries/${id}`));
            result = { success: true, message: `Waitlist entry ${id} deleted` };
        }
        else if (path.match(/^\/appointment_waitlist_entries\/\d+\/accept$/) && req.method === 'POST') {
            const id = path.split('/')[2];
            result = await client.post(client.accountPath(`/appointment_waitlist_entries/${id}/accept`), body);
        }
        else if (path.match(/^\/appointment_waitlist_entries\/\d+\/decline$/) && req.method === 'POST') {
            const id = path.split('/')[2];
            result = await client.post(client.accountPath(`/appointment_waitlist_entries/${id}/decline`), body);
        }
        // ============ WAITLIST NOTIFICATION SETTINGS ============
        else if (path.match(/^\/specialists\/\d+\/waitlist_notification_setting$/) && req.method === 'GET') {
            const specialistId = path.split('/')[2];
            result = await client.get(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`));
        }
        else if (path.match(/^\/specialists\/\d+\/waitlist_notification_setting$/) && req.method === 'POST') {
            const specialistId = path.split('/')[2];
            result = await client.post(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`), body);
        }
        else if (path.match(/^\/specialists\/\d+\/waitlist_notification_setting$/) && req.method === 'PATCH') {
            const specialistId = path.split('/')[2];
            result = await client.patch(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`), body);
        }
        else if (path.match(/^\/specialists\/\d+\/waitlist_notification_setting$/) && req.method === 'DELETE') {
            const specialistId = path.split('/')[2];
            await client.delete(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`));
            result = { success: true, message: `Waitlist notification setting for specialist ${specialistId} deleted` };
        }
        // ============ WEBHOOKS ============
        else if (path === '/webhooks' && req.method === 'GET') {
            result = await client.get(client.accountPath('/webhooks'));
        }
        else if (path === '/webhooks' && req.method === 'POST') {
            result = await client.post(client.accountPath('/webhooks'), body);
        }
        else if (path.match(/^\/webhooks\/\d+$/) && req.method === 'PATCH') {
            const id = path.split('/')[2];
            result = await client.patch(client.accountPath(`/webhooks/${id}`), body);
        }
        else if (path.match(/^\/webhooks\/\d+$/) && req.method === 'DELETE') {
            const id = path.split('/')[2];
            await client.delete(client.accountPath(`/webhooks/${id}`));
            result = { success: true, message: `Webhook ${id} deleted` };
        }
        // ============ CANNED RESPONSES ============
        else if (path === '/canned_responses' && req.method === 'GET') {
            result = await client.get(client.accountPath('/canned_responses'));
        }
        else if (path === '/canned_responses' && req.method === 'POST') {
            result = await client.post(client.accountPath('/canned_responses'), body);
        }
        // ============ CUSTOM ATTRIBUTES ============
        else if (path === '/custom_attribute_definitions' && req.method === 'GET') {
            result = await client.get(client.accountPath('/custom_attribute_definitions'), params);
        }
        else if (path === '/custom_attribute_definitions' && req.method === 'POST') {
            result = await client.post(client.accountPath('/custom_attribute_definitions'), body);
        }
        // ============ AUTOMATION RULES ============
        else if (path === '/automation_rules' && req.method === 'GET') {
            result = await client.get(client.accountPath('/automation_rules'), params);
        }
        else if (path === '/automation_rules' && req.method === 'POST') {
            result = await client.post(client.accountPath('/automation_rules'), body);
        }
        else if (path.match(/^\/automation_rules\/\d+$/) && req.method === 'GET') {
            const id = path.split('/')[2];
            result = await client.get(client.accountPath(`/automation_rules/${id}`));
        }
        else if (path.match(/^\/automation_rules\/\d+$/) && req.method === 'PATCH') {
            const id = path.split('/')[2];
            result = await client.patch(client.accountPath(`/automation_rules/${id}`), body);
        }
        else if (path.match(/^\/automation_rules\/\d+$/) && req.method === 'DELETE') {
            const id = path.split('/')[2];
            await client.delete(client.accountPath(`/automation_rules/${id}`));
            result = { success: true, message: `Automation rule ${id} deleted` };
        }
        // ============ REPORTS ============
        else if (path === '/reports/summary' && req.method === 'GET') {
            result = await client.get(client.accountPath('/reports/summary'), params);
        }
        else if (path === '/reports' && req.method === 'GET') {
            result = await client.get(client.accountPath('/reports'), params);
        }
        // ============ LABELS ============
        else if (path === '/labels' && req.method === 'GET') {
            result = await client.get(client.accountPath('/labels'));
        }
        else if (path === '/labels' && req.method === 'POST') {
            result = await client.post(client.accountPath('/labels'), body);
        }
        // ============ HELP CENTER ============
        else if (path === '/portals' && req.method === 'GET') {
            result = await client.get(client.accountPath('/portals'));
        }
        else if (path === '/portals' && req.method === 'POST') {
            result = await client.post(client.accountPath('/portals'), body);
        }
        // ============ INTEGRATIONS ============
        else if (path === '/integrations/apps' && req.method === 'GET') {
            result = await client.get(client.accountPath('/integrations/apps'));
        }
        // ============ CSAT ============
        else if (path === '/csat_survey_responses' && req.method === 'GET') {
            result = await client.get(client.accountPath('/csat_survey_responses'), params);
        }
        else if (path === '/csat_survey_responses/metrics' && req.method === 'GET') {
            result = await client.get(client.accountPath('/csat_survey_responses/metrics'), params);
        }
        // ============ MCP TOOLS LIST (descoberta automática) ============
        else if (path === '/mcp/tools' && req.method === 'GET') {
            // Retorna a lista de tools no formato MCP com instruções customizadas
            const enabledToolsList = await toolInstructionService.getEnabledTools(mcpTools);
            result = {
                tools: enabledToolsList,
                // Informações adicionais para debug/discovery
                _meta: {
                    protocol: 'MCP JSON-RPC 2.0',
                    endpoint: '/mcp',
                    version: '1.0.0',
                    usage: {
                        jsonrpc: 'Para usar o protocolo MCP, envie POST para /mcp com JSON-RPC',
                        example: {
                            initialize: { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} },
                            'tools/list': { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
                            'tools/call': { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'list_contacts', arguments: {} } }
                        },
                        headers: {
                            'X-Account-Id': 'Required for tools/call operations',
                            'X-API-Key': 'Required unless SKIP_TOKEN_VALIDATION=true'
                        }
                    }
                }
            };
        }
        // ============ MCP ENDPOINT (ÚNICO) - Suporta JSON-RPC e formato legado ============
        else if (path === '/mcp' && req.method === 'POST') {
            // LOG da requisição
            console.log('=== MCP REQUEST ===');
            console.log('Body recebido:', JSON.stringify(body, null, 2));
            // Detecta se é uma requisição JSON-RPC (protocolo MCP)
            if (body.jsonrpc && body.method) {
                console.log('[MCP] Detected JSON-RPC request');
                // Para tools/call, precisamos do account_id
                if (body.method === 'tools/call' && !client.accountId) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        jsonrpc: '2.0',
                        id: body.id,
                        error: {
                            code: -32602,
                            message: 'Missing account_id. Please provide account_id via X-Account-Id header or configure CHATWOOT_ACCOUNT_ID environment variable.'
                        }
                    }));
                    return;
                }
                const response = await processMcpJsonRpc(body);
                if (response === null) {
                    // Notificação, sem resposta necessária
                    res.writeHead(204);
                    res.end();
                    return;
                }
                res.writeHead(200);
                res.end(JSON.stringify(response));
                return;
            }
            // Formato legado: { tool: string, params: object }
            const { tool, params: toolParams } = body;
            console.log('Tool:', tool);
            console.log('Params:', JSON.stringify(toolParams, null, 2));
            if (!tool) {
                console.log('ERRO: Tool não informada');
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Missing "tool" in request body. For MCP protocol, use JSON-RPC format with "jsonrpc", "method", and "params".' }));
                return;
            }
            switch (tool) {
                // Specialists
                case 'list_specialists':
                    result = await client.get(client.accountPath('/specialists'), toolParams);
                    break;
                case 'create_specialist':
                    result = await client.post(client.accountPath('/specialists'), toolParams);
                    break;
                case 'get_specialist':
                    result = await client.get(client.accountPath(`/specialists/${toolParams?.specialist_id}`));
                    break;
                case 'update_specialist': {
                    const specId = toolParams?.specialist_id;
                    const specData = { ...toolParams };
                    delete specData.specialist_id;
                    result = await client.patch(client.accountPath(`/specialists/${specId}`), specData);
                    break;
                }
                case 'delete_specialist':
                    await client.delete(client.accountPath(`/specialists/${toolParams?.specialist_id}`));
                    result = { success: true };
                    break;
                case 'get_specialist_availabilities':
                    result = await client.get(client.accountPath(`/specialists/${toolParams?.specialist_id}/availabilities`));
                    break;
                // Appointments
                case 'list_appointments':
                    result = await client.get(client.accountPath('/appointments'), toolParams);
                    break;
                case 'create_appointment':
                    console.log('>>> Criando appointment com:', JSON.stringify(toolParams, null, 2));
                    result = await client.post(client.accountPath('/appointments'), toolParams);
                    console.log('>>> Resultado:', JSON.stringify(result, null, 2));
                    break;
                case 'get_appointment':
                    result = await client.get(client.accountPath(`/appointments/${toolParams?.appointment_id}`));
                    break;
                case 'update_appointment': {
                    const apptId = toolParams?.appointment_id;
                    const apptData = { ...toolParams };
                    delete apptData.appointment_id;
                    result = await client.patch(client.accountPath(`/appointments/${apptId}`), apptData);
                    break;
                }
                case 'delete_appointment':
                    await client.delete(client.accountPath(`/appointments/${toolParams?.appointment_id}`));
                    result = { success: true };
                    break;
                // Appointment Attachments
                case 'list_appointment_attachments':
                    result = await client.get(client.accountPath(`/appointments/${toolParams?.appointment_id}/attachments`));
                    break;
                case 'get_appointment_attachment':
                    result = await client.get(client.accountPath(`/appointments/${toolParams?.appointment_id}/attachments/${toolParams?.attachment_id}`));
                    break;
                case 'delete_appointment_attachment':
                    await client.delete(client.accountPath(`/appointments/${toolParams?.appointment_id}/attachments/${toolParams?.attachment_id}`));
                    result = { success: true, message: 'Attachment deleted' };
                    break;
                case 'download_appointment_attachment': {
                    const attachmentData = await client.get(client.accountPath(`/appointments/${toolParams?.appointment_id}/attachments/${toolParams?.attachment_id}`));
                    result = {
                        attachment_id: attachmentData.id,
                        file_name: attachmentData.file_name,
                        file_type: attachmentData.file_type,
                        file_size: attachmentData.file_size,
                        download_url: attachmentData.download_url,
                        file_url: attachmentData.file_url,
                    };
                    break;
                }
                case 'upload_appointment_attachment': {
                    const apptId = toolParams?.appointment_id;
                    const fileUrl = toolParams?.file_url;
                    const fileContent = toolParams?.file_content;
                    const fileName = toolParams?.file_name;
                    const fileType = toolParams?.file_type;
                    if (!fileUrl && !fileContent) {
                        result = { error: true, message: 'Forneça file_url ou file_content para fazer upload' };
                        break;
                    }
                    let buffer;
                    let finalFileName;
                    let finalFileType;
                    if (fileUrl) {
                        const downloadResult = await downloadFileFromUrl(fileUrl);
                        buffer = downloadResult.buffer;
                        finalFileName = downloadResult.fileName;
                        finalFileType = downloadResult.contentType;
                    }
                    else if (fileContent && fileName) {
                        buffer = Buffer.from(fileContent, 'base64');
                        finalFileName = fileName;
                        finalFileType = fileType || 'application/octet-stream';
                    }
                    else {
                        result = { error: true, message: 'Quando usar file_content, file_name é obrigatório' };
                        break;
                    }
                    const uploadFormData = new FormData();
                    uploadFormData.append('attachment[file]', buffer, {
                        filename: finalFileName,
                        contentType: finalFileType,
                    });
                    const uploadResult = await client.postFormData(client.accountPath(`/appointments/${apptId}/attachments`), uploadFormData);
                    result = {
                        success: true,
                        message: `Arquivo "${finalFileName}" anexado com sucesso`,
                        attachment: {
                            id: uploadResult.id,
                            file_name: uploadResult.file_name,
                            file_type: uploadResult.file_type,
                            file_size: uploadResult.file_size,
                        }
                    };
                    break;
                }
                // Contacts
                case 'list_contacts':
                    result = await client.get(client.accountPath('/contacts'), toolParams);
                    break;
                case 'create_contact':
                    result = await client.post(client.accountPath('/contacts'), toolParams);
                    break;
                case 'get_contact':
                    result = await client.get(client.accountPath(`/contacts/${toolParams?.contact_id}`));
                    break;
                case 'update_contact': {
                    const contactId = toolParams?.contact_id;
                    const contactData = { ...toolParams };
                    delete contactData.contact_id;
                    result = await client.patch(client.accountPath(`/contacts/${contactId}`), contactData);
                    break;
                }
                case 'delete_contact':
                    await client.delete(client.accountPath(`/contacts/${toolParams?.contact_id}`));
                    result = { success: true };
                    break;
                case 'search_contacts':
                    result = await client.get(client.accountPath('/contacts/search'), toolParams);
                    break;
                case 'get_contact_appointments':
                    result = await client.get(client.accountPath(`/contacts/${toolParams?.contact_id}/appointments`));
                    break;
                // Conversations
                case 'list_conversations':
                    result = await client.get(client.accountPath('/conversations'), toolParams);
                    break;
                case 'get_conversation':
                    result = await client.get(client.accountPath(`/conversations/${toolParams?.conversation_id}`));
                    break;
                case 'create_message': {
                    const convId = toolParams?.conversation_id;
                    const msgData = { ...toolParams };
                    delete msgData.conversation_id;
                    result = await client.post(client.accountPath(`/conversations/${convId}/messages`), msgData);
                    break;
                }
                case 'list_messages':
                    result = await client.get(client.accountPath(`/conversations/${toolParams?.conversation_id}/messages`));
                    break;
                // Agents
                case 'list_agents':
                    result = await client.get(client.accountPath('/agents'));
                    break;
                // Inboxes
                case 'list_inboxes':
                    result = await client.get(client.accountPath('/inboxes'));
                    break;
                // Teams
                case 'list_teams':
                    result = await client.get(client.accountPath('/teams'));
                    break;
                // Labels
                case 'list_labels':
                    result = await client.get(client.accountPath('/labels'));
                    break;
                // Reports
                case 'get_reports':
                    result = await client.get(client.accountPath('/reports'), toolParams);
                    break;
                case 'get_report_summary':
                    result = await client.get(client.accountPath('/reports/summary'), toolParams);
                    break;
                // Waitlist Entries
                case 'list_waitlist_entries':
                    result = await client.get(client.accountPath('/appointment_waitlist_entries'), toolParams);
                    break;
                case 'create_waitlist_entry': {
                    const entryData = {
                        specialist_id: toolParams?.specialist_id,
                        contact_id: toolParams?.contact_id,
                    };
                    if (toolParams?.preferred_date)
                        entryData.preferred_date = toolParams.preferred_date;
                    if (toolParams?.preferred_time_start)
                        entryData.preferred_time_start = toolParams.preferred_time_start;
                    if (toolParams?.preferred_time_end)
                        entryData.preferred_time_end = toolParams.preferred_time_end;
                    if (toolParams?.notes)
                        entryData.notes = toolParams.notes;
                    if (toolParams?.priority !== undefined)
                        entryData.priority = toolParams.priority;
                    result = await client.post(client.accountPath('/appointment_waitlist_entries'), {
                        appointment_waitlist_entry: entryData
                    });
                    break;
                }
                case 'get_waitlist_entry':
                    result = await client.get(client.accountPath(`/appointment_waitlist_entries/${toolParams?.waitlist_entry_id}`));
                    break;
                case 'update_waitlist_entry': {
                    const entryId = toolParams?.waitlist_entry_id;
                    const updateData = {};
                    if (toolParams?.preferred_date)
                        updateData.preferred_date = toolParams.preferred_date;
                    if (toolParams?.preferred_time_start)
                        updateData.preferred_time_start = toolParams.preferred_time_start;
                    if (toolParams?.preferred_time_end)
                        updateData.preferred_time_end = toolParams.preferred_time_end;
                    if (toolParams?.notes !== undefined)
                        updateData.notes = toolParams.notes;
                    if (toolParams?.priority !== undefined)
                        updateData.priority = toolParams.priority;
                    result = await client.patch(client.accountPath(`/appointment_waitlist_entries/${entryId}`), {
                        appointment_waitlist_entry: updateData
                    });
                    break;
                }
                case 'delete_waitlist_entry':
                    await client.delete(client.accountPath(`/appointment_waitlist_entries/${toolParams?.waitlist_entry_id}`));
                    result = { success: true, message: 'Entrada da lista de espera removida' };
                    break;
                case 'accept_waitlist_slot': {
                    const acceptData = {};
                    if (toolParams?.slot_start_time)
                        acceptData.slot_start_time = toolParams.slot_start_time;
                    if (toolParams?.slot_end_time)
                        acceptData.slot_end_time = toolParams.slot_end_time;
                    result = await client.post(client.accountPath(`/appointment_waitlist_entries/${toolParams?.waitlist_entry_id}/accept`), acceptData);
                    break;
                }
                case 'decline_waitlist_slot': {
                    const declineData = {};
                    if (toolParams?.reason)
                        declineData.reason = toolParams.reason;
                    result = await client.post(client.accountPath(`/appointment_waitlist_entries/${toolParams?.waitlist_entry_id}/decline`), declineData);
                    break;
                }
                case 'get_waitlist_notification_setting':
                    result = await client.get(client.accountPath(`/specialists/${toolParams?.specialist_id}/waitlist_notification_setting`));
                    break;
                case 'update_waitlist_notification_setting': {
                    const settingData = {};
                    if (toolParams?.enabled !== undefined)
                        settingData.enabled = toolParams.enabled;
                    if (toolParams?.notification_template !== undefined)
                        settingData.notification_template = toolParams.notification_template;
                    if (toolParams?.response_timeout_hours !== undefined)
                        settingData.response_timeout_hours = toolParams.response_timeout_hours;
                    if (toolParams?.max_notifications_per_slot !== undefined)
                        settingData.max_notifications_per_slot = toolParams.max_notifications_per_slot;
                    if (toolParams?.auto_expire_hours !== undefined)
                        settingData.auto_expire_hours = toolParams.auto_expire_hours;
                    result = await client.patch(client.accountPath(`/specialists/${toolParams?.specialist_id}/waitlist_notification_setting`), {
                        waitlist_notification_setting: settingData
                    });
                    break;
                }
                default:
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: `Unknown tool: ${tool}` }));
                    return;
            }
        }
        // ============ HEALTH CHECK ============
        else if (path === '/health' || path === '/') {
            result = {
                status: 'ok',
                service: 'chatwoot-mcp-http',
                version: '1.0.0',
                endpoints: [
                    'GET /contacts', 'POST /contacts', 'GET /contacts/:id', 'PATCH /contacts/:id', 'DELETE /contacts/:id',
                    'GET /contacts/search', 'POST /contacts/filter', 'GET /contacts/:id/conversations', 'GET /contacts/:id/appointments',
                    'GET /conversations', 'POST /conversations', 'GET /conversations/:id', 'PATCH /conversations/:id',
                    'POST /conversations/:id/toggle_status', 'POST /conversations/:id/assignments',
                    'GET /conversations/:id/messages', 'POST /conversations/:id/messages',
                    'GET /agents', 'GET /agents/:id',
                    'GET /inboxes', 'GET /inboxes/:id', 'GET /inboxes/:id/agents',
                    'GET /teams', 'POST /teams', 'GET /teams/:id', 'PATCH /teams/:id', 'DELETE /teams/:id',
                    'GET /specialists', 'POST /specialists', 'GET /specialists/:id', 'PATCH /specialists/:id', 'DELETE /specialists/:id',
                    'GET /specialists/:id/availabilities', 'PUT /specialists/:id/availabilities', 'GET /specialists/:id/available_slots',
                    'GET /appointments', 'POST /appointments', 'GET /appointments/:id', 'PATCH /appointments/:id', 'DELETE /appointments/:id',
                    'GET /appointments/:id/attachments', 'GET /appointments/:id/attachments/:attachment_id', 'DELETE /appointments/:id/attachments/:attachment_id',
                    'GET /appointment_waitlist_entries', 'POST /appointment_waitlist_entries', 'GET /appointment_waitlist_entries/:id',
                    'PATCH /appointment_waitlist_entries/:id', 'DELETE /appointment_waitlist_entries/:id',
                    'POST /appointment_waitlist_entries/:id/accept', 'POST /appointment_waitlist_entries/:id/decline',
                    'GET /specialists/:id/waitlist_notification_setting', 'POST /specialists/:id/waitlist_notification_setting',
                    'PATCH /specialists/:id/waitlist_notification_setting', 'DELETE /specialists/:id/waitlist_notification_setting',
                    'GET /webhooks', 'POST /webhooks', 'PATCH /webhooks/:id', 'DELETE /webhooks/:id',
                    'GET /canned_responses', 'POST /canned_responses',
                    'GET /custom_attribute_definitions', 'POST /custom_attribute_definitions',
                    'GET /automation_rules', 'POST /automation_rules', 'GET /automation_rules/:id', 'PATCH /automation_rules/:id', 'DELETE /automation_rules/:id',
                    'GET /reports/summary', 'GET /reports',
                    'GET /labels', 'POST /labels',
                    'GET /portals', 'POST /portals',
                    'GET /integrations/apps',
                    'GET /csat_survey_responses', 'GET /csat_survey_responses/metrics'
                ]
            };
        }
        // ============ NOT FOUND ============
        else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not Found', path, method: req.method }));
            return;
        }
        res.writeHead(200);
        res.end(JSON.stringify(result, null, 2));
        // Audit log (async, non-blocking)
        if (tokenId) {
            auditService.logApiRequest(tokenId, req.method || 'GET', path, 200, clientIp, userAgent).catch(console.error);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: message }));
        // Audit log error (async, non-blocking)
        if (tokenId) {
            auditService.logApiRequest(tokenId, req.method || 'GET', path, 500, clientIp, userAgent, { error: message }).catch(console.error);
        }
    }
});
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            }
            catch {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}
const PORT = process.env.PORT || 3001;
// Initialize database and start server
async function startServer() {
    try {
        // Try to initialize database (optional - server works without it)
        if (process.env.DATABASE_URL) {
            console.log('[DB] Connecting to PostgreSQL...');
            await initializeDatabase();
            dbInitialized = true;
            console.log('[DB] Database ready');
        }
        else {
            console.log('[DB] DATABASE_URL not set - using legacy API key only');
        }
    }
    catch (error) {
        console.error('[DB] Failed to initialize database:', error);
        console.log('[DB] Server will run with legacy API key only');
    }
    server.listen(PORT, () => {
        console.log(`🚀 Chatwoot MCP HTTP Server running on http://localhost:${PORT}`);
        console.log(`📚 API Endpoints: GET /`);
        console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
        if (SKIP_TOKEN_VALIDATION) {
            console.log(`⚠️  WARNING: Token validation DISABLED (SKIP_TOKEN_VALIDATION=true)`);
            console.log(`⚠️  This is INSECURE and should only be used for local development!`);
        }
    });
}
startServer();
//# sourceMappingURL=http-server.js.map