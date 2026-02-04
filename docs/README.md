# Deming MCP

**Deming MCP** é um servidor que implementa o [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) para integração com o Chatwoot. Ele permite que agentes de IA interajam com todas as funcionalidades do Chatwoot através de um protocolo padronizado.

## Visão Geral

O Deming MCP expõe mais de 50 ferramentas que permitem:

- **Gestão de Contatos** - Criar, buscar, atualizar e gerenciar contatos
- **Conversas** - Listar conversas, enviar mensagens, gerenciar status
- **Agendamentos** - Sistema completo de agendamentos com especialistas
- **Tarefas de IA** - Executar tarefas automatizadas com IA
- **Processos** - Gerenciar workflows e processos de negócio
- **Lista de Espera** - Sistema de waitlist para agendamentos
- **Relatórios** - Acessar métricas e relatórios

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Agente IA     │────▶│   Deming MCP    │────▶│    Chatwoot     │
│  (Claude, GPT)  │◀────│   (servidor)    │◀────│      API        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │    JSON-RPC 2.0       │    REST API
        │    (MCP Protocol)     │
```

## Características

- **Protocolo MCP** - Compatível com Claude, GPT e outros modelos
- **REST API** - Endpoints HTTP para integração direta
- **Autenticação** - Suporte a tokens JWT e API keys
- **Painel Admin** - Interface web para gerenciamento
- **Alta Performance** - Servidor Node.js otimizado

## Início Rápido

```bash
# Clonar o repositório
git clone https://github.com/williamdesenvolva/chatwoot-mcp.git

# Instalar dependências
cd chatwoot-mcp
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Iniciar o servidor
npm start
```

O servidor estará disponível em `http://localhost:3001`.

## Categorias de Ferramentas

| Categoria | Ferramentas | Descrição |
|-----------|-------------|-----------|
| [Contatos](tools/contacts.md) | 8 | Gestão completa de contatos |
| [Conversas](tools/conversations.md) | 6 | Mensagens e atendimentos |
| [Agendamentos](tools/appointments.md) | 9 | Sistema de agenda |
| [Especialistas](tools/specialists.md) | 5 | Profissionais e horários |
| [Tarefas de IA](tools/ai-tasks.md) | 6 | Automação com IA |
| [Processos](tools/processes.md) | 6 | Workflows de negócio |
| [Lista de Espera](tools/waitlist.md) | 8 | Gestão de fila de espera |
| [Relatórios](tools/reports.md) | 2 | Métricas e analytics |
| [Outros](tools/others.md) | 6 | Labels, times, canais |

## Suporte

- **Documentação**: Este GitBook
- **Issues**: [GitHub Issues](https://github.com/williamdesenvolva/chatwoot-mcp/issues)
- **Chatwoot**: [Documentação Oficial](https://www.chatwoot.com/docs)
