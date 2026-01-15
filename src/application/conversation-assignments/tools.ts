import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const conversationAssignmentTools: Tool[] = [
  {
    name: 'assign_conversation',
    description: 'Assign a conversation to an agent',
    inputSchema: {
      type: 'object',
      required: ['conversation_id', 'assignee_id'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        assignee_id: {
          type: 'number',
          description: 'ID of the agent to assign (null to unassign)',
        },
      },
    },
  },
  {
    name: 'assign_team',
    description: 'Assign a conversation to a team',
    inputSchema: {
      type: 'object',
      required: ['conversation_id', 'team_id'],
      properties: {
        conversation_id: {
          type: 'number',
          description: 'ID of the conversation',
        },
        team_id: {
          type: 'number',
          description: 'ID of the team to assign (0 to unassign)',
        },
      },
    },
  },
];
