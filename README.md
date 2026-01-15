# Chatwoot MCP Servers

MCP (Model Context Protocol) servers for Chatwoot APIs. Compatible with Claude Code, n8n, LangChain, and any MCP-compatible client.

## Features

- **30 MCP Servers** covering all Chatwoot API endpoints
- **Application APIs** - Contacts, Conversations, Messages, Teams, Inboxes, and more
- **Platform APIs** - Account and User management for self-hosted instances
- **Public APIs** - Widget/client-side integrations
- Full TypeScript support
- Ready for Claude Code, n8n, and LangChain integration

## Requirements

- Node.js 18+
- npm or yarn
- Chatwoot instance with API access

## Installation

```bash
# Clone or navigate to the project
cd chatwoot-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Create environment variables or a `.env` file:

```bash
# Required
export CHATWOOT_API_URL="https://your-chatwoot-instance.com"
export CHATWOOT_API_KEY="your-api-access-token"
export CHATWOOT_ACCOUNT_ID="1"

# Optional (for Public APIs)
export CHATWOOT_INBOX_IDENTIFIER="your-inbox-identifier"
export CHATWOOT_CONTACT_IDENTIFIER="your-contact-identifier"
```

### Getting Your API Key

1. Log in to your Chatwoot instance
2. Go to **Settings > Profile Settings**
3. Copy your **Access Token**

### Getting Platform API Key (Self-hosted only)

For Platform APIs, you need a platform app token:
1. Access your Chatwoot installation
2. Create a Platform App in Super Admin settings
3. Use the generated access token

## Available MCP Servers

### Application APIs

| Server | Command | Description |
|--------|---------|-------------|
| Contacts | `npm run start:contacts` | Manage contacts (CRUD, search, filter) |
| Conversations | `npm run start:conversations` | Manage conversations (list, create, update status) |
| Messages | `npm run start:messages` | Send and manage messages |
| Agents | `npm run start:agents` | Manage agents in account |
| Inboxes | `npm run start:inboxes` | Manage inboxes (channels) |
| Teams | `npm run start:teams` | Manage teams and members |
| Webhooks | `npm run start:webhooks` | Configure webhooks |
| Canned Responses | `npm run start:canned-responses` | Manage canned/quick responses |
| Custom Attributes | `npm run start:custom-attributes` | Manage custom attributes |
| Custom Filters | `npm run start:custom-filters` | Manage saved filters |
| Contact Labels | `npm run start:contact-labels` | Manage contact labels |
| Conversation Labels | `npm run start:conversation-labels` | Manage conversation labels |
| Conversation Assignments | `npm run start:conversation-assignments` | Assign conversations to agents/teams |
| Automation | `npm run start:automation` | Manage automation rules |
| Account AgentBots | `npm run start:account-agentbots` | Manage account-level agent bots |
| Specialists | `npm run start:specialists` | Manage specialists (for appointments) |
| Appointments | `npm run start:appointments` | Manage appointments/scheduling |
| Reports | `npm run start:reports` | Access reports and analytics |
| Profile | `npm run start:profile` | Manage user profile |
| Help Center | `npm run start:help-center` | Manage portals, categories, articles |
| Integrations | `npm run start:integrations` | Manage integrations (Slack, etc.) |

### Platform APIs (Self-hosted)

| Server | Command | Description |
|--------|---------|-------------|
| Accounts | `npm run start:platform-accounts` | Manage accounts (create, update, delete) |
| Users | `npm run start:platform-users` | Manage platform users |
| AgentBots | `npm run start:platform-agentbots` | Manage platform-level agent bots |
| Account Users | `npm run start:platform-account-users` | Manage users in accounts |

### Public APIs (Client-side)

| Server | Command | Description |
|--------|---------|-------------|
| Contacts | `npm run start:public-contacts` | Create/manage contacts (widget) |
| Conversations | `npm run start:public-conversations` | Create/manage conversations (widget) |
| Messages | `npm run start:public-messages` | Send messages (widget) |

### Other APIs

| Server | Command | Description |
|--------|---------|-------------|
| CSAT | `npm run start:csat` | Customer satisfaction surveys |

## Integration Examples

### Claude Code

Add to your Claude Code MCP settings (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "chatwoot-contacts": {
      "command": "node",
      "args": ["/path/to/chatwoot-mcp/dist/application/contacts/index.js"],
      "env": {
        "CHATWOOT_API_URL": "https://your-chatwoot.com",
        "CHATWOOT_API_KEY": "your-api-key",
        "CHATWOOT_ACCOUNT_ID": "1"
      }
    },
    "chatwoot-conversations": {
      "command": "node",
      "args": ["/path/to/chatwoot-mcp/dist/application/conversations/index.js"],
      "env": {
        "CHATWOOT_API_URL": "https://your-chatwoot.com",
        "CHATWOOT_API_KEY": "your-api-key",
        "CHATWOOT_ACCOUNT_ID": "1"
      }
    },
    "chatwoot-messages": {
      "command": "node",
      "args": ["/path/to/chatwoot-mcp/dist/application/messages/index.js"],
      "env": {
        "CHATWOOT_API_URL": "https://your-chatwoot.com",
        "CHATWOOT_API_KEY": "your-api-key",
        "CHATWOOT_ACCOUNT_ID": "1"
      }
    }
  }
}
```

