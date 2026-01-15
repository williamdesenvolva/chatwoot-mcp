#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { contactLabelTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';

const server = new Server(
  {
    name: 'chatwoot-contact-labels',
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
  tools: contactLabelTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'list_contact_labels': {
        const contactId = args?.contact_id as number;
        result = await client.get(
          client.accountPath(`/contacts/${contactId}/labels`)
        );
        break;
      }

      case 'add_contact_labels': {
        const contactId = args?.contact_id as number;
        result = await client.post(
          client.accountPath(`/contacts/${contactId}/labels`),
          { labels: args?.labels }
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
  console.error('Chatwoot Contact Labels MCP Server running on stdio');
}

main().catch(console.error);
