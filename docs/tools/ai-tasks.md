# Tarefas de IA

Ferramentas para executar tarefas de inteligência artificial configuradas no sistema.

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `list_ai_task_templates` | Lista templates disponíveis |
| `get_ai_task_template` | Obtém detalhes de um template |
| `execute_ai_task` | Executa uma tarefa de IA |
| `get_ai_task_execution` | Obtém resultado de execução |
| `list_ai_task_executions` | Lista execuções realizadas |
| `send_ai_task_feedback` | Envia feedback sobre resultado |

---

## list_ai_task_templates

Lista todos os templates de tarefas de IA disponíveis.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `category` | string | Não | Filtrar por categoria |
| `active` | boolean | Não | Filtrar por status ativo |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_ai_task_templates",
    "arguments": {
      "category": "atendimento",
      "active": true
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
      "name": "Resumir Conversa",
      "description": "Gera um resumo inteligente da conversa atual",
      "icon": "summary",
      "category": "atendimento",
      "color": "#4A90D9",
      "active": true,
      "fields_count": 2
    },
    {
      "id": 2,
      "name": "Sugerir Resposta",
      "description": "Sugere uma resposta baseada no contexto",
      "icon": "reply",
      "category": "atendimento",
      "color": "#7C3AED",
      "active": true,
      "fields_count": 3
    }
  ]
}
```

---

## get_ai_task_template

Obtém detalhes completos de um template de tarefa.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `template_id` | number | **Sim** | ID do template |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_ai_task_template",
    "arguments": {
      "template_id": 1
    }
  }
}
```

### Resposta

```json
{
  "id": 1,
  "name": "Resumir Conversa",
  "description": "Gera um resumo inteligente da conversa atual",
  "icon": "summary",
  "category": "atendimento",
  "color": "#4A90D9",
  "active": true,
  "fields": [
    {
      "id": 1,
      "name": "formato",
      "label": "Formato do Resumo",
      "field_type": "select",
      "options": ["bullet_points", "paragrafo", "detalhado"],
      "required": true,
      "default_value": "bullet_points"
    },
    {
      "id": 2,
      "name": "idioma",
      "label": "Idioma",
      "field_type": "select",
      "options": ["pt-BR", "en", "es"],
      "required": false,
      "default_value": "pt-BR"
    }
  ],
  "prompt": {
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000
  },
  "output": {
    "allow_edit": true,
    "allow_copy": true,
    "allow_download": true,
    "download_formats": ["txt", "md", "pdf"]
  }
}
```

---

## execute_ai_task

Executa uma tarefa de IA com os parâmetros fornecidos.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `template_id` | number | **Sim** | ID do template |
| `input_data` | object | **Sim** | Dados de entrada (campos) |
| `conversation_id` | number | Não | ID da conversa (contexto) |
| `contact_id` | number | Não | ID do contato (contexto) |

### Exemplo - Resumir Conversa

```json
{
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
}
```

### Resposta

```json
{
  "id": 500,
  "template_id": 1,
  "template_name": "Resumir Conversa",
  "status": "completed",
  "input_data": {
    "formato": "bullet_points",
    "idioma": "pt-BR"
  },
  "output_content": "## Resumo da Conversa\n\n- Cliente relatou problema com faturamento\n- Cobrança duplicada identificada na fatura de janeiro\n- Solicitado estorno do valor R$ 150,00\n- Prazo informado: 5 dias úteis\n- Cliente satisfeito com a solução",
  "tokens_used": 450,
  "created_at": "2024-01-20T16:30:00Z"
}
```

### Exemplo - Sugerir Resposta

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "execute_ai_task",
    "arguments": {
      "template_id": 2,
      "input_data": {
        "tom": "formal",
        "incluir_saudacao": true,
        "max_palavras": 100
      },
      "conversation_id": 101,
      "contact_id": 42
    }
  }
}
```

---

## get_ai_task_execution

Obtém o resultado de uma execução específica.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `execution_id` | number | **Sim** | ID da execução |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_ai_task_execution",
    "arguments": {
      "execution_id": 500
    }
  }
}
```

### Resposta

```json
{
  "id": 500,
  "template": {
    "id": 1,
    "name": "Resumir Conversa"
  },
  "user": {
    "id": 5,
    "name": "João Atendente"
  },
  "conversation_id": 101,
  "contact_id": 42,
  "status": "completed",
  "input_data": {
    "formato": "bullet_points",
    "idioma": "pt-BR"
  },
  "output_content": "## Resumo da Conversa\n\n- Cliente relatou problema...",
  "output_content_edited": null,
  "feedback": null,
  "feedback_comment": null,
  "tokens_used": 450,
  "credits_used": 0.0045,
  "created_at": "2024-01-20T16:30:00Z"
}
```

