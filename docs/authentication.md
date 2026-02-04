# Autenticação

O Deming MCP suporta múltiplos métodos de autenticação para diferentes cenários de uso.

## Métodos de Autenticação

### 1. API Key (Header)

O método mais simples para integração direta:

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_mcp_api_key" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### 2. Bearer Token (JWT)

Para autenticação baseada em sessão:

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### 3. API Key (Query Parameter)

Para casos onde headers não são possíveis:

```bash
curl -X POST "http://localhost:3001/mcp?api_key=sua_mcp_api_key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Configuração

### Variáveis de Ambiente

```env
# Chave de API do MCP (obrigatória em produção)
MCP_API_KEY=sua_chave_segura_aqui

# Secret para JWT (opcional, para tokens de sessão)
JWT_SECRET=seu_secret_jwt_aqui

# Pular validação (APENAS desenvolvimento!)
SKIP_TOKEN_VALIDATION=false
```

### Modo Desenvolvimento

Para facilitar o desenvolvimento local, você pode desabilitar a validação:

```env
SKIP_TOKEN_VALIDATION=true
```

> ⚠️ **ATENÇÃO**: Nunca use `SKIP_TOKEN_VALIDATION=true` em produção!

## Painel Administrativo

O Deming MCP inclui um painel administrativo para gerenciar tokens:

**URL**: `http://localhost:3001/admin`

### Funcionalidades do Painel

1. **Criar Tokens** - Gere novos tokens de acesso
2. **Listar Tokens** - Visualize tokens ativos
3. **Revogar Tokens** - Invalide tokens comprometidos
4. **Logs de Auditoria** - Monitore o uso das APIs

## Obtendo um Token

### Via API

```bash
# Login para obter token
curl -X POST http://localhost:3001/admin/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "sua_senha"
  }'
```

Resposta:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

### Via Painel Admin

1. Acesse `http://localhost:3001/admin`
2. Faça login com suas credenciais
3. Vá em "Tokens" > "Criar Novo Token"
4. Copie o token gerado

## Permissões e Escopos

Os tokens podem ter escopos específicos:

| Escopo | Descrição |
|--------|-----------|
| `read` | Apenas leitura (list, get) |
| `write` | Leitura e escrita (create, update) |
| `delete` | Permissão para deletar |
| `admin` | Acesso total |

### Exemplo de Token com Escopo

```bash
curl -X POST http://localhost:3001/admin/api/tokens \
  -H "Authorization: Bearer seu_token_admin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Token Leitura",
    "scopes": ["read"]
  }'
```

## Erros de Autenticação

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

**Causas comuns**:
- API key ausente ou inválida
- Token expirado
- Header incorreto

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

**Causas comuns**:
- Token sem o escopo necessário
- Tentando acessar recurso de outra conta

## Boas Práticas

1. **Rotacione tokens regularmente** - Troque tokens a cada 90 dias
2. **Use escopos mínimos** - Dê apenas as permissões necessárias
3. **Monitore logs** - Verifique acessos suspeitos
4. **Use HTTPS** - Sempre em produção
5. **Não commite tokens** - Use variáveis de ambiente
