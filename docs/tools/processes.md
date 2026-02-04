# Processos

Ferramentas para gerenciar processos e fluxos de trabalho no estilo Kanban.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `list_processes` | Lista todos os processos |
| `get_process` | Obtém detalhes de um processo |
| `create_process` | Cria novo processo |
| `list_process_templates` | Lista templates disponíveis |
| `get_process_cards` | Lista cards de um processo |
| `move_process_card` | Move card entre estágios |

---

## list_process_templates

Lista todos os templates de processos disponíveis.

### Parâmetros

Nenhum parâmetro obrigatório.

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_process_templates",
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
      "name": "Onboarding de Cliente",
      "description": "Processo padrão para integração de novos clientes",
      "icon": "user-plus",
      "color": "#4A90D9",
      "stages_count": 5,
      "active": true
    },
    {
      "id": 2,
      "name": "Suporte Técnico",
      "description": "Fluxo de atendimento para chamados técnicos",
      "icon": "tool",
      "color": "#F59E0B",
      "stages_count": 4,
      "active": true
    },
    {
      "id": 3,
      "name": "Vendas",
      "description": "Pipeline de vendas",
      "icon": "dollar-sign",
      "color": "#10B981",
      "stages_count": 6,
      "active": true
    }
  ]
}
```

---

## list_processes

Lista todos os processos em andamento.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `status` | string | Não | Filtrar por status |
| `template_id` | number | Não | Filtrar por template |
| `page` | number | Não | Página (default: 1) |

**Valores de `status`**: `active`, `completed`, `cancelled`, `all`

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_processes",
    "arguments": {
      "status": "active",
      "page": 1
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
      "name": "Onboarding - Empresa ABC",
      "template": {
        "id": 1,
        "name": "Onboarding de Cliente"
      },
      "status": "active",
      "current_stage": {
        "id": 2,
        "name": "Documentação"
      },
      "contact": {
        "id": 42,
        "name": "João Silva"
      },
      "progress": 40,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-20T14:30:00Z"
    }
  ],
  "meta": {
    "count": 25,
    "current_page": 1
  }
}
```

---

## get_process

Obtém detalhes completos de um processo, incluindo estágios e cards.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `process_id` | number | **Sim** | ID do processo |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_process",
    "arguments": {
      "process_id": 1
    }
  }
}
```

### Resposta

```json
{
  "id": 1,
  "name": "Onboarding - Empresa ABC",
  "description": "Processo de integração do novo cliente Empresa ABC",
  "template": {
    "id": 1,
    "name": "Onboarding de Cliente"
  },
  "status": "active",
  "contact": {
    "id": 42,
    "name": "João Silva",
    "email": "joao@empresaabc.com"
  },
  "assignee": {
    "id": 5,
    "name": "Maria Atendente"
  },
  "stages": [
    {
      "id": 1,
      "name": "Proposta",
      "position": 1,
      "color": "#E5E7EB",
      "cards_count": 0,
      "completed": true
    },
    {
      "id": 2,
      "name": "Documentação",
      "position": 2,
      "color": "#FEF3C7",
      "cards_count": 2,
      "completed": false
    },
    {
      "id": 3,
      "name": "Configuração",
      "position": 3,
      "color": "#DBEAFE",
      "cards_count": 0,
      "completed": false
    },
    {
      "id": 4,
      "name": "Treinamento",
      "position": 4,
      "color": "#D1FAE5",
      "cards_count": 0,
      "completed": false
    },
    {
      "id": 5,
      "name": "Concluído",
      "position": 5,
      "color": "#10B981",
      "cards_count": 0,
      "completed": false
    }
  ],
  "progress": 40,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T14:30:00Z"
}
```

---

## create_process

Cria um novo processo a partir de um template.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `template_id` | number | **Sim** | ID do template |
| `name` | string | **Sim** | Nome do processo |
| `description` | string | Não | Descrição detalhada |
| `contact_id` | number | Não | ID do contato associado |
| `assignee_id` | number | Não | ID do responsável |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_process",
    "arguments": {
      "template_id": 1,
      "name": "Onboarding - Empresa XYZ",
      "description": "Novo cliente do setor financeiro",
      "contact_id": 55
    }
  }
}
```

### Resposta

```json
{
  "id": 10,
  "name": "Onboarding - Empresa XYZ",
  "description": "Novo cliente do setor financeiro",
  "template": {
    "id": 1,
    "name": "Onboarding de Cliente"
  },
  "status": "active",
  "contact": {
    "id": 55,
    "name": "Ana Costa"
  },
  "progress": 0,
  "created_at": "2024-01-20T16:00:00Z"
}
```

---

## get_process_cards

