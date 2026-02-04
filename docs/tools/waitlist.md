# Lista de Espera (Waitlist)

Ferramentas para gerenciar a lista de espera de atendimentos.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `get_waitlist` | Lista clientes na espera |
| `add_to_waitlist` | Adiciona à lista de espera |
| `remove_from_waitlist` | Remove da lista |
| `update_waitlist_position` | Atualiza posição |

---

## get_waitlist

Obtém a lista de espera atual.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `specialist_id` | number | Não | Filtrar por especialista |
| `status` | string | Não | Filtrar por status |

**Valores de `status`**: `waiting`, `notified`, `attended`, `cancelled`

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_waitlist",
    "arguments": {
      "status": "waiting"
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
      "position": 1,
      "contact": {
        "id": 42,
        "name": "Maria Santos",
        "phone_number": "+5511999999999"
      },
      "specialist": {
        "id": 5,
        "name": "Dr. João Silva"
      },
      "status": "waiting",
      "priority": "normal",
      "notes": "Prefere horário pela manhã",
      "created_at": "2024-01-20T08:00:00Z",
      "estimated_wait_time": 45
    },
    {
      "id": 2,
      "position": 2,
      "contact": {
        "id": 55,
        "name": "Carlos Oliveira",
        "phone_number": "+5511988888888"
      },
      "specialist": {
        "id": 5,
        "name": "Dr. João Silva"
      },
      "status": "waiting",
      "priority": "high",
      "notes": "Retorno urgente",
      "created_at": "2024-01-20T08:30:00Z",
      "estimated_wait_time": 90
    }
  ],
  "meta": {
    "total_waiting": 5,
    "avg_wait_time": 60
  }
}
```

---

## add_to_waitlist

Adiciona um contato à lista de espera.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `contact_id` | number | **Sim** | ID do contato |
| `specialist_id` | number | Não | ID do especialista preferido |
| `priority` | string | Não | Prioridade: `low`, `normal`, `high` |
| `notes` | string | Não | Observações |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "add_to_waitlist",
    "arguments": {
      "contact_id": 60,
      "specialist_id": 5,
      "priority": "normal",
      "notes": "Disponível apenas à tarde"
    }
  }
}
```

### Resposta

```json
{
  "id": 10,
  "position": 6,
  "contact": {
    "id": 60,
    "name": "Ana Costa"
  },
  "specialist": {
    "id": 5,
    "name": "Dr. João Silva"
  },
  "status": "waiting",
  "priority": "normal",
  "notes": "Disponível apenas à tarde",
  "estimated_wait_time": 180,
  "created_at": "2024-01-20T10:00:00Z"
}
```

---

## remove_from_waitlist

Remove um registro da lista de espera.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `waitlist_id` | number | **Sim** | ID do registro |
| `reason` | string | Não | Motivo: `attended`, `cancelled`, `no_show` |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "remove_from_waitlist",
    "arguments": {
      "waitlist_id": 1,
      "reason": "attended"
    }
  }
}
```

### Resposta

```json
{
  "success": true,
  "message": "Removido da lista de espera",
  "waitlist_id": 1,
  "reason": "attended"
}
```

---

## update_waitlist_position

Atualiza a posição ou prioridade na lista.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `waitlist_id` | number | **Sim** | ID do registro |
| `position` | number | Não | Nova posição |
| `priority` | string | Não | Nova prioridade |
| `notes` | string | Não | Atualizar observações |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "update_waitlist_position",
    "arguments": {
      "waitlist_id": 2,
      "priority": "high",
      "notes": "Paciente com urgência médica"
    }
  }
}
```

### Resposta

```json
{
  "id": 2,
  "position": 1,
  "priority": "high",
  "notes": "Paciente com urgência médica",
  "status": "waiting"
}
```

---

## Casos de Uso Comuns

### Adicionar cliente à espera quando não há horários

```javascript
// 1. Verificar disponibilidade
const slots = await mcpCall('get_available_slots', {
  specialist_id: 5,
  date: '2024-01-25'
});

if (slots.available_slots.length === 0) {
  // 2. Sem horários, adicionar à lista de espera
  const waitlist = await mcpCall('add_to_waitlist', {
    contact_id: 42,
    specialist_id: 5,
    priority: 'normal',
    notes: 'Sem horário disponível para 25/01'
  });

  console.log(`Adicionado à espera. Posição: ${waitlist.position}`);
  console.log(`Tempo estimado: ${waitlist.estimated_wait_time} minutos`);
}
```

### Chamar próximo da fila quando houver desistência

```javascript
// 1. Buscar lista de espera do especialista
const waitlist = await mcpCall('get_waitlist', {
  specialist_id: 5,
  status: 'waiting'
});

if (waitlist.payload.length > 0) {
  const next = waitlist.payload[0];

  // 2. Notificar cliente (via conversa)
  // ... criar mensagem no chatwoot ...

  // 3. Atualizar status para notificado
  await mcpCall('update_waitlist_position', {
    waitlist_id: next.id,
    status: 'notified'
  });

  console.log(`Cliente ${next.contact.name} notificado sobre vaga`);
}
```

### Priorizar paciente de urgência

```javascript
// Atualizar prioridade para alta
await mcpCall('update_waitlist_position', {
  waitlist_id: 5,
  priority: 'high',
  notes: 'Urgência: paciente com dor aguda'
});

// A posição será recalculada automaticamente
```
