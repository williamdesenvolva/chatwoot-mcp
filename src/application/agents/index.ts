#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { agentTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { Agent } from '../../shared/types.js';

const server = new Server(
  {
    name: 'chatwoot-agents',
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
  tools: agentTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'list_agents': {
        result = await client.get<Agent[]>(
          client.accountPath('/agents')
        );
        break;
      }

      case 'create_agent': {
        result = await client.post<Agent>(
          client.accountPath('/agents'),
          args as Record<string, unknown>
        );
        break;
      }

      case 'update_agent': {
        const agentId = args?.agent_id as number;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.agent_id;
        result = await client.patch<Agent>(
          client.accountPath(`/agents/${agentId}`),
          updateData
        );
        break;
      }

      case 'delete_agent': {
        const agentId = args?.agent_id as number;
        await client.delete(client.accountPath(`/agents/${agentId}`));
        result = { success: true, message: `Agent ${agentId} deleted` };
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
  console.error('Chatwoot Agents MCP Server running on stdio');
}

main().catch(console.error);
