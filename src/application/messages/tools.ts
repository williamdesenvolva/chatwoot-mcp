import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const messageTools: Tool[] = [
  {
    name: 'list_messages',
    description: 'List all messages in a conversation',
    inputSchema: {
      type: 'object',
      required: ['conversation_id'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        before: {
          type: 'number',
          description: 'Get messages before this message ID',
        },
        after: {
          type: 'number',
          description: 'Get messages after this message ID',
        },
      },
    },
  },
  {
    name: 'create_message',
    description: 'Create a new message in a conversation',
    inputSchema: {
      type: 'object',
      required: ['conversation_id', 'content'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        content: {
          type: 'string',
          description: 'Message content',
        },
        message_type: {
          type: 'string',
          enum: ['outgoing', 'incoming'],
          description: 'Type of message (default: outgoing)',
        },
        private: {
          type: 'boolean',
          description: 'Whether the message is private (internal note)',
        },
        content_type: {
          type: 'string',
          enum: ['text', 'input_select', 'cards', 'form'],
          description: 'Content type of the message',
        },
        content_attributes: {
          type: 'object',
          description: 'Additional content attributes',
        },
        template_params: {
          type: 'object',
          description: 'Template parameters for WhatsApp templates',
        },
      },
    },
  },
  {
    name: 'delete_message',
    description: 'Delete a message from a conversation',
    inputSchema: {
      type: 'object',
      required: ['conversation_id', 'message_id'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        message_id: {
          type: 'number',
          description: 'ID of the message to delete',
        },
      },
    },
  },
];
