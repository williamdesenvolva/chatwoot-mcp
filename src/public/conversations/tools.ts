import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const publicConversationTools: Tool[] = [
  {
    name: 'public_list_conversations',
    description: 'List conversations for a contact using the public API',
    inputSchema: {
      type: 'object',
      required: ['inbox_identifier', 'contact_identifier'],
      properties: {
        inbox_identifier: {
          type: 'string',
          description: 'Inbox identifier token',
        },
        contact_identifier: {
          type: 'string',
          description: 'Contact identifier token',
        },
      },
    },
  },
  {
    name: 'public_create_conversation',
    description: 'Create a new conversation using the public API',
    inputSchema: {
      type: 'object',
      required: ['inbox_identifier', 'contact_identifier'],
      properties: {
        inbox_identifier: {
          type: 'string',
          description: 'Inbox identifier token',
        },
        contact_identifier: {
          type: 'string',
          description: 'Contact identifier token',
        },
        custom_attributes: {
          type: 'object',
          description: 'Custom attributes for the conversation',
        },
      },
    },
  },
  {
    name: 'public_get_conversation',
    description: 'Get conversation details using the public API',
    inputSchema: {
      type: 'object',
      required: ['inbox_identifier', 'contact_identifier', 'conversation_id'],
      properties: {
        inbox_identifier: {
          type: 'string',
          description: 'Inbox identifier token',
        },
        contact_identifier: {
          type: 'string',
          description: 'Contact identifier token',
        },
        conversation_id: {
          type: 'number',
          description: 'Conversation ID',
        },
      },
    },
  },
  {
    name: 'public_toggle_conversation_status',
    description: 'Toggle conversation status (open/resolved) using the public API',
    inputSchema: {
      type: 'object',
      required: ['inbox_identifier', 'contact_identifier', 'conversation_id'],
      properties: {
        inbox_identifier: {
          type: 'string',
          description: 'Inbox identifier token',
        },
        contact_identifier: {
          type: 'string',
          description: 'Contact identifier token',
        },
        conversation_id: {
          type: 'number',
          description: 'Conversation ID',
        },
      },
    },
  },
  {
    name: 'public_toggle_typing',
    description: 'Send typing indicator to the conversation',
    inputSchema: {
      type: 'object',
      required: ['inbox_identifier', 'contact_identifier', 'conversation_id', 'typing_status'],
      properties: {
        inbox_identifier: {
          type: 'string',
          description: 'Inbox identifier token',
        },
        contact_identifier: {
          type: 'string',
          description: 'Contact identifier token',
        },
        conversation_id: {
          type: 'number',
          description: 'Conversation ID',
        },
        typing_status: {
          type: 'string',
          enum: ['on', 'off'],
          description: 'Typing status',
        },
      },
    },
  },
];
