# Fluxo de Agendamento

Guia completo para realizar agendamentos através do Deming MCP.

## Visão Geral

O fluxo de agendamento envolve 4 etapas principais:

```
1. Buscar Especialista → 2. Verificar Disponibilidade → 3. Buscar/Criar Contato → 4. Criar Agendamento
```

## Passo a Passo

### 1. Buscar o Especialista

Primeiro, encontre o profissional desejado:

```json
{
  "method": "tools/call",
  "params": {
    "name": "search_specialist_by_name",
    "arguments": {
      "name": "João"
    }
  }
}
```

**Resposta esperada:**
```json
{
  "message": "Encontrado(s) 1 especialista(s)",
  "specialists": [
    {
      "id": 5,
      "name": "Dr. João Silva",
      "email": "joao@clinica.com",
      "availabilities": [
        {"day_of_week": 1, "start_time": "08:00", "end_time": "12:00"},
        {"day_of_week": 1, "start_time": "14:00", "end_time": "18:00"}
      ]
    }
  ]
}
```

### 2. Verificar Disponibilidade

Com o ID do especialista, verifique os horários livres:

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_available_slots",
    "arguments": {
      "specialist_id": 5,
      "date": "2024-01-25"
    }
  }
}
```

**Resposta esperada:**
```json
{
  "specialist_id": 5,
  "specialist_name": "Dr. João Silva",
  "date": "2024-01-25",
  "available_slots": [
    {"start_time": "08:00", "end_time": "09:00"},
    {"start_time": "09:00", "end_time": "10:00"},
    {"start_time": "14:00", "end_time": "15:00"},
    {"start_time": "15:00", "end_time": "16:00"}
  ],
  "booked_slots": [
    {"start_time": "10:00", "end_time": "11:00", "appointment_id": 123}
  ]
}
```

### 3. Buscar ou Criar o Contato

Verifique se o cliente já existe:

```json
{
  "method": "tools/call",
  "params": {
    "name": "search_contact_by_phone",
    "arguments": {
      "phone_number": "+5511999999999"
    }
  }
}
```

**Se encontrado:**
```json
{
  "found": true,
  "contact": {
    "id": 42,
    "name": "Maria Santos",
    "phone_number": "+5511999999999"
  }
}
```

**Se não encontrado, crie:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "create_contact",
    "arguments": {
      "name": "Maria Santos",
      "phone_number": "+5511999999999",
      "email": "maria@email.com"
    }
  }
}
```

### 4. Criar o Agendamento

Com todas as informações, crie o agendamento:

```json
{
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
}
```

## Código Completo (JavaScript)

```javascript
async function criarAgendamento(
  nomeEspecialista,
  telefoneCliente,
  nomeCliente,
  data,
  horario
) {
  // 1. Buscar especialista
  const searchResult = await mcpCall('search_specialist_by_name', {
    name: nomeEspecialista
  });

  if (searchResult.specialists.length === 0) {
    throw new Error(`Especialista "${nomeEspecialista}" não encontrado`);
  }

  const specialist = searchResult.specialists[0];
  console.log(`Especialista encontrado: ${specialist.name} (ID: ${specialist.id})`);

  // 2. Verificar disponibilidade
  const slots = await mcpCall('get_available_slots', {
    specialist_id: specialist.id,
    date: data
  });

  const slotDisponivel = slots.available_slots.find(
    s => s.start_time === horario
  );

  if (!slotDisponivel) {
    console.log('Horários disponíveis:', slots.available_slots);
    throw new Error(`Horário ${horario} não disponível`);
  }

  // 3. Buscar ou criar contato
  let contactId;
  const contactSearch = await mcpCall('search_contact_by_phone', {
    phone_number: telefoneCliente
  });

  if (contactSearch.found) {
    contactId = contactSearch.contact.id;
    console.log(`Contato existente: ${contactSearch.contact.name}`);
  } else {
    const newContact = await mcpCall('create_contact', {
      name: nomeCliente,
      phone_number: telefoneCliente
    });
    contactId = newContact.id;
    console.log(`Novo contato criado: ${newContact.name}`);
  }

  // 4. Criar agendamento
  const startTime = `${data}T${slotDisponivel.start_time}:00-03:00`;
  const endTime = `${data}T${slotDisponivel.end_time}:00-03:00`;

  const appointment = await mcpCall('create_appointment', {
    title: `Consulta - ${nomeCliente}`,
    specialist_id: specialist.id,
    contact_id: contactId,
    start_time: startTime,
    end_time: endTime
  });

  console.log(`Agendamento criado com sucesso!`);
  console.log(`ID: ${appointment.id}`);
  console.log(`Data: ${data} às ${horario}`);

  return appointment;
}

// Exemplo de uso
criarAgendamento(
  'Dr. João',
  '+5511999999999',
  'Maria Santos',
  '2024-01-25',
  '14:00'
);
```

## Tratamento de Erros

### Especialista não encontrado

```javascript
if (searchResult.specialists.length === 0) {
  // Sugerir listar todos os especialistas
  const allSpecialists = await mcpCall('list_specialists', {});
  console.log('Especialistas disponíveis:');
  allSpecialists.forEach(s => console.log(`- ${s.name}`));
}
```

### Sem horários disponíveis

```javascript
if (slots.available_slots.length === 0) {
  // Oferecer lista de espera
  await mcpCall('add_to_waitlist', {
    contact_id: contactId,
    specialist_id: specialist.id,
    notes: `Sem horário para ${data}`
  });
  console.log('Cliente adicionado à lista de espera');
}
```

### Conflito de horário

```javascript
// Se o horário já foi ocupado entre a consulta e a criação
try {
  await mcpCall('create_appointment', { ... });
} catch (error) {
  if (error.message.includes('conflito')) {
    // Buscar novamente e sugerir outro horário
    const newSlots = await mcpCall('get_available_slots', { ... });
    console.log('Horário ocupado. Disponíveis:', newSlots.available_slots);
  }
}
```

## Fluxo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE AGENDAMENTO                     │
└─────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │    INÍCIO    │
     └──────┬───────┘
            │
            ▼
┌───────────────────────┐     Não encontrado    ┌─────────────┐
│  Buscar Especialista  │ ─────────────────────▶│    ERRO     │
│ search_specialist_by_ │                       │ Listar todos│
│        name           │                       └─────────────┘
└───────────┬───────────┘
            │ Encontrado
            ▼
┌───────────────────────┐     Sem slots         ┌─────────────┐
│ Verificar Disponibil. │ ─────────────────────▶│ Lista de    │
│   get_available_slots │                       │   Espera    │
└───────────┬───────────┘                       └─────────────┘
            │ Slots disponíveis
            ▼
┌───────────────────────┐
│   Buscar Contato      │
│search_contact_by_phone│
└───────────┬───────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌──────────────┐
│Existente│   │ Criar Contato │
└────┬───┘    │create_contact │
     │        └──────┬───────┘
     └───────┬───────┘
             │
             ▼
┌───────────────────────┐
│  Criar Agendamento    │
│  create_appointment   │
└───────────┬───────────┘
            │
            ▼
     ┌──────────────┐
     │   SUCESSO    │
     │ Confirmação  │
     └──────────────┘
```

## Dicas

1. **Valide datas**: Não permita agendamentos no passado

2. **Timezone**: Sempre use ISO 8601 com timezone explícito

3. **Confirme com o usuário**: Antes de criar, confirme os dados

4. **Notifique**: Após criar, envie confirmação ao cliente

5. **Anexos**: Use `upload_appointment_attachment` para adicionar documentos
