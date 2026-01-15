#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { platformAccountUserTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';

interface AccountUser {
  id: number;
  user_id: number;
  account_id: number;
  role: 'administrator' | 'agent';
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const server = new Server(
  {
    name: 'chatwoot-platform-account-users',
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
  tools: platformAccountUserTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'platform_list_account_users': {
        const accountId = args?.account_id as number;
        const params: Record<string, unknown> = {};
        if (args?.page) params.page = args.page;
        result = await client.get<AccountUser[]>(
          client.platformPath(`/accounts/${accountId}/account_users`),
          params
        );
        break;
      }

      case 'platform_add_user_to_account': {
        const accountId = args?.account_id as number;
        result = await client.post<AccountUser>(
          client.platformPath(`/accounts/${accountId}/account_users`),
          {
            user_id: args?.user_id,
            role: args?.role,
          }
        );
        break;
      }

      case 'platform_remove_user_from_account': {
        const accountId = args?.account_id as number;
        const userId = args?.user_id as number;
        await client.delete(
          client.platformPath(`/accounts/${accountId}/account_users/${userId}`)
        );
        result = { success: true, message: `User ${userId} removed from account ${accountId}` };
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
  console.error('Chatwoot Platform Account Users MCP Server running on stdio');
}

main().catch(console.error);
