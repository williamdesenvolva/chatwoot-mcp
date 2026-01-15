#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { platformAgentBotTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { AgentBot } from '../../shared/types.js';

const server = new Server(
  {
    name: 'chatwoot-platform-agentbots',
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
  tools: platformAgentBotTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'platform_list_agentbots': {
        const params: Record<string, unknown> = {};
        if (args?.page) params.page = args.page;
        result = await client.get<AgentBot[]>(
          client.platformPath('/agent_bots'),
          params
        );
        break;
      }

      case 'platform_create_agentbot': {
        result = await client.post<AgentBot>(
          client.platformPath('/agent_bots'),
          args as Record<string, unknown>
        );
        break;
      }

      case 'platform_get_agentbot': {
        const botId = args?.agentbot_id as number;
        result = await client.get<AgentBot>(
          client.platformPath(`/agent_bots/${botId}`)
        );
        break;
      }

      case 'platform_update_agentbot': {
        const botId = args?.agentbot_id as number;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.agentbot_id;
        result = await client.patch<AgentBot>(
          client.platformPath(`/agent_bots/${botId}`),
          updateData
        );
        break;
      }

      case 'platform_delete_agentbot': {
        const botId = args?.agentbot_id as number;
        await client.delete(client.platformPath(`/agent_bots/${botId}`));
        result = { success: true, message: `Agent bot ${botId} deleted` };
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
  console.error('Chatwoot Platform AgentBots MCP Server running on stdio');
}

main().catch(console.error);
