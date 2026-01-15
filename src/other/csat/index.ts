#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { csatTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';

interface CSATMetrics {
  total_count: number;
  total_sent_messages_count: number;
  ratings_count: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  satisfaction_score: number;
  response_rate: number;
}

interface CSATResponse {
  id: number;
  rating: number;
  feedback_message?: string;
  conversation_id: number;
  contact: {
    id: number;
    name: string;
  };
  agent?: {
    id: number;
    name: string;
  };
  created_at: string;
}

const server = new Server(
  {
    name: 'chatwoot-csat',
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
  tools: csatTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'get_csat_metrics': {
        const params: Record<string, unknown> = {};
        if (args?.since) params.since = args.since;
        if (args?.until) params.until = args.until;
        if (args?.inbox_id) params.inbox_id = args.inbox_id;
        if (args?.agent_id) params.agent_id = args.agent_id;
        if (args?.team_id) params.team_id = args.team_id;
        result = await client.get<CSATMetrics>(
          client.accountPath('/csat_survey_responses/metrics'),
          params
        );
        break;
      }

      case 'list_csat_responses': {
        const params: Record<string, unknown> = {};
        if (args?.page) params.page = args.page;
        if (args?.since) params.since = args.since;
        if (args?.until) params.until = args.until;
        if (args?.inbox_id) params.inbox_id = args.inbox_id;
        if (args?.rating) params.rating = args.rating;
        result = await client.get<CSATResponse[]>(
          client.accountPath('/csat_survey_responses'),
          params
        );
        break;
      }

      case 'get_csat_response': {
        const responseId = args?.csat_response_id as number;
        result = await client.get<CSATResponse>(
          client.accountPath(`/csat_survey_responses/${responseId}`)
        );
        break;
      }

      case 'download_csat_reports': {
        const params: Record<string, unknown> = {};
        if (args?.since) params.since = args.since;
        if (args?.until) params.until = args.until;
        if (args?.inbox_id) params.inbox_id = args.inbox_id;
        result = await client.get<string>(
          client.accountPath('/csat_survey_responses/download'),
          params
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
  console.error('Chatwoot CSAT MCP Server running on stdio');
}

main().catch(console.error);
