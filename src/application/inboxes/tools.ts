import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const inboxTools: Tool[] = [
  {
    name: 'list_inboxes',
    description: 'List all inboxes in the account',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_inbox',
    description: 'Create a new inbox',
    inputSchema: {
      type: 'object',
      required: ['name', 'channel'],
      properties: {
        name: {
          type: 'string',
          description: 'Name of the inbox',
        },
        channel: {
          type: 'object',
          description: 'Channel configuration',
          properties: {
            type: {
              type: 'string',
              enum: ['web_widget', 'api', 'email', 'facebook', 'twitter', 'whatsapp', 'sms', 'telegram'],
              description: 'Type of channel',
            },
            website_url: {
              type: 'string',
              description: 'Website URL for web widget',
            },
            webhook_url: {
              type: 'string',
              description: 'Webhook URL for API channels',
            },
          },
        },
        greeting_enabled: {
          type: 'boolean',
          description: 'Enable greeting message',
        },
        greeting_message: {
          type: 'string',
          description: 'Greeting message content',
        },
        enable_auto_assignment: {
          type: 'boolean',
          description: 'Enable automatic assignment',
        },
      },
    },
  },
  {
    name: 'get_inbox',
    description: 'Get details of a specific inbox',
    inputSchema: {
      type: 'object',
      required: ['inbox_id'],
      properties: {
        inbox_id: {
          type: 'number',
          description: 'ID of the inbox',
        },
      },
    },
  },
  {
    name: 'update_inbox',
    description: 'Update an inbox',
    inputSchema: {
      type: 'object',
      required: ['inbox_id'],
      properties: {
        inbox_id: {
          type: 'number',
          description: 'ID of the inbox',
        },
        name: {
          type: 'string',
          description: 'New name for the inbox',
        },
        enable_auto_assignment: {
          type: 'boolean',
          description: 'Enable automatic assignment',
        },
        greeting_enabled: {
          type: 'boolean',
          description: 'Enable greeting message',
        },
        greeting_message: {
          type: 'string',
          description: 'Greeting message content',
        },
        csat_survey_enabled: {
          type: 'boolean',
          description: 'Enable CSAT survey',
        },
        allow_messages_after_resolved: {
          type: 'boolean',
          description: 'Allow messages after resolution',
        },
      },
    },
  },
  {
    name: 'delete_inbox',
    description: 'Delete an inbox',
    inputSchema: {
      type: 'object',
      required: ['inbox_id'],
      properties: {
        inbox_id: {
          type: 'number',
          description: 'ID of the inbox to delete',
        },
      },
    },
  },
  {
    name: 'list_inbox_members',
    description: 'List all agents assigned to an inbox',
    inputSchema: {
      type: 'object',
      required: ['inbox_id'],
      properties: {
        inbox_id: {
          type: 'number',
          description: 'ID of the inbox',
        },
      },
    },
  },
  {
    name: 'add_inbox_member',
    description: 'Add an agent to an inbox',
    inputSchema: {
      type: 'object',
      required: ['inbox_id', 'user_ids'],
      properties: {
        inbox_id: {
          type: 'number',
          description: 'ID of the inbox',
        },
        user_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of user IDs to add',
        },
      },
    },
  },
  {
    name: 'remove_inbox_member',
    description: 'Remove an agent from an inbox',
    inputSchema: {
      type: 'object',
      required: ['inbox_id', 'user_ids'],
      properties: {
        inbox_id: {
          type: 'number',
          description: 'ID of the inbox',
        },
        user_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of user IDs to remove',
        },
      },
    },
  },
  {
    name: 'get_inbox_agentbot',
    description: 'Get the agent bot assigned to an inbox',
    inputSchema: {
      type: 'object',
      required: ['inbox_id'],
      properties: {
        inbox_id: {
          type: 'number',
          description: 'ID of the inbox',
        },
      },
    },
  },
  {
    name: 'set_inbox_agentbot',
    description: 'Assign an agent bot to an inbox',
    inputSchema: {
      type: 'object',
      required: ['inbox_id', 'agent_bot_id'],
      properties: {
        inbox_id: {
          type: 'number',
          description: 'ID of the inbox',
        },
        agent_bot_id: {
          type: 'number',
          description: 'ID of the agent bot (null to remove)',
        },
      },
    },
  },
];