### n8n

Use the MCP Client node in n8n:

1. Add an **MCP Client** node
2. Configure the server command:
   - Command: `node`
   - Arguments: `/path/to/chatwoot-mcp/dist/application/contacts/index.js`
3. Set environment variables in the node configuration

### LangChain

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["./dist/application/contacts/index.js"],
  env: {
    CHATWOOT_API_URL: "https://your-chatwoot.com",
    CHATWOOT_API_KEY: "your-api-key",
    CHATWOOT_ACCOUNT_ID: "1"
  }
});

const client = new Client({
  name: "langchain-client",
  version: "1.0.0"
});

await client.connect(transport);

// List available tools
const tools = await client.listTools();
console.log(tools);

// Call a tool
const result = await client.callTool({
  name: "list_contacts",
  arguments: { page: 1 }
});
console.log(result);
```

## Tool Examples

### Contacts

```javascript
// List contacts
{ name: "list_contacts", arguments: { page: 1 } }

// Search contacts
{ name: "search_contacts", arguments: { q: "john@example.com" } }

// Create contact
{ name: "create_contact", arguments: {
  name: "John Doe",
  email: "john@example.com",
  phone_number: "+1234567890"
}}

// Get contact
{ name: "get_contact", arguments: { contact_id: 123 } }

// Update contact
{ name: "update_contact", arguments: {
  contact_id: 123,
  name: "John Updated"
}}
```

### Conversations

```javascript
// List conversations
{ name: "list_conversations", arguments: {
  status: "open",
  inbox_id: 1
}}

// Get conversation
{ name: "get_conversation", arguments: { conversation_id: 456 } }

// Update conversation status
{ name: "toggle_conversation_status", arguments: {
  conversation_id: 456,
  status: "resolved"
}}

// Assign conversation
{ name: "assign_conversation", arguments: {
  conversation_id: 456,
  assignee_id: 789
}}
```

### Messages

```javascript
// List messages
{ name: "list_messages", arguments: { conversation_id: 456 } }

// Send message
{ name: "create_message", arguments: {
  conversation_id: 456,
  content: "Hello! How can I help you?",
  message_type: "outgoing"
}}

// Send private note
{ name: "create_message", arguments: {
  conversation_id: 456,
  content: "Internal note for team",
  private: true
}}
```

### Reports

```javascript
// Get account summary
{ name: "get_account_summary", arguments: {
  since: "2024-01-01",
  until: "2024-01-31"
}}

// Get conversations report
{ name: "get_conversations_report", arguments: {
  metric: "conversations_count",
  type: "account",
  since: "2024-01-01",
  until: "2024-01-31"
}}
```

### Help Center

```javascript
// List portals
{ name: "list_portals", arguments: {} }

// Create article
{ name: "create_article", arguments: {
  portal_slug: "help",
  title: "Getting Started",
  content: "# Welcome\n\nThis is your guide...",
  category_id: 1,
  status: "published"
}}
```

## Project Structure

```
chatwoot-mcp/
├── src/
│   ├── application/          # Application APIs
│   │   ├── contacts/
│   │   ├── conversations/
│   │   ├── messages/
│   │   ├── agents/
│   │   ├── inboxes/
│   │   ├── teams/
│   │   ├── webhooks/
│   │   ├── canned-responses/
│   │   ├── custom-attributes/
│   │   ├── custom-filters/
│   │   ├── contact-labels/
│   │   ├── conversation-labels/
│   │   ├── conversation-assignments/
│   │   ├── automation/
│   │   ├── account-agentbots/
│   │   ├── specialists/
│   │   ├── appointments/
│   │   ├── reports/
│   │   ├── profile/
│   │   ├── help-center/
│   │   └── integrations/
│   ├── platform/             # Platform APIs
│   │   ├── accounts/
│   │   ├── users/
│   │   ├── agentbots/
│   │   └── account-users/
│   ├── public/               # Public APIs
│   │   ├── contacts/
│   │   ├── conversations/
│   │   └── messages/
│   ├── other/                # Other APIs
│   │   └── csat/
│   └── shared/               # Shared utilities
│       ├── api-client.ts
│       ├── config.ts
│       └── types.ts
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build
```

## API Reference

For detailed API documentation, refer to the [Chatwoot API Documentation](https://www.chatwoot.com/developers/api/).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
