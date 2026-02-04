# Início Rápido

Este guia vai ajudá-lo a configurar e executar o Deming MCP em poucos minutos.

## Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**
- **Chatwoot** instalado e rodando
- **API Key** do Chatwoot

## Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/williamdesenvolva/chatwoot-mcp.git
cd chatwoot-mcp
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# URL da API do Chatwoot
CHATWOOT_API_URL=http://localhost:3000

# API Key do Chatwoot (obtenha em Settings > Account Settings)
CHATWOOT_API_KEY=sua_api_key_aqui

# ID da conta Chatwoot
CHATWOOT_ACCOUNT_ID=1

# Chave de API do MCP (para autenticação de clientes)
MCP_API_KEY=sua_chave_segura_aqui

# Porta do servidor (opcional, default: 3001)
PORT=3001

# Pular validação de token (apenas desenvolvimento!)
SKIP_TOKEN_VALIDATION=false
```

### 4. Compile o Projeto

```bash
npm run build
```

### 5. Inicie o Servidor

```bash
npm start
```

Você verá:

```
🚀 Chatwoot MCP HTTP Server running on http://localhost:3001
📚 API Endpoints: GET /
🔧 Admin Panel: http://localhost:3001/admin
```

## Verificando a Instalação

### Health Check

```bash
curl http://localhost:3001/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "chatwoot-mcp-http",
  "version": "1.0.0"
}
```

### Listar Ferramentas Disponíveis

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Usando com Docker

### Docker Compose

```yaml
version: '3.8'

services:
  deming-mcp:
    build: .
    ports:
      - "3001:3001"
    environment:
      - CHATWOOT_API_URL=http://chatwoot:3000
      - CHATWOOT_API_KEY=${CHATWOOT_API_KEY}
      - CHATWOOT_ACCOUNT_ID=1
      - MCP_API_KEY=${MCP_API_KEY}
    depends_on:
      - chatwoot
```

### Executar

```bash
docker-compose up -d
```

## Testando uma Ferramenta

Vamos testar listando os contatos:

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_contacts",
      "arguments": {}
    }
  }'
```

Se tudo estiver correto, você receberá a lista de contatos do Chatwoot.

## Próximos Passos

- [Autenticação](authentication.md) - Configure a autenticação
- [Ferramentas de Contatos](tools/contacts.md) - Explore as ferramentas disponíveis
- [Integração com Claude](guides/claude-integration.md) - Use com agentes de IA
