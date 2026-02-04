# Labels (Etiquetas)

Ferramentas para gerenciar etiquetas/labels no Chatwoot.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `list_labels` | Lista todas as etiquetas |
| `create_label` | Cria nova etiqueta |
| `get_label` | Obtém detalhes de uma etiqueta |
| `update_label` | Atualiza uma etiqueta |
| `delete_label` | Remove uma etiqueta |

---

## list_labels

Lista todas as etiquetas da conta.

### Parâmetros

Nenhum parâmetro obrigatório.

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_labels",
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
      "title": "vip",
      "description": "Clientes VIP com atendimento prioritário",
      "color": "#FFD700",
      "show_on_sidebar": true
    },
    {
      "id": 2,
      "title": "urgente",
      "description": "Atendimento urgente",
      "color": "#FF0000",
      "show_on_sidebar": true
    },
    {
      "id": 3,
      "title": "suporte-tecnico",
      "description": "Chamados de suporte técnico",
      "color": "#4A90D9",
      "show_on_sidebar": false
    }
  ]
}
```

---

## create_label

Cria uma nova etiqueta.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `title` | string | **Sim** | Nome da etiqueta |
| `description` | string | Não | Descrição |
| `color` | string | Não | Cor em hexadecimal |
| `show_on_sidebar` | boolean | Não | Exibir na barra lateral |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_label",
    "arguments": {
      "title": "reclamacao",
      "description": "Conversas de reclamação",
      "color": "#FF6B6B",
      "show_on_sidebar": true
    }
  }
}
```

### Resposta

```json
{
  "id": 4,
  "title": "reclamacao",
  "description": "Conversas de reclamação",
  "color": "#FF6B6B",
  "show_on_sidebar": true,
  "created_at": "2024-01-20T16:00:00Z"
}
```

---

## get_label

Obtém detalhes de uma etiqueta específica.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `label_id` | number | **Sim** | ID da etiqueta |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_label",
    "arguments": {
      "label_id": 1
    }
  }
}
```

---

## update_label

Atualiza uma etiqueta existente.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `label_id` | number | **Sim** | ID da etiqueta |
| `title` | string | Não | Novo nome |
| `description` | string | Não | Nova descrição |
| `color` | string | Não | Nova cor |
| `show_on_sidebar` | boolean | Não | Exibir na sidebar |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "update_label",
    "arguments": {
      "label_id": 1,
      "color": "#FFD700",
      "show_on_sidebar": true
    }
  }
}
```

---

## delete_label

Remove uma etiqueta.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `label_id` | number | **Sim** | ID da etiqueta |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "delete_label",
    "arguments": {
      "label_id": 4
    }
  }
}
```

---

## Usando Labels em Contatos e Conversas

### Adicionar labels a um contato

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "add_contact_labels",
    "arguments": {
      "contact_id": 42,
      "labels": ["vip", "premium"]
    }
  }
}
```

### Adicionar labels a uma conversa

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

### Criar estrutura de labels para classificação

```javascript
// Criar labels de prioridade
const labels = [
  { title: 'prioridade-alta', color: '#FF0000', description: 'Atendimento imediato' },
  { title: 'prioridade-media', color: '#FFA500', description: 'Atendimento em até 4h' },
  { title: 'prioridade-baixa', color: '#00FF00', description: 'Atendimento regular' }
];

for (const label of labels) {
  await mcpCall('create_label', {
    title: label.title,
    color: label.color,
    description: label.description,
    show_on_sidebar: true
  });
}
```

### Classificar conversa automaticamente

```javascript
// Analisar conteúdo e aplicar labels
const conversation = await mcpCall('get_conversation', {
  conversation_id: 101
});

const labels = [];

// Verificar se é cliente VIP
const contact = await mcpCall('get_contact', {
  contact_id: conversation.contact.id
});

if (contact.custom_attributes?.plano === 'premium') {
  labels.push('vip');
}

// Verificar urgência baseado em palavras-chave
const messages = await mcpCall('list_messages', {
  conversation_id: 101
});

const urgentKeywords = ['urgente', 'emergência', 'crítico'];
const hasUrgent = messages.payload.some(m =>
  urgentKeywords.some(k => m.content?.toLowerCase().includes(k))
);

if (hasUrgent) {
  labels.push('urgente');
}

// Aplicar labels
if (labels.length > 0) {
  await mcpCall('add_conversation_labels', {
    conversation_id: 101,
    labels: labels
  });
}
```
