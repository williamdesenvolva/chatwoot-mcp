import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const contactLabelTools: Tool[] = [
  {
    name: 'list_contact_labels',
    description: 'List all labels (stages) assigned to a contact. Labels represent customer journey stages.',
    inputSchema: {
      type: 'object',
      required: ['contact_id'],
      properties: {
        contact_id: {
          type: 'number',
          description: 'ID of the contact',
        },
      },
    },
  },
  {
    name: 'add_contact_labels',
    description: 'Add labels (stages) to a contact. Labels can contain spaces, uppercase letters, numbers, hyphens and underscores.',
    inputSchema: {
      type: 'object',
      required: ['contact_id', 'labels'],
      properties: {
        contact_id: {
          type: 'number',
          description: 'ID of the contact',
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
