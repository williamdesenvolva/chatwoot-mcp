import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const platformAccountUserTools: Tool[] = [
  {
    name: 'platform_list_account_users',
    description: 'List all users in an account (Platform Admin API)',
    inputSchema: {
      type: 'object',
      required: ['account_id'],
      properties: {
        account_id: {
          type: 'number',
          description: 'Account ID',
        },
        page: {
          type: 'number',
          description: 'Page number',
        },
      },
    },
  },
  {
    name: 'platform_add_user_to_account',
    description: 'Add a user to an account (Platform Admin API)',
    inputSchema: {
      type: 'object',
      required: ['account_id', 'user_id', 'role'],
      properties: {
        account_id: {
          type: 'number',
          description: 'Account ID',
        },
        user_id: {
          type: 'number',
          description: 'User ID to add',
        },
        role: {
          type: 'string',
          enum: ['administrator', 'agent'],
          description: 'Role for the user in this account',
        },
      },
    },
  },
  {
    name: 'platform_remove_user_from_account',
    description: 'Remove a user from an account (Platform Admin API)',
    inputSchema: {
      type: 'object',
      required: ['account_id', 'user_id'],
      properties: {
        account_id: {
          type: 'number',
          description: 'Account ID',
        },
        user_id: {
          type: 'number',
          description: 'User ID to remove',
        },
      },
    },
  },
];