Lista todos os cards de um processo organizados por estágio.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `process_id` | number | **Sim** | ID do processo |
| `stage_id` | number | Não | Filtrar por estágio |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_process_cards",
    "arguments": {
      "process_id": 1
    }
  }
}
```

### Resposta

```json
{
  "process_id": 1,
  "stages": [
    {
      "id": 1,
      "name": "Proposta",
      "cards": []
    },
    {
      "id": 2,
      "name": "Documentação",
      "cards": [
        {
          "id": 101,
          "title": "Contrato Social",
          "description": "Aguardando envio do contrato social",
          "position": 1,
          "due_date": "2024-01-25",
          "priority": "high",
          "assignee": {
            "id": 5,
            "name": "Maria"
          },
          "labels": ["pendente-cliente"],
          "created_at": "2024-01-16T10:00:00Z"
        },
        {
          "id": 102,
          "title": "Dados Bancários",
          "description": "Coletar informações bancárias",
          "position": 2,
          "due_date": "2024-01-25",
          "priority": "medium",
          "assignee": null,
          "labels": [],
          "created_at": "2024-01-16T10:00:00Z"
        }
      ]
    },
    {
      "id": 3,
      "name": "Configuração",
      "cards": []
    }
  ]
}
```

---

## move_process_card

Move um card para outro estágio do processo.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `process_id` | number | **Sim** | ID do processo |
| `card_id` | number | **Sim** | ID do card |
| `target_stage_id` | number | **Sim** | ID do estágio destino |
| `position` | number | Não | Posição no estágio (default: fim) |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "move_process_card",
    "arguments": {
      "process_id": 1,
      "card_id": 101,
      "target_stage_id": 3,
      "position": 1
    }
  }
}
```

### Resposta

```json
{
  "success": true,
  "card": {
    "id": 101,
    "title": "Contrato Social",
    "previous_stage": {
      "id": 2,
      "name": "Documentação"
    },
    "current_stage": {
      "id": 3,
      "name": "Configuração"
    },
    "position": 1
  },
  "process_progress": 60
}
```

---

## Casos de Uso Comuns

### Iniciar processo de onboarding para novo cliente

```javascript
// 1. Buscar ou criar contato
const contact = await mcpCall('search_contact_by_phone', {
  phone_number: '+5511999999999'
});

let contactId;
if (contact.found) {
  contactId = contact.contact.id;
} else {
  const newContact = await mcpCall('create_contact', {
    name: 'Empresa XYZ',
    phone_number: '+5511999999999',
    email: 'contato@empresaxyz.com'
  });
  contactId = newContact.id;
}

// 2. Listar templates disponíveis
const templates = await mcpCall('list_process_templates', {});
const onboardingTemplate = templates.payload.find(t =>
  t.name.includes('Onboarding')
);

// 3. Criar o processo
const process = await mcpCall('create_process', {
  template_id: onboardingTemplate.id,
  name: `Onboarding - Empresa XYZ`,
  description: 'Cliente indicado pelo parceiro ABC',
  contact_id: contactId
});

console.log(`Processo criado: ${process.id}`);
```

### Acompanhar progresso de um processo

```javascript
// 1. Buscar detalhes do processo
const process = await mcpCall('get_process', {
  process_id: 1
});

console.log(`Processo: ${process.name}`);
console.log(`Progresso: ${process.progress}%`);
console.log(`Estágio atual: ${process.stages.find(s => !s.completed)?.name}`);

// 2. Ver cards pendentes
const cards = await mcpCall('get_process_cards', {
  process_id: 1
});

cards.stages.forEach(stage => {
  if (stage.cards.length > 0) {
    console.log(`\n${stage.name}:`);
    stage.cards.forEach(card => {
      console.log(`  - ${card.title} (${card.priority})`);
    });
  }
});
```

### Avançar tarefa no processo

```javascript
// Mover card "Contrato Social" para "Configuração"
const result = await mcpCall('move_process_card', {
  process_id: 1,
  card_id: 101,
  target_stage_id: 3
});

console.log(`Card movido para: ${result.card.current_stage.name}`);
console.log(`Progresso do processo: ${result.process_progress}%`);
```

### Listar processos ativos de um cliente

```javascript
// Buscar processos ativos filtrados
const processes = await mcpCall('list_processes', {
  status: 'active'
});

// Filtrar por contato específico
const clientProcesses = processes.payload.filter(p =>
  p.contact?.id === 42
);

clientProcesses.forEach(p => {
  console.log(`${p.name} - ${p.progress}% concluído`);
});
```

---

## Status dos Processos

| Status | Descrição |
|--------|-----------|
| `active` | Em andamento |
| `completed` | Finalizado com sucesso |
| `cancelled` | Cancelado |
| `on_hold` | Pausado |

---

## Prioridades dos Cards

| Prioridade | Descrição |
|------------|-----------|
| `low` | Baixa |
| `medium` | Média |
| `high` | Alta |
| `urgent` | Urgente |

---

## Dicas de Uso

1. **Use templates**: Sempre crie processos a partir de templates para manter consistência

2. **Associe contatos**: Vincular processos a contatos facilita o acompanhamento

3. **Monitore progresso**: O campo `progress` é calculado automaticamente baseado nos estágios completados

4. **Mova cards sequencialmente**: Prefira mover cards estágio por estágio para manter histórico

5. **Use prioridades**: Defina prioridades nos cards para organizar o trabalho da equipe
