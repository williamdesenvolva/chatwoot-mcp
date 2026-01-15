import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const accountAgentBotTools: Tool[] = [
  {
    name: 'list_account_agentbots',
    description: 'List all agent bots in the account',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_account_agentbot',
    description: 'Create a new agent bot in the account',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'Name of the agent bot',
        },
        description: {
          type: 'string',
          description: 'Description of the agent bot',
        },
        outgoing_url: {
          type: 'string',
          description: 'Webhook URL for the agent bot',
        },
      },
    },
  },
  {
    name: 'get_account_agentbot',
    description: 'Get details of an agent bot',
    inputSchema: {
      type: 'object',
      required: ['agentbot_id'],
      properties: {
        agentbot_id: {
          type: 'number',
          description: 'ID of the agent bot',
        },
      },
    },
  },
  {
    name: 'update_account_agentbot',
    description: 'Update an agent bot',
    inputSchema: {
      type: 'object',
      required: ['agentbot_id'],
      properties: {
        agentbot_id: {
          type: 'number',
          description: 'ID of the agent bot',
        },
        name: {
          type: 'string',
          description: 'New name for the agent bot',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        outgoing_url: {
          type: 'string',
          description: 'New webhook URL',
        },
      },
    },
  },
  {
    name: 'delete_account_agentbot',
    description: 'Delete an agent bot',
    inputSchema: {
      type: 'object',
      required: ['agentbot_id'],
      properties: {
        agentbot_id: {
          type: 'number',
          description: 'ID of the agent bot to delete',
        },
      },
    },
  },
];
