#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { conversationAssignmentTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { Conversation } from '../../shared/types.js';

const server = new Server(
  {
    name: 'chatwoot-conversation-assignments',
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
  tools: conversationAssignmentTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'assign_conversation': {
        const conversationId = args?.conversation_id as number;
        result = await client.post<Conversation>(
          client.accountPath(`/conversations/${conversationId}/assignments`),
          { assignee_id: args?.assignee_id }
        );
        break;
      }

      case 'assign_team': {
        const conversationId = args?.conversation_id as number;
        result = await client.post<Conversation>(
          client.accountPath(`/conversations/${conversationId}/assignments`),
          { team_id: args?.team_id }
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
  console.error('Chatwoot Conversation Assignments MCP Server running on stdio');
}

main().catch(console.error);
