import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const automationTools: Tool[] = [
  {
    name: 'list_automation_rules',
    description: 'List all automation rules',
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
    name: 'create_automation_rule',
    description: 'Create a new automation rule',
    inputSchema: {
      type: 'object',
      required: ['name', 'event_name', 'conditions', 'actions'],
      properties: {
        name: {
          type: 'string',
          description: 'Name of the automation rule',
        },
        description: {
          type: 'string',
          description: 'Description of the rule',
        },
        event_name: {
          type: 'string',
          enum: ['conversation_created', 'conversation_updated', 'message_created'],
          description: 'Event that triggers the rule',
        },
        conditions: {
          type: 'array',
          description: 'Conditions for the rule to execute',
          items: {
            type: 'object',
            properties: {
              attribute_key: { type: 'string' },
              filter_operator: { type: 'string' },
              values: { type: 'array', items: { type: 'string' } },
              query_operator: { type: 'string', enum: ['and', 'or'] },
            },
          },
        },
        actions: {
          type: 'array',
          description: 'Actions to execute when conditions are met',
          items: {
            type: 'object',
            properties: {
              action_name: { type: 'string' },
              action_params: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        active: {
          type: 'boolean',
          description: 'Whether the rule is active',
        },
      },
    },
  },
  {
    name: 'get_automation_rule',
    description: 'Get details of an automation rule',
    inputSchema: {
      type: 'object',
      required: ['automation_rule_id'],
      properties: {
        automation_rule_id: {
          type: 'number',
          description: 'ID of the automation rule',
        },
      },
    },
  },
  {
    name: 'update_automation_rule',
    description: 'Update an automation rule',
    inputSchema: {
      type: 'object',
      required: ['automation_rule_id'],
      properties: {
        automation_rule_id: {
          type: 'number',
          description: 'ID of the automation rule',
        },
        name: {
          type: 'string',
          description: 'New name for the rule',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        conditions: {
          type: 'array',
          description: 'New conditions',
        },
        actions: {
          type: 'array',
          description: 'New actions',
        },
        active: {
          type: 'boolean',
          description: 'Whether the rule is active',
        },
      },
    },
  },
  {
    name: 'delete_automation_rule',
    description: 'Delete an automation rule',
    inputSchema: {
      type: 'object',
      required: ['automation_rule_id'],
      properties: {
        automation_rule_id: {
          type: 'number',
          description: 'ID of the automation rule to delete',
        },
      },
    },
  },
];
