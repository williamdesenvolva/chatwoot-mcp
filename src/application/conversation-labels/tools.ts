import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const conversationLabelTools: Tool[] = [
  {
    name: 'list_conversation_labels',
    description: 'List all labels (stages) assigned to a conversation. Labels represent customer journey stages.',
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
    name: 'add_conversation_labels',
    description: 'Add labels (stages) to a conversation. Labels can contain spaces, uppercase letters, numbers, hyphens and underscores.',
    inputSchema: {
      type: 'object',
      required: ['conversation_id', 'labels'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of label/stage names to add (e.g., ["New Lead", "In Negotiation"])',
        },
      },
    },
  },
];
