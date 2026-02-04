# Fluxo de Tarefas de IA

Guia para utilizar as tarefas de inteligência artificial do Deming MCP.

## Visão Geral

As Tarefas de IA permitem executar prompts configurados com contexto de conversas e contatos do Chatwoot.

```
1. Listar Templates → 2. Obter Detalhes → 3. Executar Tarefa → 4. Enviar Feedback
```

## Tipos de Tarefas Comuns

| Categoria | Exemplos |
|-----------|----------|
| **Atendimento** | Resumir conversa, Sugerir resposta, Classificar urgência |
| **Análise** | Análise de sentimento, Extração de entidades, Detecção de intenção |
| **Produção** | Redigir email, Criar FAQ, Traduzir mensagem |
| **Dados** | Extrair dados do cliente, Gerar relatório, Compilar histórico |

## Passo a Passo

### 1. Descobrir Templates Disponíveis

```json
{
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

### 2. Obter Detalhes do Template

Antes de executar, veja os campos necessários:

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_ai_task_template",
    "arguments": {
      "template_id": 1
    }
  }
}
```

**Resposta com campos:**
```json
{
  "id": 1,
  "name": "Resumir Conversa",
  "fields": [
    {
      "name": "formato",
      "label": "Formato do Resumo",
      "field_type": "select",
      "options": ["bullet_points", "paragrafo", "detalhado"],
      "required": true,
      "default_value": "bullet_points"
    },
    {
      "name": "idioma",
      "label": "Idioma",
      "field_type": "select",
      "options": ["pt-BR", "en", "es"],
      "required": false,
      "default_value": "pt-BR"
    }
  ]
}
```

### 3. Executar a Tarefa

