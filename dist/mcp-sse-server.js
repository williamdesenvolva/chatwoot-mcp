#!/usr/bin/env node
import 'dotenv/config';
import http from 'http';
import { ChatwootClient } from './shared/api-client.js';
const client = new ChatwootClient();
const API_KEY = process.env.MCP_API_KEY || 'chatwoot-mcp-2026-secure-key';
// Armazena conexões SSE ativas
const sseConnections = new Map();
// Propriedade account_id comum a todas as tools
const accountIdProperty = {
    account_id: { type: 'number', description: 'ID da conta Chatwoot (obrigatório se não configurado no .env)' },
};
// Tools disponíveis
const tools = [
    {
        name: 'list_specialists',
        description: 'Lista todos os especialistas disponíveis para agendamento',
        inputSchema: {
            type: 'object',
            properties: { ...accountIdProperty },
        },
    },
    {
        name: 'create_specialist',
        description: 'Cria um novo especialista',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                ...accountIdProperty,
                name: { type: 'string', description: 'Nome do especialista' },
                email: { type: 'string', description: 'Email do especialista' },
                phone: { type: 'string', description: 'Telefone do especialista' },
                active: { type: 'boolean', description: 'Se está ativo' },
            },
        },
    },
    {
        name: 'get_specialist',
        description: 'Obtém detalhes de um especialista pelo ID',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                ...accountIdProperty,
                specialist_id: { type: 'number', description: 'ID do especialista' },
            },
        },
    },
    {
        name: 'list_appointments',
        description: 'Lista todos os agendamentos',
        inputSchema: {
            type: 'object',
            properties: {
                ...accountIdProperty,
                specialist_id: { type: 'number', description: 'Filtrar por especialista' },
                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
            },
        },
    },
    {
        name: 'create_appointment',
        description: 'Cria um novo agendamento',
        inputSchema: {
            type: 'object',
            required: ['title', 'specialist_id', 'start_time', 'end_time'],
            properties: {
                ...accountIdProperty,
                title: { type: 'string', description: 'Título do agendamento' },
                description: { type: 'string', description: 'Descrição' },
                specialist_id: { type: 'number', description: 'ID do especialista' },
                start_time: { type: 'string', description: 'Data/hora início (ISO 8601)' },
                end_time: { type: 'string', description: 'Data/hora fim (ISO 8601)' },
                contact_id: { type: 'number', description: 'ID do contato' },
            },
        },
    },
    {
        name: 'get_appointment',
        description: 'Obtém detalhes de um agendamento pelo ID',
        inputSchema: {
            type: 'object',
            required: ['appointment_id'],
            properties: {
                ...accountIdProperty,
                appointment_id: { type: 'number', description: 'ID do agendamento' },
            },
        },
    },
    {
        name: 'update_appointment',
        description: 'Atualiza um agendamento existente',
        inputSchema: {
            type: 'object',
            required: ['appointment_id'],
            properties: {
                ...accountIdProperty,
                appointment_id: { type: 'number', description: 'ID do agendamento' },
                title: { type: 'string', description: 'Novo título' },
                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
                start_time: { type: 'string', description: 'Nova data/hora início' },
                end_time: { type: 'string', description: 'Nova data/hora fim' },
            },
        },
    },
    {
        name: 'delete_appointment',
        description: 'Deleta um agendamento',
        inputSchema: {
            type: 'object',
            required: ['appointment_id'],
            properties: {
                ...accountIdProperty,
                appointment_id: { type: 'number', description: 'ID do agendamento' },
            },
        },
    },
    {
        name: 'list_contacts',
        description: 'Lista todos os contatos',
        inputSchema: {
            type: 'object',
            properties: {
                ...accountIdProperty,
                page: { type: 'number', description: 'Número da página' },
            },
        },
    },
    {
        name: 'create_contact',
        description: 'Cria um novo contato',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                ...accountIdProperty,
                name: { type: 'string', description: 'Nome do contato' },
                email: { type: 'string', description: 'Email' },
                phone_number: { type: 'string', description: 'Telefone' },
            },
        },
    },
    {
        name: 'get_contact',
        description: 'Obtém detalhes de um contato pelo ID',
        inputSchema: {
            type: 'object',
            required: ['contact_id'],
            properties: {
                ...accountIdProperty,
                contact_id: { type: 'number', description: 'ID do contato' },
            },
        },
    },
    {
        name: 'list_conversations',
        description: 'Lista todas as conversas',
        inputSchema: {
            type: 'object',
            properties: {
                ...accountIdProperty,
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
                ...accountIdProperty,
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
                ...accountIdProperty,
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
                ...accountIdProperty,
                conversation_id: { type: 'number', description: 'ID da conversa' },
                content: { type: 'string', description: 'Conteúdo da mensagem' },
                private: { type: 'boolean', description: 'Se é nota interna' },
            },
        },
    },
    {
        name: 'list_agents',
        description: 'Lista todos os agentes',
        inputSchema: { type: 'object', properties: { ...accountIdProperty } },
    },
    {
        name: 'list_inboxes',
        description: 'Lista todas as inboxes (canais)',
        inputSchema: { type: 'object', properties: { ...accountIdProperty } },
    },
    {
        name: 'list_teams',
        description: 'Lista todos os times',
        inputSchema: { type: 'object', properties: { ...accountIdProperty } },
    },
    {
        name: 'list_labels',
        description: 'Lista todas as labels',
        inputSchema: { type: 'object', properties: { ...accountIdProperty } },
    },
];
// Executa uma tool
async function executeTool(name, args) {
    console.log(`Executando tool: ${name}`, JSON.stringify(args, null, 2));
    // Extract and set dynamic account_id
    const accountId = args.account_id;
    if (accountId) {
        client.setAccountId(String(accountId));
        delete args.account_id;
    }
    else {
        client.clearAccountId();
    }
    // Validate account_id is available
    if (!client.accountId) {
        throw new Error('Missing account_id. Please provide account_id in tool arguments or configure CHATWOOT_ACCOUNT_ID environment variable.');
    }
    switch (name) {
        // Specialists
        case 'list_specialists':
            return await client.get(client.accountPath('/specialists'));
        case 'create_specialist':
            return await client.post(client.accountPath('/specialists'), args);
        case 'get_specialist':
            return await client.get(client.accountPath(`/specialists/${args.specialist_id}`));
        // Appointments
        case 'list_appointments':
            return await client.get(client.accountPath('/appointments'), args);
        case 'create_appointment':
            const result = await client.post(client.accountPath('/appointments'), args);
            console.log('Appointment criado:', JSON.stringify(result, null, 2));
            return result;
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
        // Contacts
        case 'list_contacts':
            return await client.get(client.accountPath('/contacts'), args);
        case 'create_contact':
            return await client.post(client.accountPath('/contacts'), args);
        case 'get_contact':
            return await client.get(client.accountPath(`/contacts/${args.contact_id}`));
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
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
// Processa mensagem JSON-RPC
async function processMessage(message) {
    const { id, method, params } = message;
    console.log(`MCP Request: ${method}`, params ? JSON.stringify(params, null, 2) : '');
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
                result = { tools };
                break;
            case 'tools/call': {
                const toolName = params?.name;
                const toolArgs = (params?.arguments || {});
                if (!toolName) {
                    throw new Error('Tool name is required');
                }
                const toolResult = await executeTool(toolName, toolArgs);
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
                throw new Error(`Unknown method: ${method}`);
        }
        return {
            jsonrpc: '2.0',
            id,
            result,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`MCP Error: ${errorMessage}`);
        return {
            jsonrpc: '2.0',
            id,
            error: {
                code: -32603,
                message: errorMessage,
            },
        };
    }
}
// Servidor HTTP
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    // Autenticação via API Key (exceto health check)
    if (path !== '/' && path !== '/health') {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== API_KEY) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing X-API-Key header' }));
            return;
        }
    }
    // Health check
    if (path === '/' || path === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'chatwoot-mcp-sse', version: '1.0.0' }));
        return;
    }
    // SSE endpoint - cliente se conecta aqui para receber mensagens
    if (path === '/sse' && req.method === 'GET') {
        const sessionId = crypto.randomUUID();
        console.log(`SSE connection opened: ${sessionId}`);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        // Envia o endpoint para o cliente enviar mensagens
        const messageEndpoint = `/message?sessionId=${sessionId}`;
        res.write(`event: endpoint\ndata: ${messageEndpoint}\n\n`);
        sseConnections.set(sessionId, res);
        req.on('close', () => {
            console.log(`SSE connection closed: ${sessionId}`);
            sseConnections.delete(sessionId);
        });
        return;
    }
    // Message endpoint - cliente envia mensagens aqui
    if (path === '/message' && req.method === 'POST') {
        const sessionId = url.searchParams.get('sessionId');
        if (!sessionId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'sessionId is required' }));
            return;
        }
        const sseRes = sseConnections.get(sessionId);
        if (!sseRes) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Session not found' }));
            return;
        }
        // Parse body
        let body = '';
        for await (const chunk of req) {
            body += chunk;
        }
        try {
            const message = JSON.parse(body);
            console.log('Received message:', JSON.stringify(message, null, 2));
            const response = await processMessage(message);
            if (response) {
                // Envia resposta via SSE
                sseRes.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);
            }
            res.writeHead(202, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'accepted' }));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: errorMessage }));
        }
        return;
    }
    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});
const PORT = process.env.MCP_SSE_PORT || 3002;
server.listen(PORT, () => {
    console.log(`🚀 Chatwoot MCP SSE Server running on http://localhost:${PORT}`);
    console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
    console.log(`📨 Message endpoint: http://localhost:${PORT}/message`);
});
//# sourceMappingURL=mcp-sse-server.js.map