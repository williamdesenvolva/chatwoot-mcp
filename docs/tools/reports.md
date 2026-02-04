# Relatórios

Ferramentas para obter relatórios e métricas do Chatwoot.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `get_account_reports` | Relatórios gerais da conta |
| `get_agent_reports` | Relatórios por agente |
| `get_conversation_metrics` | Métricas de conversas |

---

## get_account_reports

Obtém relatórios gerais da conta em um período.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `metric` | string | **Sim** | Tipo de métrica |
| `since` | string | **Sim** | Data início (YYYY-MM-DD) |
| `until` | string | **Sim** | Data fim (YYYY-MM-DD) |
| `type` | string | Não | Agrupamento: `day`, `week`, `month` |

**Valores de `metric`**:
- `conversations_count` - Total de conversas
- `incoming_messages_count` - Mensagens recebidas
- `outgoing_messages_count` - Mensagens enviadas
- `avg_first_response_time` - Tempo médio primeira resposta
- `avg_resolution_time` - Tempo médio resolução
- `resolutions_count` - Conversas resolvidas

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_account_reports",
    "arguments": {
      "metric": "conversations_count",
      "since": "2024-01-01",
      "until": "2024-01-31",
      "type": "day"
    }
  }
}
```

### Resposta

```json
{
  "metric": "conversations_count",
  "since": "2024-01-01",
  "until": "2024-01-31",
  "data": [
    { "date": "2024-01-01", "value": 45 },
    { "date": "2024-01-02", "value": 52 },
    { "date": "2024-01-03", "value": 38 },
    { "date": "2024-01-04", "value": 61 }
  ],
  "summary": {
    "total": 1250,
    "average": 40.3,
    "max": 85,
    "min": 12
  }
}
```

---

## get_agent_reports

Obtém relatórios de desempenho por agente.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `since` | string | **Sim** | Data início (YYYY-MM-DD) |
| `until` | string | **Sim** | Data fim (YYYY-MM-DD) |
| `agent_id` | number | Não | Filtrar por agente específico |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_agent_reports",
    "arguments": {
      "since": "2024-01-01",
      "until": "2024-01-31"
    }
  }
}
```

### Resposta

```json
{
  "since": "2024-01-01",
  "until": "2024-01-31",
  "agents": [
    {
      "id": 5,
      "name": "João Atendente",
      "email": "joao@empresa.com",
      "metrics": {
        "conversations_count": 245,
        "messages_count": 1520,
        "avg_first_response_time": 180,
        "avg_resolution_time": 3600,
        "resolutions_count": 230,
        "csat_score": 4.5
      }
    },
    {
      "id": 6,
      "name": "Maria Suporte",
      "email": "maria@empresa.com",
      "metrics": {
        "conversations_count": 198,
        "messages_count": 1280,
        "avg_first_response_time": 120,
        "avg_resolution_time": 2400,
        "resolutions_count": 195,
        "csat_score": 4.8
      }
    }
  ]
}
```

### Métricas por Agente

| Métrica | Descrição | Unidade |
|---------|-----------|---------|
| `conversations_count` | Conversas atendidas | número |
| `messages_count` | Mensagens enviadas | número |
| `avg_first_response_time` | Tempo médio primeira resposta | segundos |
| `avg_resolution_time` | Tempo médio de resolução | segundos |
| `resolutions_count` | Conversas resolvidas | número |
| `csat_score` | Nota de satisfação | 1-5 |

---

## get_conversation_metrics

Obtém métricas detalhadas de uma conversa específica.

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
    "name": "get_conversation_metrics",
    "arguments": {
      "conversation_id": 101
    }
  }
}
```

### Resposta

```json
{
  "conversation_id": 101,
  "metrics": {
    "first_response_time": 145,
    "resolution_time": 3200,
    "messages_count": {
      "incoming": 8,
      "outgoing": 12,
      "total": 20
    },
    "agents_involved": 2,
    "transfers_count": 1,
    "reopens_count": 0,
    "csat_rating": 5,
    "csat_feedback": "Excelente atendimento!"
  },
  "timeline": [
    {
      "event": "created",
      "timestamp": "2024-01-20T10:00:00Z"
    },
    {
      "event": "first_response",
      "timestamp": "2024-01-20T10:02:25Z",
      "agent_id": 5
    },
    {
      "event": "assigned",
      "timestamp": "2024-01-20T10:02:25Z",
      "agent_id": 5
    },
    {
      "event": "transferred",
      "timestamp": "2024-01-20T10:30:00Z",
      "from_agent_id": 5,
      "to_agent_id": 6
    },
    {
      "event": "resolved",
      "timestamp": "2024-01-20T10:53:20Z",
      "agent_id": 6
    }
  ]
}
```

---

## Casos de Uso Comuns

### Dashboard de métricas diárias

```javascript
const today = new Date().toISOString().split('T')[0];
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString().split('T')[0];

// Buscar métricas da semana
const conversations = await mcpCall('get_account_reports', {
  metric: 'conversations_count',
  since: weekAgo,
  until: today,
  type: 'day'
});

const avgResponseTime = await mcpCall('get_account_reports', {
  metric: 'avg_first_response_time',
  since: weekAgo,
  until: today,
  type: 'day'
});

console.log('=== Resumo da Semana ===');
console.log(`Total de conversas: ${conversations.summary.total}`);
console.log(`Média diária: ${conversations.summary.average.toFixed(1)}`);
console.log(`Tempo médio resposta: ${avgResponseTime.summary.average}s`);
```

### Ranking de agentes

```javascript
const agents = await mcpCall('get_agent_reports', {
  since: '2024-01-01',
  until: '2024-01-31'
});

// Ordenar por satisfação
const ranking = agents.agents
  .sort((a, b) => b.metrics.csat_score - a.metrics.csat_score);

console.log('=== Ranking de Satisfação ===');
ranking.forEach((agent, i) => {
  console.log(`${i + 1}. ${agent.name}: ${agent.metrics.csat_score}/5`);
});
```

### Análise de conversa

```javascript
const metrics = await mcpCall('get_conversation_metrics', {
  conversation_id: 101
});

const responseMinutes = Math.round(metrics.metrics.first_response_time / 60);
const resolutionMinutes = Math.round(metrics.metrics.resolution_time / 60);

console.log('=== Análise da Conversa #101 ===');
console.log(`Primeira resposta: ${responseMinutes} minutos`);
console.log(`Tempo total: ${resolutionMinutes} minutos`);
console.log(`Mensagens: ${metrics.metrics.messages_count.total}`);
console.log(`Satisfação: ${metrics.metrics.csat_rating}/5`);
```

---

## Dicas de Uso

1. **Períodos comparativos**: Compare métricas de períodos diferentes para identificar tendências

2. **Foco nos outliers**: Analise conversas com tempos muito altos ou baixos

3. **CSAT como indicador**: A satisfação do cliente é a métrica mais importante

4. **Tempo de primeira resposta**: Impacta diretamente na satisfação - priorize melhorias aqui
