#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { platformAccountTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';

interface PlatformAccount {
  id: number;
  name: string;
  locale: string;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

const server = new Server(
  {
    name: 'chatwoot-platform-accounts',
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
  tools: platformAccountTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'platform_list_accounts': {
        const params: Record<string, unknown> = {};
        if (args?.page) params.page = args.page;
        result = await client.get<PlatformAccount[]>(
          client.platformPath('/accounts'),
          params
        );
        break;
      }

      case 'platform_create_account': {
        result = await client.post<PlatformAccount>(
          client.platformPath('/accounts'),
          args as Record<string, unknown>
        );
        break;
      }

      case 'platform_get_account': {
        const accountId = args?.account_id as number;
        result = await client.get<PlatformAccount>(
          client.platformPath(`/accounts/${accountId}`)
        );
        break;
      }

      case 'platform_update_account': {
        const accountId = args?.account_id as number;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.account_id;
        result = await client.patch<PlatformAccount>(
          client.platformPath(`/accounts/${accountId}`),
          updateData
        );
        break;
      }

      case 'platform_delete_account': {
        const accountId = args?.account_id as number;
        await client.delete(client.platformPath(`/accounts/${accountId}`));
        result = { success: true, message: `Account ${accountId} deleted` };
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
  console.error('Chatwoot Platform Accounts MCP Server running on stdio');
}

main().catch(console.error);
