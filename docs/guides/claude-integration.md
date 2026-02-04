# Integração com Claude Desktop

Guia para configurar o Deming MCP com o Claude Desktop da Anthropic.

## Pré-requisitos

- Claude Desktop instalado
- Node.js 18+
- Acesso a uma instância Chatwoot

## Configuração

### 1. Clonar e instalar o servidor

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/chatwoot-mcp.git
cd chatwoot-mcp

# Instalar dependências
npm install

# Compilar
npm run build
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env`:

```env
CHATWOOT_API_URL=https://seu-chatwoot.com
CHATWOOT_API_KEY=sua_api_key_do_chatwoot
MCP_API_KEY=sua_chave_para_o_mcp
```

### 3. Configurar Claude Desktop

Edite o arquivo de configuração do Claude Desktop:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "deming": {
      "command": "node",
      "args": ["/caminho/para/chatwoot-mcp/dist/http-server.js"],
      "env": {
        "CHATWOOT_API_URL": "https://seu-chatwoot.com",
        "CHATWOOT_API_KEY": "sua_api_key",
        "MCP_API_KEY": "sua_chave_mcp"
      }
    }
  }
}
```

### 4. Reiniciar Claude Desktop

Feche e abra novamente o Claude Desktop. O servidor MCP será iniciado automaticamente.

## Verificando a Conexão

No Claude Desktop, digite:

```
Quais ferramentas você tem disponíveis para o Chatwoot?
```

O Claude deve listar as ferramentas do Deming MCP.

## Exemplos de Uso

### Listar conversas abertas

```
Liste as conversas abertas no Chatwoot
```

### Buscar contato

```
Busque o contato com telefone +5511999999999
```

### Criar agendamento

```
Crie um agendamento para o Dr. João Silva com Maria Santos
amanhã às 14h
```

### Executar tarefa de IA

```
Execute a tarefa "Resumir Conversa" para a conversa 101
```

## Solução de Problemas

### Servidor não conecta

1. Verifique se o caminho no config está correto
2. Teste manualmente: `node /caminho/para/dist/http-server.js`
3. Verifique os logs do Claude Desktop

### Erro de autenticação

1. Confirme que `CHATWOOT_API_KEY` está correta
2. Teste a API diretamente:
   ```bash
   curl -H "api_access_token: SUA_KEY" \
     https://seu-chatwoot.com/api/v1/accounts/1/contacts
   ```

### Ferramentas não aparecem

1. Reinicie o Claude Desktop completamente
2. Verifique se o build foi feito: `npm run build`
3. Confira o arquivo de configuração JSON

## Boas Práticas

1. **Use chaves separadas**: Crie uma API key específica para o MCP

2. **Limite permissões**: Se possível, use um usuário com permissões restritas

3. **Monitore uso**: Acompanhe os logs para identificar uso indevido

4. **Atualize regularmente**: Mantenha o servidor MCP atualizado

## Comandos Úteis

### Ver logs do servidor

```bash
# No diretório do projeto
npm run dev
```

### Testar ferramenta específica

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_mcp_api_key" \
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

## Fluxos Recomendados

### Atendimento com contexto

1. Buscar conversa atual
2. Listar mensagens recentes
3. Buscar dados do contato
4. Executar tarefa de resumo
5. Sugerir resposta

### Agendamento assistido

1. Buscar especialista pelo nome
2. Verificar horários disponíveis
3. Buscar/criar contato
4. Criar agendamento
5. Enviar confirmação

### Análise de desempenho

1. Buscar relatórios do período
2. Listar métricas por agente
3. Identificar gargalos
4. Sugerir melhorias
