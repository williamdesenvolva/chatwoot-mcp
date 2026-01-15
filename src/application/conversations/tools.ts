import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const conversationTools: Tool[] = [
  {
    name: 'list_conversations',
    description: 'List all conversations with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        inbox_id: {
          type: 'number',
          description: 'Filter by inbox ID',
        },
        status: {
          type: 'string',
          enum: ['open', 'resolved', 'pending', 'snoozed', 'all'],
          description: 'Filter by status',
        },
        assignee_type: {
          type: 'string',
          enum: ['me', 'unassigned', 'all'],
          description: 'Filter by assignee type',
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)',
        },
      },
    },
  },
  {
    name: 'create_conversation',
    description: 'Create a new conversation',
    inputSchema: {
      type: 'object',
      required: ['inbox_id', 'contact_id'],
      properties: {
        inbox_id: {
          type: 'number',
          description: 'ID of the inbox',
        },
        contact_id: {
          type: 'number',
          description: 'ID of the contact',
        },
        status: {
          type: 'string',
          enum: ['open', 'resolved', 'pending'],
          description: 'Initial status (default: open)',
        },
        assignee_id: {
          type: 'number',
          description: 'ID of the agent to assign',
        },
        team_id: {
          type: 'number',
          description: 'ID of the team to assign',
        },
      },
    },
  },
  {
    name: 'get_conversation',
    description: 'Get details of a specific conversation',
    inputSchema: {
      type: 'object',
      required: ['conversation_id'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
      },
    },
  },
  {
    name: 'update_conversation',
    description: 'Update conversation details',
    inputSchema: {
      type: 'object',
      required: ['conversation_id'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Priority level',
        },
        snoozed_until: {
          type: 'number',
          description: 'Snooze until timestamp (Unix)',
        },
      },
    },
  },
  {
    name: 'filter_conversations',
    description: 'Filter conversations using advanced filters',
    inputSchema: {
      type: 'object',
      required: ['payload'],
      properties: {
        payload: {
          type: 'array',
          description: 'Array of filter conditions',
          items: {
            type: 'object',
            properties: {
              attribute_key: {
                type: 'string',
                description: 'Attribute to filter (status, assignee_id, inbox_id, etc.)',
              },
              filter_operator: {
                type: 'string',
                enum: ['equal_to', 'not_equal_to', 'contains', 'does_not_contain', 'is_present', 'is_not_present'],
              },
              values: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        page: {
          type: 'number',
          description: 'Page number',
        },
      },
    },
  },
  {
    name: 'toggle_status',
    description: 'Toggle conversation status (open/resolved/pending)',
    inputSchema: {
      type: 'object',
      required: ['conversation_id', 'status'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        status: {
          type: 'string',
          enum: ['open', 'resolved', 'pending', 'snoozed'],
          description: 'New status',
        },
      },
    },
  },
  {
    name: 'toggle_priority',
    description: 'Set conversation priority',
    inputSchema: {
      type: 'object',
      required: ['conversation_id', 'priority'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent', 'none'],
          description: 'Priority level (none to remove)',
        },
      },
    },
  },
  {
    name: 'get_conversation_meta',
    description: 'Get conversation counts and metadata',
    inputSchema: {
      type: 'object',
      properties: {
        inbox_id: {
          type: 'number',
          description: 'Filter by inbox ID',
        },
        status: {
          type: 'string',
          enum: ['open', 'resolved', 'pending', 'snoozed', 'all'],
          description: 'Filter by status',
        },
      },
    },
  },
  {
    name: 'set_custom_attributes',
    description: 'Set custom attributes on a conversation',
    inputSchema: {
      type: 'object',
      required: ['conversation_id', 'custom_attributes'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        custom_attributes: {
          type: 'object',
          description: 'Custom attributes as key-value pairs',
        },
      },
    },
  },
];
