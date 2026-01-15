import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const csatTools: Tool[] = [
  {
    name: 'get_csat_metrics',
    description: 'Get CSAT (Customer Satisfaction) metrics and statistics',
    inputSchema: {
      type: 'object',
      properties: {
        since: {
          type: 'string',
          description: 'Start date (ISO 8601 format)',
        },
        until: {
          type: 'string',
          description: 'End date (ISO 8601 format)',
        },
        inbox_id: {
          type: 'number',
          description: 'Filter by inbox ID',
        },
        agent_id: {
          type: 'number',
          description: 'Filter by agent ID',
        },
        team_id: {
          type: 'number',
          description: 'Filter by team ID',
        },
      },
    },
  },
  {
    name: 'list_csat_responses',
    description: 'List all CSAT survey responses',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Page number',
        },
        since: {
          type: 'string',
          description: 'Start date (ISO 8601 format)',
        },
        until: {
          type: 'string',
          description: 'End date (ISO 8601 format)',
        },
        inbox_id: {
          type: 'number',
          description: 'Filter by inbox ID',
        },
        rating: {
          type: 'number',
          description: 'Filter by rating (1-5)',
          minimum: 1,
          maximum: 5,
        },
      },
    },
  },
  {
    name: 'get_csat_response',
    description: 'Get details of a specific CSAT response',
    inputSchema: {
      type: 'object',
      required: ['csat_response_id'],
      properties: {
        csat_response_id: {
          type: 'number',
          description: 'CSAT response ID',
        },
      },
    },
  },
  {
    name: 'download_csat_reports',
    description: 'Download CSAT reports in CSV format',
    inputSchema: {
      type: 'object',
      properties: {
        since: {
          type: 'string',
          description: 'Start date (ISO 8601 format)',
        },
        until: {
          type: 'string',
          description: 'End date (ISO 8601 format)',
        },
        inbox_id: {
          type: 'number',
          description: 'Filter by inbox ID',
        },
      },
    },
  },
];
