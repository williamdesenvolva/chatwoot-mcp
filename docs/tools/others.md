# Outras Ferramentas

Ferramentas adicionais disponíveis no Deming MCP.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `get_account_info` | Informações da conta |
| `list_agents` | Lista agentes/usuários |
| `list_teams` | Lista equipes |
| `list_inboxes` | Lista caixas de entrada |
| `list_canned_responses` | Respostas rápidas |

---

## get_account_info

Obtém informações da conta Chatwoot.

### Parâmetros

Nenhum parâmetro obrigatório.

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_account_info",
    "arguments": {}
  }
}
```

### Resposta

```json
{
  "id": 1,
  "name": "Minha Empresa",
  "locale": "pt-BR",
  "domain": "empresa.chatwoot.com",
  "support_email": "suporte@empresa.com",
  "features": {
    "channel_email": true,
    "channel_whatsapp": true,
    "channel_api": true
  },
  "limits": {
    "agents": 10,
    "inboxes": 5
  }
}
```

---

## list_agents

Lista todos os agentes/usuários da conta.

### Parâmetros

Nenhum parâmetro obrigatório.

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_agents",
    "arguments": {}
  }
}
```

### Resposta

```json
{
  "payload": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": "administrator",
      "availability_status": "online",
      "confirmed": true
    },
    {
      "id": 2,
      "name": "Maria Santos",
      "email": "maria@empresa.com",
      "role": "agent",
      "availability_status": "busy",
      "confirmed": true
    }
  ]
}
```

### Roles (Funções)

| Role | Descrição |
|------|-----------|
| `administrator` | Acesso total |
| `agent` | Atendente padrão |

### Status de Disponibilidade

| Status | Descrição |
|--------|-----------|
| `online` | Disponível |
| `busy` | Ocupado |
| `offline` | Offline |

---

## list_teams

Lista todas as equipes da conta.

### Parâmetros

Nenhum parâmetro obrigatório.

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_teams",
    "arguments": {}
  }
}
```

### Resposta

```json
{
  "payload": [
    {
      "id": 1,
      "name": "Suporte Técnico",
      "description": "Equipe de suporte técnico",
      "allow_auto_assign": true,
      "members_count": 5
    },
    {
      "id": 2,
      "name": "Vendas",
      "description": "Equipe comercial",
      "allow_auto_assign": false,
      "members_count": 3
    }
  ]
}
```

---

## list_inboxes

Lista todas as caixas de entrada (canais) da conta.

### Parâmetros

Nenhum parâmetro obrigatório.

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_inboxes",
    "arguments": {}
  }
}
```

### Resposta

```json
{
  "payload": [
    {
      "id": 1,
      "name": "WhatsApp Business",
      "channel_type": "Channel::Whatsapp",
      "phone_number": "+5511999999999",
      "greeting_enabled": true,
      "greeting_message": "Olá! Como posso ajudar?"
    },
    {
      "id": 2,
      "name": "Email Suporte",
      "channel_type": "Channel::Email",
      "email": "suporte@empresa.com"
    },
    {
      "id": 3,
      "name": "Website Chat",
      "channel_type": "Channel::WebWidget",
      "website_url": "https://empresa.com"
    }
  ]
}
```

### Tipos de Canal

| Tipo | Descrição |
|------|-----------|
| `Channel::Whatsapp` | WhatsApp Business |
| `Channel::Email` | Email |
| `Channel::WebWidget` | Chat no site |
| `Channel::Api` | API Channel |
| `Channel::Sms` | SMS |
| `Channel::Telegram` | Telegram |
| `Channel::Facebook` | Facebook Messenger |
| `Channel::Instagram` | Instagram Direct |

---

## list_canned_responses

Lista respostas rápidas/predefinidas.

### Parâmetros

Nenhum parâmetro obrigatório.

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_canned_responses",
    "arguments": {}
  }
}
```

### Resposta

```json
{
  "payload": [
    {
      "id": 1,
      "short_code": "ola",
      "content": "Olá! Seja bem-vindo(a) ao nosso atendimento. Como posso ajudar?",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "short_code": "aguarde",
      "content": "Por favor, aguarde um momento enquanto verifico as informações.",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 3,
      "short_code": "obrigado",
      "content": "Agradecemos seu contato! Ficamos à disposição para novas dúvidas.",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Casos de Uso Comuns

### Verificar agentes disponíveis

```javascript
const agents = await mcpCall('list_agents', {});
const online = agents.payload.filter(a => a.availability_status === 'online');

console.log(`${online.length} agentes online:`);
online.forEach(a => console.log(`- ${a.name}`));
```

### Listar canais ativos

```javascript
const inboxes = await mcpCall('list_inboxes', {});

console.log('Canais configurados:');
inboxes.payload.forEach(inbox => {
  console.log(`- ${inbox.name} (${inbox.channel_type})`);
});
```

### Buscar resposta rápida

```javascript
const responses = await mcpCall('list_canned_responses', {});
const saudacao = responses.payload.find(r => r.short_code === 'ola');

if (saudacao) {
  await mcpCall('create_message', {
    conversation_id: 101,
    content: saudacao.content
  });
}
```

### Distribuir conversa para equipe

```javascript
// Listar equipes disponíveis
const teams = await mcpCall('list_teams', {});
const suporte = teams.payload.find(t => t.name.includes('Suporte'));

// Atribuir conversa à equipe (via update_conversation se disponível)
console.log(`Encaminhar para equipe: ${suporte.name} (ID: ${suporte.id})`);
```
