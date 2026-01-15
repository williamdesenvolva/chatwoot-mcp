#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { publicConversationTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { Conversation } from '../../shared/types.js';

const server = new Server(
  {
    name: 'chatwoot-public-conversations',
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
  tools: publicConversationTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;
    const inboxId = args?.inbox_identifier as string;
    const contactId = args?.contact_identifier as string;

    switch (name) {
      case 'public_list_conversations': {
        result = await client.get<Conversation[]>(
          client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}/conversations`)
        );
        break;
      }

      case 'public_create_conversation': {
        const conversationData = { ...args } as Record<string, unknown>;
        delete conversationData.inbox_identifier;
        delete conversationData.contact_identifier;
        result = await client.post<Conversation>(
          client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}/conversations`),
          conversationData
        );
        break;
      }

      case 'public_get_conversation': {
        const conversationId = args?.conversation_id as number;
        result = await client.get<Conversation>(
          client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}/conversations/${conversationId}`)
        );
        break;
      }

      case 'public_toggle_conversation_status': {
        const conversationId = args?.conversation_id as number;
        result = await client.post(
          client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}/conversations/${conversationId}/toggle_status`),
          {}
        );
        break;
      }

      case 'public_toggle_typing': {
        const conversationId = args?.conversation_id as number;
        result = await client.post(
          client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}/conversations/${conversationId}/toggle_typing`),
          { typing_status: args?.typing_status }
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
  console.error('Chatwoot Public Conversations MCP Server running on stdio');
}

main().catch(console.error);
