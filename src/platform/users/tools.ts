import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const platformUserTools: Tool[] = [
  {
    name: 'platform_list_users',
    description: 'List all platform users (Platform Admin API)',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Page number',
        },
      },
    },
  },
  {
    name: 'platform_create_user',
    description: 'Create a new platform user (Platform Admin API)',
    inputSchema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          type: 'string',
          description: 'User name',
        },
        email: {
          type: 'string',
          description: 'User email',
        },
        password: {
          type: 'string',
          description: 'User password',
        },
        custom_attributes: {
          type: 'object',
          description: 'Custom attributes for the user',
        },
      },
    },
  },
  {
    name: 'platform_get_user',
    description: 'Get user details (Platform Admin API)',
    inputSchema: {
      type: 'object',
      required: ['user_id'],
      properties: {
        user_id: {
          type: 'number',
          description: 'User ID',
        },
      },
    },
  },
  {
    name: 'platform_update_user',
    description: 'Update a platform user (Platform Admin API)',
    inputSchema: {
      type: 'object',
      required: ['user_id'],
      properties: {
        user_id: {
          type: 'number',
          description: 'User ID',
        },
        name: {
          type: 'string',
          description: 'New name',
        },
        email: {
          type: 'string',
          description: 'New email',
        },
        password: {
          type: 'string',
          description: 'New password',
        },
        custom_attributes: {
          type: 'object',
          description: 'New custom attributes',
        },
      },
    },
  },
  {
    name: 'platform_delete_user',
    description: 'Delete a platform user (Platform Admin API)',
    inputSchema: {
      type: 'object',
      required: ['user_id'],
      properties: {
        user_id: {
          type: 'number',
          description: 'User ID to delete',
        },
      },
    },
  },
  {
    name: 'platform_get_user_sso_link',
    description: 'Get SSO login link for a user (Platform Admin API)',
    inputSchema: {
      type: 'object',
      required: ['user_id'],
      properties: {
        user_id: {
          type: 'number',
          description: 'User ID',
        },
      },
    },
  },
];
