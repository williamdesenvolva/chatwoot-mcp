# Códigos de Erro

Referência completa dos códigos de erro do Deming MCP.

## Estrutura de Erro

Erros seguem o padrão JSON-RPC 2.0:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32600,
    "message": "Invalid Request",
    "data": "Detalhes adicionais do erro"
  }
}
```

---

## Códigos JSON-RPC Padrão

| Código | Nome | Descrição |
|--------|------|-----------|
| -32700 | Parse error | JSON inválido |
| -32600 | Invalid Request | Requisição não é um objeto válido |
| -32601 | Method not found | Método não existe |
| -32602 | Invalid params | Parâmetros inválidos |
| -32603 | Internal error | Erro interno do servidor |

### -32700: Parse error

**Causa**: O JSON enviado está mal formatado.

```json
{
  "error": {
    "code": -32700,
    "message": "Parse error",
    "data": "Unexpected token at position 45"
  }
}
```

**Solução**: Verifique a sintaxe do JSON.

---

### -32600: Invalid Request

**Causa**: Requisição não segue o formato JSON-RPC 2.0.

```json
{
  "error": {
    "code": -32600,
    "message": "Invalid Request",
    "data": "Missing 'jsonrpc' field"
  }
}
```

**Solução**: Inclua todos os campos obrigatórios: `jsonrpc`, `id`, `method`.

---

### -32601: Method not found

**Causa**: O método ou ferramenta não existe.

```json
{
  "error": {
    "code": -32601,
    "message": "Method not found",
    "data": "Tool 'lista_contatos' not found"
  }
}
```

**Solução**: Use `tools/list` para ver ferramentas disponíveis.

---

### -32602: Invalid params

**Causa**: Parâmetros faltando ou inválidos.

```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": "contact_id is required"
  }
}
```

**Solução**: Verifique os parâmetros obrigatórios da ferramenta.

---

### -32603: Internal error

**Causa**: Erro interno do servidor.

```json
{
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": "Database connection failed"
  }
}
```

**Solução**: Verifique os logs do servidor e tente novamente.

---

## Códigos de Erro Customizados

| Código | Nome | Descrição |
|--------|------|-----------|
| -32000 | Authentication error | Falha na autenticação |
| -32001 | Authorization error | Sem permissão |
| -32002 | Resource not found | Recurso não encontrado |
| -32003 | Conflict | Conflito de dados |
| -32004 | Rate limit exceeded | Limite de requisições |
| -32005 | Chatwoot API error | Erro na API do Chatwoot |
| -32006 | Validation error | Erro de validação |
| -32007 | AI service error | Erro no serviço de IA |

---

### -32000: Authentication error

**Causa**: API key ausente ou inválida.

```json
{
  "error": {
    "code": -32000,
    "message": "Authentication error",
    "data": "Invalid or missing API key"
  }
}
```

**Soluções**:
- Verifique se o header `X-API-Key` está presente
- Confirme que a API key é válida
- Verifique se o token não expirou

---

### -32001: Authorization error

**Causa**: Token sem permissão para a operação.

```json
{
  "error": {
    "code": -32001,
    "message": "Authorization error",
    "data": "Token does not have 'write' scope"
  }
}
```

**Soluções**:
- Use um token com os escopos necessários
- Solicite um novo token ao administrador

---

### -32002: Resource not found

**Causa**: O recurso solicitado não existe.

```json
{
  "error": {
    "code": -32002,
    "message": "Resource not found",
    "data": "Contact with ID 999 not found"
  }
}
```

**Soluções**:
- Verifique se o ID está correto
- O recurso pode ter sido deletado

---

### -32003: Conflict

**Causa**: Conflito ao tentar criar ou atualizar.

```json
{
  "error": {
    "code": -32003,
    "message": "Conflict",
    "data": "Appointment slot already booked"
  }
}
```

**Soluções**:
- Verifique disponibilidade antes de agendar
- Tente outro horário

---

### -32004: Rate limit exceeded

**Causa**: Muitas requisições em pouco tempo.

```json
{
  "error": {
    "code": -32004,
    "message": "Rate limit exceeded",
    "data": "Too many requests. Try again in 60 seconds"
  }
}
```

**Soluções**:
- Aguarde antes de tentar novamente
- Implemente backoff exponencial
- Otimize chamadas para reduzir volume

---

### -32005: Chatwoot API error

**Causa**: Erro ao comunicar com a API do Chatwoot.

```json
{
  "error": {
    "code": -32005,
    "message": "Chatwoot API error",
    "data": {
      "status": 500,
      "message": "Internal Server Error"
    }
  }
}
```

**Soluções**:
- Verifique se o Chatwoot está funcionando
- Confirme a URL e credenciais
- Verifique logs do Chatwoot

---

### -32006: Validation error

**Causa**: Dados não passaram na validação.

```json
{
  "error": {
    "code": -32006,
    "message": "Validation error",
    "data": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

**Soluções**:
- Corrija o formato dos dados
- Verifique campos obrigatórios

---

### -32007: AI service error

**Causa**: Erro ao executar tarefa de IA.

```json
{
  "error": {
    "code": -32007,
    "message": "AI service error",
    "data": "Model unavailable or rate limited"
  }
}
```

**Soluções**:
- Verifique configuração do serviço de IA
- Tente novamente mais tarde
- Verifique créditos/quota da API

---

## Tratamento de Erros

### JavaScript/Node.js

```javascript
async function mcpCall(toolName, args) {
  try {
    const response = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: toolName, arguments: args }
      })
    });

    const data = await response.json();

    if (data.error) {
      switch (data.error.code) {
        case -32000:
          throw new Error('Autenticação falhou. Verifique sua API key.');
        case -32002:
          throw new Error('Recurso não encontrado.');
        case -32004:
          throw new Error('Rate limit. Aguarde e tente novamente.');
        default:
          throw new Error(data.error.message);
      }
    }

    return data.result;
  } catch (error) {
    console.error('Erro MCP:', error.message);
    throw error;
  }
}
```

### Python

```python
import requests

def mcp_call(tool_name, args):
    try:
        response = requests.post(
            MCP_URL,
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            json={
                'jsonrpc': '2.0',
                'id': 1,
                'method': 'tools/call',
                'params': {'name': tool_name, 'arguments': args}
            }
        )

        data = response.json()

        if 'error' in data:
            error = data['error']
            if error['code'] == -32000:
                raise Exception('Autenticação falhou')
            elif error['code'] == -32002:
                raise Exception('Recurso não encontrado')
            elif error['code'] == -32004:
                raise Exception('Rate limit excedido')
            else:
                raise Exception(error['message'])

        return data['result']

    except requests.RequestException as e:
        raise Exception(f'Erro de conexão: {e}')
```

---

## Boas Práticas

1. **Sempre trate erros**: Nunca ignore respostas de erro

2. **Log detalhado**: Registre o código, mensagem e data do erro

3. **Retry com backoff**: Para erros transitórios (-32004, -32603)

4. **Validação prévia**: Valide dados antes de enviar

5. **Feedback ao usuário**: Traduza erros técnicos para mensagens amigáveis
