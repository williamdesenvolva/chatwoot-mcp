# Changelog

Histórico de alterações do Deming MCP.

## [1.2.0] - 2024-02

### Adicionado
- **Tarefas de IA**: 6 novas ferramentas para execução de tarefas de inteligência artificial
  - `list_ai_task_templates` - Lista templates disponíveis
  - `get_ai_task_template` - Obtém detalhes do template
  - `execute_ai_task` - Executa tarefa de IA
  - `get_ai_task_execution` - Obtém resultado de execução
  - `list_ai_task_executions` - Lista execuções realizadas
  - `send_ai_task_feedback` - Envia feedback sobre resultado

- **Processos**: 6 novas ferramentas para gerenciamento de processos Kanban
  - `list_processes` - Lista processos em andamento
  - `get_process` - Obtém detalhes de um processo
  - `create_process` - Cria novo processo a partir de template
  - `list_process_templates` - Lista templates de processos
  - `get_process_cards` - Lista cards de um processo
  - `move_process_card` - Move card entre estágios

### Melhorado
- Documentação completa no formato GitBook
- Exemplos de código em JavaScript e cURL

---

## [1.1.0] - 2024-01

### Adicionado
- **Lista de Espera**: Ferramentas para gerenciar fila de espera
  - `get_waitlist` - Lista clientes na espera
  - `add_to_waitlist` - Adiciona à lista de espera
  - `remove_from_waitlist` - Remove da lista
  - `update_waitlist_position` - Atualiza posição

- **Relatórios**: Ferramentas para métricas e analytics
  - `get_account_reports` - Relatórios gerais da conta
  - `get_agent_reports` - Relatórios por agente
  - `get_conversation_metrics` - Métricas de conversas

### Melhorado
- Performance das consultas de especialistas
- Validação de datas em agendamentos

### Corrigido
- Timezone em `get_available_slots` agora respeita configuração da conta

---

## [1.0.0] - 2024-01

### Lançamento Inicial

#### Contatos
- `list_contacts` - Lista todos os contatos
- `create_contact` - Cria novo contato
- `get_contact` - Obtém detalhes
- `search_contacts` - Busca por texto
- `search_contact_by_phone` - Busca por telefone
- `get_contact_appointments` - Lista agendamentos do contato
- `list_contact_labels` - Lista etiquetas
- `add_contact_labels` - Adiciona etiquetas

#### Conversas
- `list_conversations` - Lista conversas
- `get_conversation` - Obtém detalhes
- `list_messages` - Lista mensagens
- `create_message` - Envia mensagem
- `list_conversation_labels` - Lista labels
- `add_conversation_labels` - Adiciona labels

#### Especialistas
- `list_specialists` - Lista especialistas
- `search_specialist_by_name` - Busca por nome
- `create_specialist` - Cria especialista
- `get_specialist` - Obtém detalhes
- `get_available_slots` - Horários disponíveis

#### Agendamentos
- `list_appointments` - Lista agendamentos
- `create_appointment` - Cria agendamento
- `get_appointment` - Obtém detalhes
- `update_appointment` - Atualiza agendamento
- `delete_appointment` - Cancela agendamento
- `list_appointment_attachments` - Lista anexos
- `upload_appointment_attachment` - Upload de anexo
- `download_appointment_attachment` - Download de anexo

#### Labels
- `list_labels` - Lista etiquetas
- `create_label` - Cria etiqueta
- `get_label` - Obtém detalhes
- `update_label` - Atualiza etiqueta
- `delete_label` - Remove etiqueta

---

## Convenções

Este changelog segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

### Tipos de Mudança

- **Adicionado** - Novas funcionalidades
- **Alterado** - Mudanças em funcionalidades existentes
- **Depreciado** - Funcionalidades que serão removidas
- **Removido** - Funcionalidades removidas
- **Corrigido** - Correções de bugs
- **Segurança** - Correções de vulnerabilidades
