#!/usr/bin/env node
import 'dotenv/config';
import http from 'http';
import { ChatwootClient } from './shared/api-client.js';
import {
  Contact, Conversation, Message, Agent, Inbox, Team,
  Webhook, CannedResponse, CustomAttribute, CustomFilter,
  AutomationRule, Specialist, Appointment, AvailableSlot
} from './shared/types.js';

// Admin panel imports
import { handleAdminRoute, tokenService, auditService, initializeDatabase } from './admin/index.js';

const client = new ChatwootClient();

// Legacy API Key for backward compatibility
const LEGACY_API_KEY = process.env.MCP_API_KEY || 'chatwoot-mcp-secret-key';

// CORS - origens permitidas (separadas por vírgula)
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());

// Rate limiting map (per token/IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

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
    let adminBody: any = {};
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      adminBody = await parseBody(req);
    }
    const handled = await handleAdminRoute(req, res, authUrl.pathname, adminBody);
    if (handled) return;
  }

  // Get client info for audit logging
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'];

  // Token validation context
  let tokenId: string | undefined;
  let tokenPermissions: any;

  // Verificar API Key (exceto para health check)
  if (authUrl.pathname !== '/' && authUrl.pathname !== '/health') {
    const apiKey = req.headers['x-api-key'] as string;

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
      const hasPermission = tokenService.hasPermission(
        validation.permissions,
        permission.category,
        permission.action
      );
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

  // Rate limiting simples (por IP)
  const now = Date.now();
  if (!rateLimitMap.has(clientIp)) {
    rateLimitMap.set(clientIp, { count: 0, resetTime: now + 60000 });
  }
  const rateLimit = rateLimitMap.get(clientIp)!;
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
    let body: Record<string, unknown> = {};
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      body = await parseBody(req);
    }

    // Get account_id from query params, body, or header
    const accountId = (params.account_id as string) ||
                      (body.account_id as string) ||
                      (req.headers['x-account-id'] as string);

    // Set dynamic account ID if provided
    if (accountId) {
      client.setAccountId(accountId);
      // Remove account_id from params/body so it doesn't get passed to the API
      delete params.account_id;
      delete body.account_id;
    } else {
      client.clearAccountId();
    }

    // Validate that we have an account ID (either dynamic or from config)
    // Skip validation for health check only
    const skipAccountValidation = path === '/' || path === '/health';
    if (!skipAccountValidation && !client.accountId) {
      res.writeHead(400);
      res.end(JSON.stringify({
        error: 'Missing account_id',
        message: 'Please provide account_id via query parameter, request body, X-Account-Id header, or configure CHATWOOT_ACCOUNT_ID environment variable'
      }));
      return;
    }

    let result: unknown;

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
      result = {
        tools: [
          {
            name: 'list_specialists',
            description: 'Lista todos os especialistas disponíveis',
            parameters: {}
          },
          {
            name: 'create_specialist',
            description: 'Cria um novo especialista',
            parameters: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', description: 'Nome do especialista' },
                email: { type: 'string', description: 'Email do especialista' },
                phone: { type: 'string', description: 'Telefone do especialista' },
                active: { type: 'boolean', description: 'Se está ativo', default: true }
              }
            }
          },
          {
            name: 'get_specialist',
            description: 'Obtém detalhes de um especialista',
            parameters: {
              type: 'object',
              required: ['specialist_id'],
              properties: {
                specialist_id: { type: 'number', description: 'ID do especialista' }
              }
            }
          },
          {
            name: 'update_specialist',
            description: 'Atualiza um especialista',
            parameters: {
              type: 'object',
              required: ['specialist_id'],
              properties: {
                specialist_id: { type: 'number', description: 'ID do especialista' },
                name: { type: 'string', description: 'Nome do especialista' },
                email: { type: 'string', description: 'Email' },
                phone: { type: 'string', description: 'Telefone' },
                active: { type: 'boolean', description: 'Se está ativo' }
              }
            }
          },
          {
            name: 'delete_specialist',
            description: 'Deleta um especialista',
            parameters: {
              type: 'object',
              required: ['specialist_id'],
              properties: {
                specialist_id: { type: 'number', description: 'ID do especialista' }
              }
            }
          },
          {
            name: 'list_appointments',
            description: 'Lista todos os agendamentos',
            parameters: {
              type: 'object',
              properties: {
                specialist_id: { type: 'number', description: 'Filtrar por especialista' },
                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'], description: 'Filtrar por status' }
              }
            }
          },
          {
            name: 'create_appointment',
            description: 'Cria um novo agendamento',
            parameters: {
              type: 'object',
              required: ['title', 'specialist_id', 'start_time', 'end_time'],
              properties: {
                title: { type: 'string', description: 'Título do agendamento' },
                description: { type: 'string', description: 'Descrição do agendamento' },
                specialist_id: { type: 'number', description: 'ID do especialista' },
                start_time: { type: 'string', format: 'date-time', description: 'Data/hora início (ISO 8601)', example: '2026-01-16T14:00:00.000Z' },
                end_time: { type: 'string', format: 'date-time', description: 'Data/hora fim (ISO 8601)', example: '2026-01-16T14:30:00.000Z' },
                contact_id: { type: 'number', description: 'ID do contato (opcional)' }
              }
            }
          },
          {
            name: 'get_appointment',
            description: 'Obtém detalhes de um agendamento',
            parameters: {
              type: 'object',
              required: ['appointment_id'],
              properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento' }
              }
            }
          },
          {
            name: 'update_appointment',
            description: 'Atualiza um agendamento',
            parameters: {
              type: 'object',
              required: ['appointment_id'],
              properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento' },
                title: { type: 'string', description: 'Título' },
                description: { type: 'string', description: 'Descrição' },
                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'], description: 'Status' },
                start_time: { type: 'string', format: 'date-time', description: 'Data/hora início' },
                end_time: { type: 'string', format: 'date-time', description: 'Data/hora fim' }
              }
            }
          },
          {
            name: 'delete_appointment',
            description: 'Deleta um agendamento',
            parameters: {
              type: 'object',
              required: ['appointment_id'],
              properties: {
                appointment_id: { type: 'number', description: 'ID do agendamento' }
              }
            }
          },
          {
            name: 'list_contacts',
            description: 'Lista todos os contatos',
            parameters: {
              type: 'object',
              properties: {
                page: { type: 'number', description: 'Número da página' }
              }
            }
          },
          {
            name: 'create_contact',
            description: 'Cria um novo contato',
            parameters: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', description: 'Nome do contato' },
                email: { type: 'string', description: 'Email' },
                phone_number: { type: 'string', description: 'Telefone' }
              }
            }
          },
          {
            name: 'list_conversations',
            description: 'Lista todas as conversas',
            parameters: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['open', 'resolved', 'pending'], description: 'Filtrar por status' },
                inbox_id: { type: 'number', description: 'Filtrar por inbox' }
              }
            }
          },
          {
            name: 'create_message',
            description: 'Envia uma mensagem em uma conversa',
            parameters: {
              type: 'object',
              required: ['conversation_id', 'content'],
              properties: {
                conversation_id: { type: 'number', description: 'ID da conversa' },
                content: { type: 'string', description: 'Conteúdo da mensagem' },
                private: { type: 'boolean', description: 'Se é nota interna', default: false }
              }
            }
          },
          {
            name: 'list_agents',
            description: 'Lista todos os agentes',
            parameters: {}
          },
          {
            name: 'list_inboxes',
            description: 'Lista todas as inboxes',
            parameters: {}
          },
          {
            name: 'list_teams',
            description: 'Lista todos os times',
            parameters: {}
          },
          {
            name: 'list_labels',
            description: 'Lista todas as labels',
            parameters: {}
          }
        ]
      };
    }

    // ============ MCP ENDPOINT (ÚNICO) ============
    else if (path === '/mcp' && req.method === 'POST') {
      // LOG da requisição
      console.log('=== MCP REQUEST ===');
      console.log('Body recebido:', JSON.stringify(body, null, 2));

      const { tool, params: toolParams } = body as { tool: string; params?: Record<string, unknown> };

      console.log('Tool:', tool);
      console.log('Params:', JSON.stringify(toolParams, null, 2));

      if (!tool) {
        console.log('ERRO: Tool não informada');
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing "tool" in request body' }));
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
          'GET /contacts/search', 'POST /contacts/filter', 'GET /contacts/:id/conversations',
          'GET /conversations', 'POST /conversations', 'GET /conversations/:id', 'PATCH /conversations/:id',
          'POST /conversations/:id/toggle_status', 'POST /conversations/:id/assignments',
          'GET /conversations/:id/messages', 'POST /conversations/:id/messages',
          'GET /agents', 'GET /agents/:id',
          'GET /inboxes', 'GET /inboxes/:id', 'GET /inboxes/:id/agents',
          'GET /teams', 'POST /teams', 'GET /teams/:id', 'PATCH /teams/:id', 'DELETE /teams/:id',
          'GET /specialists', 'POST /specialists', 'GET /specialists/:id', 'PATCH /specialists/:id', 'DELETE /specialists/:id',
          'GET /specialists/:id/availabilities', 'PUT /specialists/:id/availabilities', 'GET /specialists/:id/available_slots',
          'GET /appointments', 'POST /appointments', 'GET /appointments/:id', 'PATCH /appointments/:id', 'DELETE /appointments/:id',
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
      auditService.logApiRequest(
        tokenId,
        req.method || 'GET',
        path,
        200,
        clientIp,
        userAgent
      ).catch(console.error);
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: message }));

    // Audit log error (async, non-blocking)
    if (tokenId) {
      auditService.logApiRequest(
        tokenId,
        req.method || 'GET',
        path,
        500,
        clientIp,
        userAgent,
        { error: message }
      ).catch(console.error);
    }
  }
});

function parseBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
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
    } else {
      console.log('[DB] DATABASE_URL not set - using legacy API key only');
    }
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error);
    console.log('[DB] Server will run with legacy API key only');
  }

  server.listen(PORT, () => {
    console.log(`🚀 Chatwoot MCP HTTP Server running on http://localhost:${PORT}`);
    console.log(`📚 API Endpoints: GET /`);
    console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
  });
}

startServer();
