#!/usr/bin/env node
import 'dotenv/config';
import http from 'http';
import { ChatwootClient } from './shared/api-client.js';
const client = new ChatwootClient();
// API Key para autenticação
const API_KEY = process.env.MCP_API_KEY || 'chatwoot-mcp-2026-secure-key';
// Propriedade account_id comum a todas as tools
const accountIdProperty = {
    account_id: { type: 'number', description: 'ID da conta Chatwoot (obrigatório se não configurado no .env)' },
};
// Tools disponíveis com categorias
const allTools = [
    // === SPECIALISTS ===
    {
        name: 'list_specialists',
        description: 'Lista todos os especialistas disponíveis para agendamento',
        inputSchema: { type: 'object', properties: { ...accountIdProperty } },
        category: 'specialists',
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
        category: 'specialists',
    },
    // === APPOINTMENTS ===
    {
        name: 'list_appointments',
        description: 'Lista todos os agendamentos',
        inputSchema: {
            type: 'object',
            properties: {
                ...accountIdProperty,
                specialist_id: { type: 'number', description: 'Filtrar por especialista' },
            },
        },
        category: 'appointments',
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
                start_time: { type: 'string', description: 'Data/hora início (ISO 8601 com timezone, ex: 2026-01-14T09:00:00-03:00)' },
                end_time: { type: 'string', description: 'Data/hora fim (ISO 8601 com timezone, ex: 2026-01-14T10:00:00-03:00)' },
                contact_id: { type: 'number', description: 'ID do contato' },
            },
        },
        category: 'appointments',
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
                title: { type: 'string' },
                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
                start_time: { type: 'string', description: 'Nova data/hora início' },
                end_time: { type: 'string', description: 'Nova data/hora fim' },
            },
        },
        category: 'appointments',
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
        category: 'appointments',
    },
    // === CONTACTS ===
    {
        name: 'list_contacts',
        description: 'Lista todos os contatos',
        inputSchema: { type: 'object', properties: { ...accountIdProperty, page: { type: 'number' } } },
        category: 'contacts',
    },
    {
        name: 'create_contact',
        description: 'Cria um novo contato',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                ...accountIdProperty,
                name: { type: 'string' },
                email: { type: 'string' },
                phone_number: { type: 'string' },
            },
        },
        category: 'contacts',
    },
    // === CONVERSATIONS ===
    {
        name: 'list_conversations',
        description: 'Lista todas as conversas',
        inputSchema: {
            type: 'object',
            properties: {
                ...accountIdProperty,
                status: { type: 'string', enum: ['open', 'resolved', 'pending'] },
                inbox_id: { type: 'number' },
            },
        },
        category: 'conversations',
    },
    {
        name: 'create_message',
        description: 'Envia uma mensagem em uma conversa',
        inputSchema: {
            type: 'object',
            required: ['conversation_id', 'content'],
            properties: {
                ...accountIdProperty,
                conversation_id: { type: 'number' },
                content: { type: 'string' },
                private: { type: 'boolean' },
            },
        },
        category: 'conversations',
    },
    // === AGENTS ===
    {
        name: 'list_agents',
        description: 'Lista todos os agentes',
        inputSchema: { type: 'object', properties: { ...accountIdProperty } },
        category: 'agents',
    },
    // === INBOXES ===
    {
        name: 'list_inboxes',
        description: 'Lista todas as inboxes',
        inputSchema: { type: 'object', properties: { ...accountIdProperty } },
        category: 'inboxes',
    },
    // === TEAMS ===
    {
        name: 'list_teams',
        description: 'Lista todos os times',
        inputSchema: { type: 'object', properties: { ...accountIdProperty } },
        category: 'teams',
    },
];
// Mapeamento de scopes para categorias
// Permite combinar múltiplas categorias em um scope
const scopeMapping = {
    'all': ['specialists', 'appointments', 'contacts', 'conversations', 'agents', 'inboxes', 'teams'],
    'calendar': ['specialists', 'appointments'],
    'scheduling': ['specialists', 'appointments', 'contacts'],
    'support': ['conversations', 'contacts', 'agents', 'inboxes', 'teams'],
    'specialists': ['specialists'],
    'appointments': ['appointments'],
    'contacts': ['contacts'],
    'conversations': ['conversations'],
    'agents': ['agents'],
    'inboxes': ['inboxes'],
    'teams': ['teams'],
};
// Filtra tools por scope
function getToolsForScope(scope) {
    const categories = scopeMapping[scope] || scopeMapping['all'];
    return allTools.filter(tool => categories.includes(tool.category));
}
// Remove a propriedade category antes de retornar para o cliente
function sanitizeTools(tools) {
    return tools.map(({ category, ...rest }) => rest);
}
// Verifica se uma tool é permitida no scope
function isToolAllowed(toolName, scope) {
    const allowedTools = getToolsForScope(scope);
    return allowedTools.some(t => t.name === toolName);
}
// Executa uma tool
async function executeTool(name, args) {
    console.log(`[TOOL] ${name}`, JSON.stringify(args));
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
        case 'list_specialists':
            return await client.get(client.accountPath('/specialists'));
        case 'create_specialist':
            return await client.post(client.accountPath('/specialists'), args);
        case 'list_appointments':
            return await client.get(client.accountPath('/appointments'), args);
        case 'create_appointment':
            return await client.post(client.accountPath('/appointments'), args);
        case 'update_appointment': {
            const id = args.appointment_id;
            const data = { ...args };
            delete data.appointment_id;
            return await client.patch(client.accountPath(`/appointments/${id}`), data);
        }
        case 'delete_appointment':
            await client.delete(client.accountPath(`/appointments/${args.appointment_id}`));
            return { success: true };
        case 'list_contacts':
            return await client.get(client.accountPath('/contacts'), args);
        case 'create_contact':
            return await client.post(client.accountPath('/contacts'), args);
        case 'list_conversations':
            return await client.get(client.accountPath('/conversations'), args);
        case 'create_message': {
            const convId = args.conversation_id;
            const msgData = { ...args };
            delete msgData.conversation_id;
            return await client.post(client.accountPath(`/conversations/${convId}/messages`), msgData);
        }
        case 'list_agents':
            return await client.get(client.accountPath('/agents'));
        case 'list_inboxes':
            return await client.get(client.accountPath('/inboxes'));
        case 'list_teams':
            return await client.get(client.accountPath('/teams'));
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
// Processa mensagem JSON-RPC com scope
async function processJsonRpc(message, scope) {
    const { id, method, params } = message;
    console.log(`[RPC] ${method} (scope: ${scope})`, params ? JSON.stringify(params) : '');
    try {
        let result;
        switch (method) {
            case 'initialize':
                result = {
                    protocolVersion: '2024-11-05',
                    capabilities: { tools: {} },
                    serverInfo: {
                        name: 'chatwoot-mcp',
                        version: '1.0.0',
                        scope: scope,
                    },
                };
                break;
            case 'notifications/initialized':
                return { jsonrpc: '2.0' };
            case 'tools/list': {
                const scopedTools = getToolsForScope(scope);
                result = { tools: sanitizeTools(scopedTools) };
                break;
            }
            case 'tools/call': {
                const toolName = params?.name;
                const toolArgs = (params?.arguments || {});
                // Verifica se a tool é permitida no scope atual
                if (!isToolAllowed(toolName, scope)) {
                    throw new Error(`Tool "${toolName}" is not available in scope "${scope}". Available scopes: ${Object.keys(scopeMapping).join(', ')}`);
                }
                const toolResult = await executeTool(toolName, toolArgs);
                result = {
                    content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }],
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
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[ERROR] ${msg}`);
        return { jsonrpc: '2.0', id, error: { code: -32603, message: msg } };
    }
}
// Extrai o scope do path
function getScopeFromPath(path) {
    // /mcp -> all
    // /mcp/specialists -> specialists
    // /mcp/calendar -> calendar (specialists + appointments)
    const match = path.match(/^\/mcp(?:\/([a-z]+))?$/);
    if (match) {
        const scope = match[1] || 'all';
        return scopeMapping[scope] ? scope : 'all';
    }
    return 'all';
}
// Servidor HTTP
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    console.log(`[HTTP] ${req.method} ${path}`);
    // Autenticação via API Key (exceto health check)
    if (path !== '/' && path !== '/health') {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== API_KEY) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing X-API-Key header' }));
            return;
        }
    }
    // Health check com lista de scopes disponíveis
    if ((path === '/' || path === '/health') && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'chatwoot-mcp-streamable',
            version: '1.0.0',
            availableScopes: Object.keys(scopeMapping),
            scopeDetails: Object.fromEntries(Object.entries(scopeMapping).map(([scope, categories]) => [
                scope,
                {
                    categories,
                    toolCount: getToolsForScope(scope).length,
                    tools: getToolsForScope(scope).map(t => t.name),
                }
            ])),
            usage: {
                '/mcp': 'All tools (default)',
                '/mcp/specialists': 'Only specialist tools',
                '/mcp/appointments': 'Only appointment tools',
                '/mcp/calendar': 'Specialists + Appointments',
                '/mcp/scheduling': 'Specialists + Appointments + Contacts',
                '/mcp/contacts': 'Only contact tools',
                '/mcp/conversations': 'Only conversation tools',
                '/mcp/support': 'Conversations + Contacts + Agents + Inboxes + Teams',
            }
        }));
        return;
    }
    // MCP Streamable endpoint com scope
    if (path.startsWith('/mcp') && req.method === 'POST') {
        const scope = getScopeFromPath(path);
        let body = '';
        for await (const chunk of req) {
            body += chunk;
        }
        try {
            const message = JSON.parse(body);
            const response = await processJsonRpc(message, scope);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: msg }));
        }
        return;
    }
    // SSE endpoint para compatibilidade
    if (path === '/sse' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        res.write(`event: open\ndata: {"status":"connected"}\n\n`);
        const keepAlive = setInterval(() => {
            res.write(`: keepalive\n\n`);
        }, 30000);
        req.on('close', () => {
            clearInterval(keepAlive);
            console.log('[SSE] Connection closed');
        });
        console.log('[SSE] Connection opened');
        return;
    }
    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', availableEndpoints: ['/mcp', '/mcp/{scope}', '/health'] }));
});
const PORT = process.env.MCP_PORT || 3003;
server.listen(PORT, () => {
    console.log(`🚀 Chatwoot MCP Streamable Server on http://localhost:${PORT}`);
    console.log(`📡 Endpoints:`);
    console.log(`   POST /mcp              - All tools`);
    console.log(`   POST /mcp/specialists  - Specialist tools only`);
    console.log(`   POST /mcp/appointments - Appointment tools only`);
    console.log(`   POST /mcp/calendar     - Specialists + Appointments`);
    console.log(`   POST /mcp/scheduling   - Specialists + Appointments + Contacts`);
    console.log(`   POST /mcp/contacts     - Contact tools only`);
    console.log(`   POST /mcp/conversations- Conversation tools only`);
    console.log(`   POST /mcp/support      - Support tools (conversations, contacts, agents, inboxes, teams)`);
    console.log(`   GET  /health           - Health check with scope details`);
});
//# sourceMappingURL=mcp-streamable-server.js.map