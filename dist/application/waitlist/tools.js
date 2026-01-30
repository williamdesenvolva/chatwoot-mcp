export const waitlistTools = [
    // === WAITLIST ENTRIES ===
    {
        name: 'list_waitlist_entries',
        description: 'Lista todas as entradas na lista de espera. Pode filtrar por especialista, contato ou status.',
        inputSchema: {
            type: 'object',
            properties: {
                specialist_id: {
                    type: 'number',
                    description: 'Filtrar por ID do especialista',
                },
                contact_id: {
                    type: 'number',
                    description: 'Filtrar por ID do contato',
                },
                status: {
                    type: 'string',
                    enum: ['pending', 'notified', 'accepted', 'declined', 'expired', 'cancelled'],
                    description: 'Filtrar por status',
                },
                page: {
                    type: 'number',
                    description: 'Número da página',
                },
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
                specialist_id: {
                    type: 'number',
                    description: 'ID do especialista (obrigatório)',
                },
                contact_id: {
                    type: 'number',
                    description: 'ID do contato (obrigatório)',
                },
                preferred_date: {
                    type: 'string',
                    description: 'Data preferencial (formato: YYYY-MM-DD)',
                },
                preferred_time_start: {
                    type: 'string',
                    description: 'Horário inicial preferencial (formato: HH:MM)',
                },
                preferred_time_end: {
                    type: 'string',
                    description: 'Horário final preferencial (formato: HH:MM)',
                },
                notes: {
                    type: 'string',
                    description: 'Observações sobre a preferência do paciente',
                },
                priority: {
                    type: 'number',
                    description: 'Prioridade (1=alta, 2=média, 3=baixa). Padrão: 2',
                },
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
                waitlist_entry_id: {
                    type: 'number',
                    description: 'ID da entrada na lista de espera',
                },
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
                waitlist_entry_id: {
                    type: 'number',
                    description: 'ID da entrada na lista de espera',
                },
                preferred_date: {
                    type: 'string',
                    description: 'Nova data preferencial (formato: YYYY-MM-DD)',
                },
                preferred_time_start: {
                    type: 'string',
                    description: 'Novo horário inicial preferencial (formato: HH:MM)',
                },
                preferred_time_end: {
                    type: 'string',
                    description: 'Novo horário final preferencial (formato: HH:MM)',
                },
                notes: {
                    type: 'string',
                    description: 'Novas observações',
                },
                priority: {
                    type: 'number',
                    description: 'Nova prioridade (1=alta, 2=média, 3=baixa)',
                },
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
                waitlist_entry_id: {
                    type: 'number',
                    description: 'ID da entrada na lista de espera a remover',
                },
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
                waitlist_entry_id: {
                    type: 'number',
                    description: 'ID da entrada na lista de espera',
                },
                slot_start_time: {
                    type: 'string',
                    description: 'Horário de início da vaga aceita (ISO 8601)',
                },
                slot_end_time: {
                    type: 'string',
                    description: 'Horário de término da vaga aceita (ISO 8601)',
                },
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
                waitlist_entry_id: {
                    type: 'number',
                    description: 'ID da entrada na lista de espera',
                },
                reason: {
                    type: 'string',
                    description: 'Motivo da recusa (opcional)',
                },
            },
        },
    },
    // === WAITLIST NOTIFICATION SETTINGS ===
    {
        name: 'get_waitlist_notification_setting',
        description: 'Obtém as configurações de notificação da lista de espera de um especialista',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: {
                    type: 'number',
                    description: 'ID do especialista',
                },
            },
        },
    },
    {
        name: 'create_waitlist_notification_setting',
        description: 'Cria configurações de notificação da lista de espera para um especialista',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: {
                    type: 'number',
                    description: 'ID do especialista',
                },
                enabled: {
                    type: 'boolean',
                    description: 'Se as notificações automáticas estão ativas. Padrão: true',
                },
                notification_template: {
                    type: 'string',
                    description: 'Template da mensagem de notificação. Placeholders: {{contact_name}}, {{specialist_name}}, {{slot_date}}, {{slot_time}}',
                },
                response_timeout_hours: {
                    type: 'number',
                    description: 'Horas para o paciente responder antes de notificar o próximo. Padrão: 2',
                },
                max_notifications_per_slot: {
                    type: 'number',
                    description: 'Máximo de pacientes a notificar por vaga. Padrão: 1',
                },
                auto_expire_hours: {
                    type: 'number',
                    description: 'Horas até a entrada expirar automaticamente. Padrão: 720 (30 dias)',
                },
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
                specialist_id: {
                    type: 'number',
                    description: 'ID do especialista',
                },
                enabled: {
                    type: 'boolean',
                    description: 'Se as notificações automáticas estão ativas',
                },
                notification_template: {
                    type: 'string',
                    description: 'Template da mensagem de notificação',
                },
                response_timeout_hours: {
                    type: 'number',
                    description: 'Horas para o paciente responder',
                },
                max_notifications_per_slot: {
                    type: 'number',
                    description: 'Máximo de pacientes a notificar por vaga',
                },
                auto_expire_hours: {
                    type: 'number',
                    description: 'Horas até a entrada expirar automaticamente',
                },
            },
        },
    },
    {
        name: 'delete_waitlist_notification_setting',
        description: 'Remove as configurações de notificação da lista de espera de um especialista (desativa notificações automáticas)',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: {
                    type: 'number',
                    description: 'ID do especialista',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map