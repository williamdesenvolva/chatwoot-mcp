#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { conversationTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { Conversation } from '../../shared/types.js';

const server = new Server(
  {
    name: 'chatwoot-conversations',
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
  tools: conversationTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'list_conversations': {
        const params: Record<string, unknown> = {};
        if (args?.inbox_id) params.inbox_id = args.inbox_id;
        if (args?.status) params.status = args.status;
        if (args?.assignee_type) params.assignee_type = args.assignee_type;
        if (args?.page) params.page = args.page;
        result = await client.get(
          client.accountPath('/conversations'),
          params
        );
        break;
      }

      case 'create_conversation': {
        result = await client.post<Conversation>(
          client.accountPath('/conversations'),
          args as Record<string, unknown>
        );
        break;
      }

      case 'get_conversation': {
        const conversationId = args?.conversation_id as number;
        result = await client.get<Conversation>(
          client.accountPath(`/conversations/${conversationId}`)
        );
        break;
      }

      case 'update_conversation': {
        const conversationId = args?.conversation_id as number;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.conversation_id;
        result = await client.patch<Conversation>(
          client.accountPath(`/conversations/${conversationId}`),
          updateData
        );
        break;
      }

      case 'filter_conversations': {
        const params: Record<string, unknown> = {};
        if (args?.page) params.page = args.page;
        result = await client.post(
          client.accountPath('/conversations/filter'),
          { payload: args?.payload }
        );
        break;
      }

      case 'toggle_status': {
        const conversationId = args?.conversation_id as number;
        result = await client.post(
          client.accountPath(`/conversations/${conversationId}/toggle_status`),
          { status: args?.status }
        );
        break;
      }

      case 'toggle_priority': {
        const conversationId = args?.conversation_id as number;
        result = await client.post(
          client.accountPath(`/conversations/${conversationId}/toggle_priority`),
          { priority: args?.priority }
        );
        break;
      }

      case 'get_conversation_meta': {
        const params: Record<string, unknown> = {};
        if (args?.inbox_id) params.inbox_id = args.inbox_id;
        if (args?.status) params.status = args.status;
        result = await client.get(
          client.accountPath('/conversations/meta'),
          params
        );
        break;
      }

      case 'set_custom_attributes': {
        const conversationId = args?.conversation_id as number;
        result = await client.post(
          client.accountPath(`/conversations/${conversationId}/custom_attributes`),
          { custom_attributes: args?.custom_attributes }
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
  console.error('Chatwoot Conversations MCP Server running on stdio');
}

main().catch(console.error);
