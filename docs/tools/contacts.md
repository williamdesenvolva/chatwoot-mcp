# Contatos

Ferramentas para gerenciar contatos no Chatwoot.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `list_contacts` | Lista todos os contatos |
| `create_contact` | Cria um novo contato |
| `get_contact` | Obtém detalhes de um contato |
| `search_contacts` | Busca contatos por texto |
| `search_contact_by_phone` | Busca contato por telefone |
| `get_contact_appointments` | Lista agendamentos do contato |
| `list_contact_labels` | Lista etiquetas do contato |
| `add_contact_labels` | Adiciona etiquetas ao contato |

---

## list_contacts

Lista todos os contatos da conta com paginação.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Número da página (default: 1) |
| `sort` | string | Não | Campo de ordenação |

**Valores de `sort`**: `name`, `email`, `phone_number`, `last_activity_at`, `-name`, `-email`, `-phone_number`, `-last_activity_at` (prefixo `-` para decrescente)

### Exemplo

```json
{
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
}
```

### Resposta

```json
{
  "payload": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "phone_number": "+5511999999999",
      "created_at": "2024-01-15T10:30:00Z",
      "last_activity_at": "2024-01-20T15:45:00Z"
    }
  ],
  "meta": {
    "count": 150,
    "current_page": 1
  }
}
```

---

## create_contact

Cria um novo contato.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `name` | string | **Sim** | Nome do contato |
| `email` | string | Não | E-mail |
| `phone_number` | string | Não | Telefone (formato: +5511999999999) |
| `identifier` | string | Não | Identificador externo |
| `custom_attributes` | object | Não | Atributos customizados |

### Exemplo

```json
{
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
}
```

### Resposta

```json
{
  "id": 42,
  "name": "Maria Santos",
  "email": "maria@email.com",
  "phone_number": "+5511988888888",
  "custom_attributes": {
    "empresa": "Acme Corp",
    "cargo": "Gerente"
  },
  "created_at": "2024-01-20T16:00:00Z"
}
```

---

## get_contact

Obtém detalhes completos de um contato.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `contact_id` | number | **Sim** | ID do contato |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_contact",
    "arguments": {
      "contact_id": 42
    }
  }
}
```

### Resposta

```json
{
  "id": 42,
  "name": "Maria Santos",
  "email": "maria@email.com",
  "phone_number": "+5511988888888",
  "identifier": null,
  "custom_attributes": {
    "empresa": "Acme Corp"
  },
  "contact_type": "lead",
  "created_at": "2024-01-20T16:00:00Z",
  "last_activity_at": "2024-01-20T18:30:00Z",
  "conversations_count": 3
}
```

---

## search_contacts

Busca contatos por texto (nome, email ou telefone).

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `query` | string | **Sim** | Texto para buscar |
| `page` | number | Não | Página (default: 1) |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_contacts",
    "arguments": {
      "query": "maria",
      "page": 1
    }
  }
}
```

---

## search_contact_by_phone

Busca um contato específico pelo número de telefone.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `phone_number` | string | **Sim** | Número de telefone |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_contact_by_phone",
    "arguments": {
      "phone_number": "+5511988888888"
    }
  }
}
```

### Resposta (encontrado)

```json
{
  "found": true,
  "contact": {
    "id": 42,
    "name": "Maria Santos",
    "email": "maria@email.com",
    "phone_number": "+5511988888888"
  }
}
```

### Resposta (não encontrado)

```json
{
  "found": false,
  "message": "Nenhum contato encontrado com o telefone +5511988888888",
  "suggestion": "Use create_contact para criar um novo contato"
}
```

---

## get_contact_appointments

Lista todos os agendamentos de um contato.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `contact_id` | number | **Sim** | ID do contato |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_contact_appointments",
    "arguments": {
      "contact_id": 42
    }
  }
}
```

---

## list_contact_labels

Lista etiquetas/labels de um contato.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `contact_id` | number | **Sim** | ID do contato |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_contact_labels",
    "arguments": {
      "contact_id": 42
    }
  }
}
```

---

## add_contact_labels

Adiciona etiquetas a um contato.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `contact_id` | number | **Sim** | ID do contato |
| `labels` | array | **Sim** | Lista de labels |

### Exemplo

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

---

## Casos de Uso Comuns

### Buscar ou criar contato

```javascript
// 1. Buscar pelo telefone
const searchResult = await mcpCall('search_contact_by_phone', {
  phone_number: '+5511999999999'
});

let contactId;

if (searchResult.found) {
  contactId = searchResult.contact.id;
} else {
  // 2. Criar se não existir
  const newContact = await mcpCall('create_contact', {
    name: 'Novo Cliente',
    phone_number: '+5511999999999'
  });
  contactId = newContact.id;
}
```

### Listar contatos recentes

```javascript
const recentContacts = await mcpCall('list_contacts', {
  sort: '-last_activity_at',
  page: 1
});
```
