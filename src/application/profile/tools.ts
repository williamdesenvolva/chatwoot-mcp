import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const profileTools: Tool[] = [
  {
    name: 'get_profile',
    description: 'Get the current user profile',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'update_profile',
    description: 'Update the current user profile',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'User name',
        },
        email: {
          type: 'string',
          description: 'User email',
        },
        display_name: {
          type: 'string',
          description: 'Display name',
        },
        availability: {
          type: 'string',
          enum: ['online', 'offline', 'busy'],
          description: 'Availability status',
        },
        auto_offline: {
          type: 'boolean',
          description: 'Auto set to offline when inactive',
        },
      },
    },
  },
  {
    name: 'update_availability',
    description: 'Update availability status for the current user',
    inputSchema: {
      type: 'object',
      required: ['availability'],
      properties: {
        availability: {
          type: 'string',
          enum: ['online', 'offline', 'busy'],
          description: 'Availability status',
        },
      },
    },
  },
  {
    name: 'update_avatar',
    description: 'Update the user avatar',
    inputSchema: {
      type: 'object',
      required: ['avatar_url'],
      properties: {
        avatar_url: {
          type: 'string',
          description: 'URL of the avatar image',
        },
      },
    },
  },
  {
    name: 'delete_avatar',
    description: 'Delete the user avatar',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];
