# Endpoints REST

O Deming MCP expõe endpoints REST para integração direta.

## Base URL

```
http://localhost:3001
```

Em produção, use HTTPS e configure adequadamente.

## Endpoints Disponíveis

### Health Check

```
GET /health
```

Verifica se o servidor está funcionando.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

---

### MCP (JSON-RPC)

```
POST /mcp
```

Endpoint principal para chamadas MCP via JSON-RPC 2.0.

**Headers:**
```
Content-Type: application/json
X-API-Key: sua_api_key
```

**Body:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "nome_da_ferramenta",
    "arguments": {}
  }
}
```

---

### Listar Ferramentas

```
POST /mcp
```

**Body:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "list_contacts",
        "description": "Lista todos os contatos",
        "inputSchema": {
          "type": "object",
          "properties": {
            "page": { "type": "number" }
          }
        }
      }
    ]
  }
}
```

---

### Chamar Ferramenta

```
POST /mcp
```

**Body:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_contacts",
    "arguments": {
      "page": 1
    }
  }
}
```

**Resposta de sucesso:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"payload\":[{\"id\":1,\"name\":\"João\"}]}"
      }
    ]
  }
}
```

**Resposta de erro:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": "contact_id is required"
  }
}
```

---

## Painel Administrativo

### Login

```
POST /admin/api/auth/login
```

**Body:**
```json
{
  "username": "admin",
  "password": "senha"
}
```

**Resposta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

---

### Criar Token

```
POST /admin/api/tokens
```

**Headers:**
```
Authorization: Bearer seu_token_admin
```

**Body:**
```json
{
  "name": "Token Integração",
  "scopes": ["read", "write"]
}
```

**Resposta:**
```json
{
  "id": "tok_abc123",
  "name": "Token Integração",
  "token": "mcp_xxxxx",
  "scopes": ["read", "write"],
  "created_at": "2024-01-20T10:00:00Z"
}
```

---

### Listar Tokens

```
GET /admin/api/tokens
```

**Headers:**
```
Authorization: Bearer seu_token_admin
```

---

### Revogar Token

```
DELETE /admin/api/tokens/:id
```

**Headers:**
```
Authorization: Bearer seu_token_admin
```

---

## Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 429 | Rate limit excedido |
| 500 | Erro interno |

---

## Rate Limiting

O servidor implementa rate limiting para proteção:

- **100 requisições** por minuto por IP
- **1000 requisições** por hora por API key

Headers de resposta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705748400
```

---

## Exemplos com cURL

### Listar contatos

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_contacts",
      "arguments": {"page": 1}
    }
  }'
```

### Criar agendamento

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_appointment",
      "arguments": {
        "title": "Consulta",
        "specialist_id": 5,
        "contact_id": 42,
        "start_time": "2024-01-25T14:00:00-03:00",
        "end_time": "2024-01-25T15:00:00-03:00"
      }
    }
  }'
```

### Executar tarefa de IA

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "execute_ai_task",
      "arguments": {
        "template_id": 1,
        "input_data": {"formato": "bullet_points"},
        "conversation_id": 101
      }
    }
  }'
```
