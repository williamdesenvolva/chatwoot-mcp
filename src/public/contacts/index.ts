#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { publicContactTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { Contact } from '../../shared/types.js';

interface PublicContact extends Contact {
  pubsub_token?: string;
}

const server = new Server(
  {
    name: 'chatwoot-public-contacts',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const client = new ChatwootClient();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: publicContactTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'public_create_contact': {
        const inboxId = args?.inbox_identifier as string;
        const contactData = { ...args } as Record<string, unknown>;
        delete contactData.inbox_identifier;
        result = await client.post<PublicContact>(
          client.publicPath(`/inboxes/${inboxId}/contacts`),
          contactData
        );
        break;
      }

      case 'public_get_contact': {
        const inboxId = args?.inbox_identifier as string;
        const contactId = args?.contact_identifier as string;
        result = await client.get<PublicContact>(
          client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}`)
        );
        break;
      }

      case 'public_update_contact': {
        const inboxId = args?.inbox_identifier as string;
        const contactId = args?.contact_identifier as string;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.inbox_identifier;
        delete updateData.contact_identifier;
        result = await client.patch<PublicContact>(
          client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}`),
          updateData
        );
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Chatwoot Public Contacts MCP Server running on stdio');
}

main().catch(console.error);
