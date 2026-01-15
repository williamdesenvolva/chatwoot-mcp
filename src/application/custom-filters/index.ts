#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { customFilterTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { CustomFilter } from '../../shared/types.js';

const server = new Server(
  {
    name: 'chatwoot-custom-filters',
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
  tools: customFilterTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'list_custom_filters': {
        const params: Record<string, unknown> = {
          filter_type: args?.filter_type,
        };
        result = await client.get<CustomFilter[]>(
          client.accountPath('/custom_filters'),
          params
        );
        break;
      }

      case 'create_custom_filter': {
        result = await client.post<CustomFilter>(
          client.accountPath('/custom_filters'),
          args as Record<string, unknown>
        );
        break;
      }

      case 'get_custom_filter': {
        const customFilterId = args?.custom_filter_id as number;
        result = await client.get<CustomFilter>(
          client.accountPath(`/custom_filters/${customFilterId}`)
        );
        break;
      }

      case 'update_custom_filter': {
        const customFilterId = args?.custom_filter_id as number;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.custom_filter_id;
        result = await client.patch<CustomFilter>(
          client.accountPath(`/custom_filters/${customFilterId}`),
          updateData
        );
        break;
      }

      case 'delete_custom_filter': {
        const customFilterId = args?.custom_filter_id as number;
        await client.delete(
          client.accountPath(`/custom_filters/${customFilterId}`)
        );
        result = { success: true, message: `Custom filter ${customFilterId} deleted` };
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
  console.error('Chatwoot Custom Filters MCP Server running on stdio');
}

main().catch(console.error);
