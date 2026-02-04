# Especialistas

Ferramentas para gerenciar especialistas/profissionais e seus horários de disponibilidade.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `list_specialists` | Lista todos os especialistas |
| `search_specialist_by_name` | Busca especialista pelo nome |
| `create_specialist` | Cria novo especialista |
| `get_specialist` | Obtém detalhes do especialista |
| `get_available_slots` | Horários disponíveis |

---

## list_specialists

Lista todos os especialistas/profissionais cadastrados.

### Parâmetros

Nenhum parâmetro obrigatório.

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_specialists",
    "arguments": {}
  }
}
```

### Resposta

```json
[
  {
    "id": 1,
    "name": "Dr. João Silva",
    "email": "joao@clinica.com",
    "phone": "+5511999999999",
    "active": true,
    "availabilities": [
      {
        "day_of_week": 1,
        "start_time": "08:00",
        "end_time": "12:00"
      },
      {
        "day_of_week": 1,
        "start_time": "14:00",
        "end_time": "18:00"
      },
      {
        "day_of_week": 2,
        "start_time": "08:00",
        "end_time": "12:00"
      }
    ]
  },
  {
    "id": 2,
    "name": "Dra. Maria Santos",
    "email": "maria@clinica.com",
    "phone": "+5511988888888",
    "active": true,
    "availabilities": []
  }
]
```

### Dias da Semana

| Valor | Dia |
|-------|-----|
| 0 | Domingo |
| 1 | Segunda-feira |
| 2 | Terça-feira |
| 3 | Quarta-feira |
| 4 | Quinta-feira |
| 5 | Sexta-feira |
| 6 | Sábado |

---

## search_specialist_by_name

Busca especialistas pelo nome (busca parcial, case-insensitive).

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `name` | string | **Sim** | Nome ou parte do nome |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_specialist_by_name",
    "arguments": {
      "name": "João"
    }
  }
}
```

### Resposta (encontrado)

```json
{
  "message": "Encontrado(s) 1 especialista(s)",
  "specialists": [
    {
      "id": 1,
      "name": "Dr. João Silva",
      "email": "joao@clinica.com",
      "phone": "+5511999999999",
      "active": true,
      "availabilities": [...]
    }
  ]
}
```

### Resposta (não encontrado)

```json
{
  "message": "Nenhum especialista encontrado com o nome \"Pedro\"",
  "suggestion": "Use list_specialists para ver todos os especialistas disponíveis",
  "specialists": []
}
```

---

## create_specialist

Cria um novo especialista/profissional.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `name` | string | **Sim** | Nome do especialista |
| `email` | string | Não | E-mail |
| `phone` | string | Não | Telefone |
| `active` | boolean | Não | Se está ativo (default: true) |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_specialist",
    "arguments": {
      "name": "Dr. Pedro Oliveira",
      "email": "pedro@clinica.com",
      "phone": "+5511977777777",
      "active": true
    }
  }
}
```

### Resposta

```json
{
  "id": 3,
  "name": "Dr. Pedro Oliveira",
  "email": "pedro@clinica.com",
  "phone": "+5511977777777",
  "active": true,
  "availabilities": [],
  "created_at": "2024-01-20T10:00:00Z"
}
```

---

## get_specialist

Obtém detalhes completos de um especialista.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `specialist_id` | number | **Sim** | ID do especialista |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_specialist",
    "arguments": {
      "specialist_id": 1
    }
  }
}
```

### Resposta

```json
{
  "id": 1,
  "name": "Dr. João Silva",
  "email": "joao@clinica.com",
  "phone": "+5511999999999",
  "active": true,
  "availabilities": [
    {
      "id": 1,
      "day_of_week": 1,
      "start_time": "08:00",
      "end_time": "12:00"
    },
    {
      "id": 2,
      "day_of_week": 1,
      "start_time": "14:00",
      "end_time": "18:00"
    }
  ],
  "appointments_count": 45,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## get_available_slots

Obtém os horários disponíveis de um especialista para uma data específica.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `specialist_id` | number | **Sim** | ID do especialista |
| `date` | string | **Sim** | Data (YYYY-MM-DD) |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_available_slots",
    "arguments": {
      "specialist_id": 1,
      "date": "2024-01-25"
    }
  }
}
```

### Resposta

```json
{
  "specialist_id": 1,
  "specialist_name": "Dr. João Silva",
  "date": "2024-01-25",
  "available_slots": [
    {
      "start_time": "08:00",
      "end_time": "09:00"
    },
    {
      "start_time": "09:00",
      "end_time": "10:00"
    },
    {
      "start_time": "10:00",
      "end_time": "11:00"
    },
    {
      "start_time": "14:00",
      "end_time": "15:00"
    },
    {
      "start_time": "15:00",
      "end_time": "16:00"
    }
  ],
  "booked_slots": [
    {
      "start_time": "11:00",
      "end_time": "12:00",
      "appointment_id": 123
    }
  ]
}
```

---

## Casos de Uso Comuns

### Encontrar especialista e verificar disponibilidade

```javascript
// 1. Buscar especialista pelo nome
const result = await mcpCall('search_specialist_by_name', {
  name: 'João'
});

if (result.specialists.length === 0) {
  console.log('Especialista não encontrado');
  return;
}

const specialist = result.specialists[0];
console.log(`Encontrado: ${specialist.name} (ID: ${specialist.id})`);

// 2. Verificar horários disponíveis para amanhã
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dateStr = tomorrow.toISOString().split('T')[0];

const slots = await mcpCall('get_available_slots', {
  specialist_id: specialist.id,
  date: dateStr
});

console.log(`Horários disponíveis em ${dateStr}:`);
slots.available_slots.forEach(slot => {
  console.log(`  - ${slot.start_time} às ${slot.end_time}`);
});
```

### Listar todos os especialistas ativos

```javascript
const specialists = await mcpCall('list_specialists', {});

const active = specialists.filter(s => s.active);
console.log(`${active.length} especialistas ativos:`);
active.forEach(s => {
  console.log(`  - ${s.name} (${s.email})`);
});
```
