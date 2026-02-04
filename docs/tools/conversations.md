# Conversas

Ferramentas para gerenciar conversas e mensagens no Chatwoot.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `list_conversations` | Lista conversas |
| `get_conversation` | Obtém detalhes de uma conversa |
| `list_messages` | Lista mensagens de uma conversa |
| `create_message` | Envia uma mensagem |
| `list_conversation_labels` | Lista labels da conversa |
| `add_conversation_labels` | Adiciona labels à conversa |

---

## list_conversations

Lista conversas com filtros opcionais.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `status` | string | Não | Filtrar por status |
| `inbox_id` | number | Não | Filtrar por inbox |
| `assignee_id` | number | Não | Filtrar por agente |
| `page` | number | Não | Página (default: 1) |

**Valores de `status`**: `open`, `resolved`, `pending`, `snoozed`, `all`

### Exemplo

```json
{
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
}
```

### Resposta

```json
{
  "data": {
    "payload": [
      {
        "id": 1,
        "display_id": 101,
        "inbox_id": 1,
        "status": "open",
        "priority": "medium",
        "contact": {
          "id": 42,
          "name": "Maria Santos"
        },
        "assignee": {
          "id": 5,
          "name": "João Atendente"
        },
        "last_activity_at": "2024-01-20T18:30:00Z",
        "messages_count": 15
      }
    ],
    "meta": {
      "count": 50,
      "current_page": 1
    }
  }
}
```

---

## get_conversation

Obtém detalhes completos de uma conversa.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `conversation_id` | number | **Sim** | ID da conversa |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_conversation",
    "arguments": {
      "conversation_id": 101
    }
  }
}
```

### Resposta

```json
{
  "id": 1,
  "display_id": 101,
  "inbox_id": 1,
  "status": "open",
  "priority": "high",
  "contact": {
    "id": 42,
    "name": "Maria Santos",
    "email": "maria@email.com",
    "phone_number": "+5511988888888"
  },
  "assignee": {
    "id": 5,
    "name": "João Atendente",
    "email": "joao@empresa.com"
  },
  "team": {
    "id": 2,
    "name": "Suporte"
  },
  "labels": ["urgente", "vip"],
  "custom_attributes": {},
  "created_at": "2024-01-15T10:00:00Z",
  "last_activity_at": "2024-01-20T18:30:00Z"
}
```

---

## list_messages

Lista todas as mensagens de uma conversa.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `conversation_id` | number | **Sim** | ID da conversa |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_messages",
    "arguments": {
      "conversation_id": 101
    }
  }
}
```

### Resposta

```json
{
  "payload": [
    {
      "id": 1,
      "content": "Olá, preciso de ajuda!",
      "message_type": "incoming",
      "sender": {
        "id": 42,
        "name": "Maria Santos",
        "type": "contact"
      },
      "created_at": "2024-01-20T18:00:00Z"
    },
    {
      "id": 2,
      "content": "Olá Maria! Como posso ajudar?",
      "message_type": "outgoing",
      "sender": {
        "id": 5,
        "name": "João Atendente",
        "type": "user"
      },
      "created_at": "2024-01-20T18:05:00Z"
    }
  ]
}
```

---

## create_message

Envia uma mensagem em uma conversa.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `conversation_id` | number | **Sim** | ID da conversa |
| `content` | string | **Sim** | Conteúdo da mensagem |
| `message_type` | string | Não | Tipo: `outgoing` (default), `private` |
| `private` | boolean | Não | Se é nota privada |

### Exemplo - Mensagem Normal

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_message",
    "arguments": {
      "conversation_id": 101,
      "content": "Sua solicitação foi processada com sucesso!"
    }
  }
}
```

### Exemplo - Nota Privada

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_message",
    "arguments": {
      "conversation_id": 101,
      "content": "Cliente VIP, priorizar atendimento",
      "private": true
    }
  }
}
```

### Resposta

```json
{
  "id": 150,
  "content": "Sua solicitação foi processada com sucesso!",
  "message_type": "outgoing",
  "conversation_id": 101,
  "created_at": "2024-01-20T18:35:00Z"
}
```

---

## list_conversation_labels

Lista as etiquetas de uma conversa.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `conversation_id` | number | **Sim** | ID da conversa |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_conversation_labels",
    "arguments": {
      "conversation_id": 101
    }
  }
}
```

---

## add_conversation_labels

Adiciona etiquetas a uma conversa.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `conversation_id` | number | **Sim** | ID da conversa |
| `labels` | array | **Sim** | Lista de labels |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "add_conversation_labels",
    "arguments": {
      "conversation_id": 101,
      "labels": ["urgente", "suporte-tecnico"]
    }
  }
}
```

---

## Casos de Uso Comuns

### Responder a uma conversa

```javascript
// 1. Buscar conversa
const conversation = await mcpCall('get_conversation', {
  conversation_id: 101
});

// 2. Listar mensagens recentes
const messages = await mcpCall('list_messages', {
  conversation_id: 101
});

// 3. Enviar resposta
await mcpCall('create_message', {
  conversation_id: 101,
  content: 'Obrigado pelo contato! Vou verificar sua solicitação.'
});
```

### Adicionar nota interna

```javascript
await mcpCall('create_message', {
  conversation_id: 101,
  content: 'ATENÇÃO: Cliente já teve 3 reclamações anteriores',
  private: true
});
```

### Classificar conversa

```javascript
await mcpCall('add_conversation_labels', {
  conversation_id: 101,
  labels: ['reclamacao', 'prioridade-alta', 'financeiro']
});
```