### Status Possíveis

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando processamento |
| `processing` | Em execução |
| `completed` | Concluído com sucesso |
| `failed` | Falhou |

---

## list_ai_task_executions

Lista execuções de tarefas de IA.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `template_id` | number | Não | Filtrar por template |
| `status` | string | Não | Filtrar por status |
| `page` | number | Não | Página (default: 1) |

### Exemplo

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_ai_task_executions",
    "arguments": {
      "template_id": 1,
      "status": "completed",
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
      "id": 500,
      "template_name": "Resumir Conversa",
      "status": "completed",
      "tokens_used": 450,
      "created_at": "2024-01-20T16:30:00Z"
    },
    {
      "id": 499,
      "template_name": "Resumir Conversa",
      "status": "completed",
      "tokens_used": 380,
      "created_at": "2024-01-20T15:45:00Z"
    }
  ],
  "meta": {
    "count": 150,
    "current_page": 1
  }
}
```

---

## send_ai_task_feedback

Envia feedback sobre o resultado de uma execução.

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `execution_id` | number | **Sim** | ID da execução |
| `feedback` | string | **Sim** | Tipo: `positive` ou `negative` |
| `comment` | string | Não | Comentário adicional |

### Exemplo - Feedback Positivo

```json
{
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
}
```

### Exemplo - Feedback Negativo com Comentário

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "send_ai_task_feedback",
    "arguments": {
      "execution_id": 500,
      "feedback": "negative",
      "comment": "O resumo ficou muito superficial, faltou mencionar o prazo acordado"
    }
  }
}
```

### Resposta

```json
{
  "success": true,
  "message": "Feedback registrado com sucesso",
  "execution_id": 500,
  "feedback": "negative"
}
```

---

## Casos de Uso Comuns

### Resumir conversa atual

```javascript
// 1. Listar templates para encontrar o de resumo
const templates = await mcpCall('list_ai_task_templates', {
  category: 'atendimento'
});

const resumoTemplate = templates.payload.find(t =>
  t.name.toLowerCase().includes('resumo')
);

// 2. Executar a tarefa
const execution = await mcpCall('execute_ai_task', {
  template_id: resumoTemplate.id,
  input_data: {
    formato: 'bullet_points'
  },
  conversation_id: 101
});

console.log('Resumo gerado:', execution.output_content);

// 3. Se útil, enviar feedback positivo
await mcpCall('send_ai_task_feedback', {
  execution_id: execution.id,
  feedback: 'positive'
});
```

### Gerar resposta sugerida

```javascript
// Executar tarefa de sugestão de resposta
const suggestion = await mcpCall('execute_ai_task', {
  template_id: 2, // ID do template "Sugerir Resposta"
  input_data: {
    tom: 'amigavel',
    incluir_saudacao: true
  },
  conversation_id: 101,
  contact_id: 42
});

// Usar a sugestão como base para resposta
console.log('Sugestão:', suggestion.output_content);
```

### Analisar sentimento da conversa

```javascript
const analysis = await mcpCall('execute_ai_task', {
  template_id: 5, // ID do template "Análise de Sentimento"
  input_data: {},
  conversation_id: 101
});

console.log('Análise:', analysis.output_content);
// Exemplo de saída:
// {
//   "sentimento": "neutro_para_positivo",
//   "confianca": 0.85,
//   "pontos_atencao": ["Cliente mencionou prazo apertado"]
// }
```

---

## Categorias de Templates

| Categoria | Descrição | Exemplos |
|-----------|-----------|----------|
| `atendimento` | Auxílio no atendimento | Resumir, Sugerir resposta |
| `analise` | Análise de dados | Sentimento, Classificação |
| `producao` | Produção de conteúdo | Redigir email, Criar FAQ |
| `traducao` | Tradução | Traduzir mensagem |
| `extracao` | Extração de dados | Extrair entidades, Dados do cliente |

---

## Dicas de Uso

1. **Use o contexto**: Sempre que possível, passe `conversation_id` e `contact_id` para que a IA tenha mais contexto

2. **Verifique os campos**: Use `get_ai_task_template` para ver os campos obrigatórios antes de executar

3. **Envie feedback**: O feedback ajuda a melhorar os prompts e resultados futuros

4. **Monitore tokens**: Acompanhe o uso de tokens para controle de custos
