# Exemplos com cURL

Exemplos práticos de chamadas usando cURL.

## Configuração Inicial

Defina variáveis de ambiente para facilitar:

```bash
export MCP_URL="http://localhost:3001"
export MCP_API_KEY="sua_api_key"
```

## Contatos

### Listar contatos

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_contacts",
      "arguments": {
        "page": 1,
        "sort": "-last_activity_at"
      }
    }
  }'
```

### Buscar contato por telefone

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_contact_by_phone",
      "arguments": {
        "phone_number": "+5511999999999"
      }
    }
  }'
```

### Criar contato

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_contact",
      "arguments": {
        "name": "Maria Santos",
        "email": "maria@email.com",
        "phone_number": "+5511988888888",
        "custom_attributes": {
          "empresa": "Acme Corp",
          "cargo": "Gerente"
        }
      }
    }
  }'
```

---

## Conversas

### Listar conversas abertas

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_conversations",
      "arguments": {
        "status": "open",
        "page": 1
      }
    }
  }'
```

### Listar mensagens de uma conversa

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_messages",
      "arguments": {
        "conversation_id": 101
      }
    }
  }'
```

### Enviar mensagem

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_message",
      "arguments": {
        "conversation_id": 101,
        "content": "Olá! Como posso ajudar?"
      }
    }
  }'
```

### Enviar nota privada

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_message",
      "arguments": {
        "conversation_id": 101,
        "content": "ATENÇÃO: Cliente VIP",
        "private": true
      }
    }
  }'
```

---

## Especialistas

### Listar especialistas

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_specialists",
      "arguments": {}
    }
  }'
```

### Buscar especialista por nome

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_specialist_by_name",
      "arguments": {
        "name": "João"
      }
    }
  }'
```

### Verificar horários disponíveis

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_available_slots",
      "arguments": {
        "specialist_id": 5,
        "date": "2024-01-25"
      }
    }
  }'
```

---

## Agendamentos

### Criar agendamento

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_appointment",
      "arguments": {
        "title": "Consulta - Maria Santos",
        "description": "Primeira consulta",
        "specialist_id": 5,
        "contact_id": 42,
        "start_time": "2024-01-25T14:00:00-03:00",
        "end_time": "2024-01-25T15:00:00-03:00"
      }
    }
  }'
```

### Listar agendamentos

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_appointments",
      "arguments": {
        "specialist_id": 5,
        "status": "confirmed"
      }
    }
  }'
```

### Atualizar status do agendamento

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "update_appointment",
      "arguments": {
        "appointment_id": 150,
        "status": "confirmed"
      }
    }
  }'
```

---

## Tarefas de IA

### Listar templates de IA

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_ai_task_templates",
      "arguments": {
        "category": "atendimento"
      }
    }
  }'
```

### Executar tarefa de IA

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "execute_ai_task",
      "arguments": {
        "template_id": 1,
        "input_data": {
          "formato": "bullet_points",
          "idioma": "pt-BR"
        },
        "conversation_id": 101
      }
    }
  }'
```

### Enviar feedback

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "send_ai_task_feedback",
      "arguments": {
        "execution_id": 500,
        "feedback": "positive"
      }
    }
  }'
```

---

## Processos

### Listar templates de processos

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_process_templates",
      "arguments": {}
    }
  }'
```

### Criar processo

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_process",
      "arguments": {
        "template_id": 1,
        "name": "Onboarding - Empresa XYZ",
        "description": "Novo cliente"
      }
    }
  }'
```

### Mover card de processo

```bash
curl -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MCP_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "move_process_card",
      "arguments": {
        "process_id": 1,
        "card_id": 101,
        "target_stage_id": 3
      }
    }
  }'
```

---

## Scripts Úteis

### Script: Fluxo completo de agendamento

```bash
#!/bin/bash

# Configurações
MCP_URL="http://localhost:3001"
MCP_API_KEY="sua_api_key"

# Função helper
mcp_call() {
  local tool_name=$1
  local arguments=$2

  curl -s -X POST "$MCP_URL/mcp" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $MCP_API_KEY" \
    -d "{
      \"jsonrpc\": \"2.0\",
      \"id\": 1,
      \"method\": \"tools/call\",
      \"params\": {
        \"name\": \"$tool_name\",
        \"arguments\": $arguments
      }
    }"
}

# 1. Buscar especialista
echo "Buscando especialista..."
mcp_call "search_specialist_by_name" '{"name": "João"}'

# 2. Verificar disponibilidade
echo -e "\n\nVerificando disponibilidade..."
mcp_call "get_available_slots" '{"specialist_id": 5, "date": "2024-01-25"}'

# 3. Buscar contato
echo -e "\n\nBuscando contato..."
mcp_call "search_contact_by_phone" '{"phone_number": "+5511999999999"}'

# 4. Criar agendamento
echo -e "\n\nCriando agendamento..."
mcp_call "create_appointment" '{
  "title": "Consulta",
  "specialist_id": 5,
  "contact_id": 42,
  "start_time": "2024-01-25T14:00:00-03:00",
  "end_time": "2024-01-25T15:00:00-03:00"
}'
```

### Script: Testar todas as ferramentas

```bash
#!/bin/bash

# Listar ferramentas disponíveis
curl -s -X POST "http://localhost:3001/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }' | jq '.result.tools[].name'
```