```json
{
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

### 4. Enviar Feedback

Ajude a melhorar os resultados:

```json
{
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

## Exemplos Práticos

### Resumir Conversa para Handoff

Quando transferir uma conversa, gere um resumo para o próximo atendente:

```javascript
async function resumirParaTransferencia(conversationId) {
  // Executar tarefa de resumo
  const execution = await mcpCall('execute_ai_task', {
    template_id: 1, // Resumir Conversa
    input_data: {
      formato: 'detalhado',
      incluir_acoes_pendentes: true
    },
    conversation_id: conversationId
  });

  // Adicionar como nota privada
  await mcpCall('create_message', {
    conversation_id: conversationId,
    content: `**Resumo para transferência:**\n\n${execution.output_content}`,
    private: true
  });

  return execution;
}
```

### Sugerir Resposta Contextualizada

```javascript
async function sugerirResposta(conversationId, tom = 'profissional') {
  // Buscar template de sugestão
  const templates = await mcpCall('list_ai_task_templates', {
    category: 'atendimento'
  });

  const sugestaoTemplate = templates.payload.find(t =>
    t.name.toLowerCase().includes('sugerir')
  );

  // Executar com contexto
  const execution = await mcpCall('execute_ai_task', {
    template_id: sugestaoTemplate.id,
    input_data: {
      tom: tom,
      max_palavras: 150,
      incluir_saudacao: true
    },
    conversation_id: conversationId
  });

  console.log('Sugestão de resposta:');
  console.log(execution.output_content);

  return execution;
}
```

### Análise de Sentimento da Conversa

```javascript
async function analisarSentimento(conversationId) {
  const execution = await mcpCall('execute_ai_task', {
    template_id: 5, // Análise de Sentimento
    input_data: {},
    conversation_id: conversationId
  });

  // O resultado vem em JSON
  const analise = JSON.parse(execution.output_content);

  console.log(`Sentimento: ${analise.sentimento}`);
  console.log(`Confiança: ${analise.confianca * 100}%`);

  if (analise.sentimento === 'negativo') {
    // Adicionar label de alerta
    await mcpCall('add_conversation_labels', {
      conversation_id: conversationId,
      labels: ['atencao-sentimento-negativo']
    });
  }

  return analise;
}
```

### Extração de Dados do Cliente

```javascript
async function extrairDadosCliente(conversationId) {
  const execution = await mcpCall('execute_ai_task', {
    template_id: 8, // Extrair Dados
    input_data: {
      campos: ['nome', 'email', 'telefone', 'empresa', 'cargo']
    },
    conversation_id: conversationId
  });

  const dados = JSON.parse(execution.output_content);

  // Atualizar contato com dados extraídos
  if (dados.email || dados.telefone) {
    const conversation = await mcpCall('get_conversation', {
      conversation_id: conversationId
    });

    // Atualizar custom_attributes do contato
    // ... implementar atualização ...
  }

  return dados;
}
```

## Trabalhando com Tools (Contexto)

As tarefas podem usar "tools" para injetar contexto automaticamente:

| Tool | Dados Injetados |
|------|-----------------|
| `conversation` | Mensagens da conversa |
| `contact` | Dados do contato |
| `contact_history` | Histórico de interações |
| `appointments` | Agendamentos do contato |
| `labels` | Labels aplicadas |

### Exemplo: Template com Tool de Conversa

O prompt do template pode incluir:
```
{{tool:conversation}}

Baseado nas mensagens acima, {{instrucao_do_usuario}}
```

Ao executar, o sistema substitui `{{tool:conversation}}` pelas mensagens reais.

## Fluxo de Atendimento Completo

```javascript
async function atendimentoAssistido(conversationId) {
  // 1. Buscar contexto
  const conversation = await mcpCall('get_conversation', {
    conversation_id: conversationId
  });

  // 2. Analisar sentimento
  const sentimento = await analisarSentimento(conversationId);

  // 3. Gerar resumo
  const resumo = await mcpCall('execute_ai_task', {
    template_id: 1,
    input_data: { formato: 'bullet_points' },
    conversation_id: conversationId
  });

  // 4. Sugerir resposta baseada no contexto
  const sugestao = await mcpCall('execute_ai_task', {
    template_id: 2,
    input_data: {
      tom: sentimento.sentimento === 'negativo' ? 'empatico' : 'profissional',
      priorizar: sentimento.pontos_atencao
    },
    conversation_id: conversationId
  });

  return {
    resumo: resumo.output_content,
    sentimento: sentimento,
    sugestao: sugestao.output_content
  };
}
```

## Boas Práticas

1. **Sempre forneça contexto**: Passe `conversation_id` ou `contact_id` quando relevante

2. **Use os campos corretamente**: Verifique os campos obrigatórios com `get_ai_task_template`

3. **Envie feedback**: Ajuda a calibrar os prompts

4. **Monitore tokens**: Acompanhe `tokens_used` para controle de custos

5. **Cache resultados**: Para tarefas repetitivas, considere armazenar resultados

## Tratamento de Erros

```javascript
try {
  const execution = await mcpCall('execute_ai_task', {
    template_id: 1,
    input_data: { formato: 'bullet_points' },
    conversation_id: 101
  });

  if (execution.status === 'failed') {
    console.error('Erro:', execution.error_message);
    // Tentar novamente ou notificar usuário
  }
} catch (error) {
  if (error.message.includes('field required')) {
    // Campo obrigatório faltando
    console.error('Preencha todos os campos obrigatórios');
  } else if (error.message.includes('rate limit')) {
    // Limite de requisições
    console.error('Aguarde antes de tentar novamente');
  }
}
```

## Fluxo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                 FLUXO DE TAREFAS DE IA                      │
└─────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │    INÍCIO    │
    └──────┬───────┘
           │
           ▼
┌───────────────────────┐
│  Listar Templates     │
│list_ai_task_templates │
└───────────┬───────────┘
           │
           ▼
┌───────────────────────┐
│  Obter Detalhes       │
│ get_ai_task_template  │◀──── Ver campos obrigatórios
└───────────┬───────────┘
           │
           ▼
┌───────────────────────┐
│  Preencher input_data │
│  com valores dos      │
│       campos          │
└───────────┬───────────┘
           │
           ▼
┌───────────────────────┐       ┌─────────────────┐
│   Executar Tarefa     │──────▶│  Status:        │
│   execute_ai_task     │       │  - pending      │
└───────────┬───────────┘       │  - processing   │
           │                    │  - completed    │
           │                    │  - failed       │
           ▼                    └─────────────────┘
┌───────────────────────┐
│  Usar output_content  │
│  no atendimento       │
└───────────┬───────────┘
           │
           ▼
┌───────────────────────┐
│   Enviar Feedback     │
│send_ai_task_feedback  │ ◀──── 👍 positive / 👎 negative
└───────────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │     FIM      │
    └──────────────┘
```
