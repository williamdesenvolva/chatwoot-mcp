# Agendamentos

Ferramentas para gerenciar agendamentos e horários no Chatwoot.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `list_appointments` | Lista agendamentos |
| `create_appointment` | Cria novo agendamento |
| `get_appointment` | Obtém detalhes do agendamento |
| `update_appointment` | Atualiza agendamento |
| `delete_appointment` | Cancela agendamento |
| `list_appointment_attachments` | Lista anexos |
| `get_appointment_attachment` | Obtém anexo |
| `upload_appointment_attachment` | Faz upload de anexo |
| `delete_appointment_attachment` | Remove anexo |
| `download_appointment_attachment` | URL de download |

---

## list_appointments

Lista todos os agendamentos com filtros opcionais.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `specialist_id` | number | Não | Filtrar por especialista |
| `status` | string | Não | Filtrar por status |

**Valores de `status`**: `pending`, `confirmed`, `cancelled`, `completed`

### Exemplo

```json
{
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
}
```

### Resposta

```json
{
  "payload": [
    {
      "id": 1,
      "title": "Consulta - Maria Santos",
      "description": "Primeira consulta",
      "specialist": {
        "id": 5,
        "name": "Dr. João Silva"
      },
      "contacts": [
        {
          "id": 42,
          "name": "Maria Santos"
        }
      ],
      "start_time": "2024-01-25T14:00:00-03:00",
      "end_time": "2024-01-25T15:00:00-03:00",
      "status": "confirmed"
    }
  ]
}
```

---

## create_appointment

Cria um novo agendamento.

> ⚠️ **IMPORTANTE**: Siga o fluxo correto para criar agendamentos!

### Fluxo Recomendado

1. **Buscar especialista** → `search_specialist_by_name`
2. **Verificar disponibilidade** → `get_available_slots`
3. **Buscar/criar contato** → `search_contact_by_phone` ou `create_contact`
4. **Criar agendamento** → `create_appointment`

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `title` | string | **Sim** | Título do agendamento |
| `specialist_id` | number | **Sim** | ID do especialista |
| `start_time` | string | **Sim** | Data/hora início (ISO 8601) |
| `end_time` | string | **Sim** | Data/hora fim (ISO 8601) |
| `contact_id` | number | **Sim** | ID do contato |
| `description` | string | Não | Detalhes adicionais |

### Formato de Data/Hora

Use o formato ISO 8601 com timezone:
- `2024-01-25T14:00:00-03:00` (horário de Brasília)
- `2024-01-25T17:00:00Z` (UTC)

### Exemplo Completo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_appointment",
    "arguments": {
      "title": "Consulta - Maria Santos",
      "description": "Primeira consulta. Paciente com histórico de hipertensão.",
      "specialist_id": 5,
      "start_time": "2024-01-25T14:00:00-03:00",
      "end_time": "2024-01-25T15:00:00-03:00",
      "contact_id": 42
    }
  }
}
```

### Resposta

```json
{
  "id": 150,
  "title": "Consulta - Maria Santos",
  "description": "Primeira consulta. Paciente com histórico de hipertensão.",
  "specialist": {
    "id": 5,
    "name": "Dr. João Silva"
  },
  "contacts": [
    {
      "id": 42,
      "name": "Maria Santos"
    }
  ],
  "start_time": "2024-01-25T14:00:00-03:00",
  "end_time": "2024-01-25T15:00:00-03:00",
  "status": "pending",
  "created_at": "2024-01-20T10:00:00Z"
}
```

---

## get_appointment

Obtém detalhes completos de um agendamento.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `appointment_id` | number | **Sim** | ID do agendamento |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_appointment",
    "arguments": {
      "appointment_id": 150
    }
  }
}
```

---

## update_appointment

Atualiza um agendamento existente.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `appointment_id` | number | **Sim** | ID do agendamento |
| `title` | string | Não | Novo título |
| `status` | string | Não | Novo status |
| `start_time` | string | Não | Nova data/hora início |
| `end_time` | string | Não | Nova data/hora fim |

### Exemplo - Confirmar Agendamento

```json
{
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
}
```

### Exemplo - Remarcar

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "update_appointment",
    "arguments": {
      "appointment_id": 150,
      "start_time": "2024-01-26T10:00:00-03:00",
      "end_time": "2024-01-26T11:00:00-03:00"
    }
  }
}
```

---

## delete_appointment

Cancela/remove um agendamento.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `appointment_id` | number | **Sim** | ID do agendamento |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "delete_appointment",
    "arguments": {
      "appointment_id": 150
    }
  }
}
```

---

## Anexos de Agendamentos

### list_appointment_attachments

Lista anexos de um agendamento.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_appointment_attachments",
    "arguments": {
      "appointment_id": 150
    }
  }
}
```

### upload_appointment_attachment

Faz upload de um arquivo para o agendamento.

**Opção 1: Via URL**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "upload_appointment_attachment",
    "arguments": {
      "appointment_id": 150,
      "file_url": "https://example.com/documento.pdf"
    }
  }
}
```

**Opção 2: Via Base64**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "upload_appointment_attachment",
    "arguments": {
      "appointment_id": 150,
      "file_content": "JVBERi0xLjQKJeLjz9...",
      "file_name": "exame.pdf",
      "file_type": "application/pdf"
    }
  }
}
```

### download_appointment_attachment

Obtém URL para download de um anexo.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "download_appointment_attachment",
    "arguments": {
      "appointment_id": 150,
      "attachment_id": 25
    }
  }
}
```

---

## Fluxo Completo de Agendamento

```javascript
// 1. Buscar especialista pelo nome
const specialist = await mcpCall('search_specialist_by_name', {
  name: 'Dr. João'
});
const specialistId = specialist.specialists[0].id;

// 2. Verificar horários disponíveis
const slots = await mcpCall('get_available_slots', {
  specialist_id: specialistId,
  date: '2024-01-25'
});

// 3. Buscar cliente pelo telefone
const contact = await mcpCall('search_contact_by_phone', {
  phone_number: '+5511999999999'
});

let contactId;
if (contact.found) {
  contactId = contact.contact.id;
} else {
  // Criar se não existir
  const newContact = await mcpCall('create_contact', {
    name: 'Maria Santos',
    phone_number: '+5511999999999'
  });
  contactId = newContact.id;
}

// 4. Criar o agendamento
const appointment = await mcpCall('create_appointment', {
  title: 'Consulta - Maria Santos',
  specialist_id: specialistId,
  start_time: '2024-01-25T14:00:00-03:00',
  end_time: '2024-01-25T15:00:00-03:00',
  contact_id: contactId
});

console.log(`Agendamento criado: ${appointment.id}`);
```
