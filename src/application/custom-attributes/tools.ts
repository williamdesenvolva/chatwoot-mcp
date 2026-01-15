import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const customAttributeTools: Tool[] = [
  {
    name: 'list_custom_attributes',
    description: 'List all custom attribute definitions',
    inputSchema: {
      type: 'object',
      required: ['attribute_model'],
      properties: {
        attribute_model: {
          type: 'string',
          enum: ['contact_attribute', 'conversation_attribute'],
          description: 'Type of custom attribute',
        },
      },
    },
  },
  {
    name: 'create_custom_attribute',
    description: 'Create a new custom attribute definition',
    inputSchema: {
      type: 'object',
      required: ['attribute_display_name', 'attribute_display_type', 'attribute_key', 'attribute_model'],
      properties: {
        attribute_display_name: {
          type: 'string',
          description: 'Display name of the attribute',
        },
        attribute_display_type: {
          type: 'string',
          enum: ['text', 'number', 'currency', 'percent', 'link', 'date', 'list', 'checkbox'],
          description: 'Type of the attribute for display',
        },
        attribute_key: {
          type: 'string',
          description: 'Key identifier for the attribute',
        },
        attribute_model: {
          type: 'string',
          enum: ['contact_attribute', 'conversation_attribute'],
          description: 'Model type (contact or conversation)',
        },
        attribute_description: {
          type: 'string',
          description: 'Description of the attribute',
        },
        attribute_values: {
          type: 'array',
          items: { type: 'string' },
          description: 'Possible values for list type attributes',
        },
      },
    },
  },
  {
    name: 'get_custom_attribute',
    description: 'Get details of a custom attribute',
    inputSchema: {
      type: 'object',
      required: ['custom_attribute_id'],
      properties: {
        custom_attribute_id: {
          type: 'number',
          description: 'ID of the custom attribute',
        },
      },
    },
  },
  {
    name: 'update_custom_attribute',
    description: 'Update a custom attribute definition',
    inputSchema: {
      type: 'object',
      required: ['custom_attribute_id'],
      properties: {
        custom_attribute_id: {
          type: 'number',
          description: 'ID of the custom attribute',
        },
        attribute_display_name: {
          type: 'string',
          description: 'New display name',
        },
        attribute_description: {
          type: 'string',
          description: 'New description',
        },
        attribute_values: {
          type: 'array',
          items: { type: 'string' },
          description: 'New possible values for list type',
        },
      },
    },
  },
  {
    name: 'delete_custom_attribute',
    description: 'Delete a custom attribute definition',
    inputSchema: {
      type: 'object',
      required: ['custom_attribute_id'],
      properties: {
        custom_attribute_id: {
          type: 'number',
          description: 'ID of the custom attribute to delete',
        },
      },
    },
  },
];
