import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const appointmentTools: Tool[] = [
  {
    name: 'list_appointments',
    description: 'List all appointments',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Page number',
        },
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'cancelled', 'completed'],
          description: 'Filter by appointment status',
        },
        specialist_id: {
          type: 'number',
          description: 'Filter by specialist ID',
        },
        start_date: {
          type: 'string',
          description: 'Filter by start date (ISO 8601 format)',
        },
        end_date: {
          type: 'string',
          description: 'Filter by end date (ISO 8601 format)',
        },
      },
    },
  },
  {
    name: 'create_appointment',
    description: 'Create a new appointment',
    inputSchema: {
      type: 'object',
      required: ['title', 'start_time', 'end_time', 'specialist_id'],
      properties: {
        title: {
          type: 'string',
          description: 'Title of the appointment',
        },
        description: {
          type: 'string',
          description: 'Description of the appointment',
        },
        start_time: {
          type: 'string',
          description: 'Start time (ISO 8601 format)',
        },
        end_time: {
          type: 'string',
          description: 'End time (ISO 8601 format)',
        },
        specialist_id: {
          type: 'number',
          description: 'ID of the specialist',
        },
        contact_id: {
          type: 'number',
          description: 'ID of the contact (optional)',
        },
        contact_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'IDs of multiple contacts (optional)',
        },
      },
    },
  },
  {
    name: 'get_appointment',
    description: 'Get details of an appointment',
    inputSchema: {
      type: 'object',
      required: ['appointment_id'],
      properties: {
        appointment_id: {
          type: 'number',
          description: 'ID of the appointment',
        },
      },
    },
  },
  {
    name: 'update_appointment',
    description: 'Update an appointment',
    inputSchema: {
      type: 'object',
      required: ['appointment_id'],
      properties: {
        appointment_id: {
          type: 'number',
          description: 'ID of the appointment',
        },
        title: {
          type: 'string',
          description: 'New title',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        start_time: {
          type: 'string',
          description: 'New start time (ISO 8601 format)',
        },
        end_time: {
          type: 'string',
          description: 'New end time (ISO 8601 format)',
        },
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'cancelled', 'completed'],
          description: 'New status',
        },
      },
    },
  },
  {
    name: 'delete_appointment',
    description: 'Delete an appointment',
    inputSchema: {
      type: 'object',
      required: ['appointment_id'],
      properties: {
        appointment_id: {
          type: 'number',
          description: 'ID of the appointment to delete',
        },
      },
    },
  },
  {
    name: 'get_available_slots',
    description: 'Get available time slots for a specialist',
    inputSchema: {
      type: 'object',
      required: ['specialist_id', 'date'],
      properties: {
        specialist_id: {
          type: 'number',
          description: 'ID of the specialist',
        },
        date: {
          type: 'string',
          description: 'Date to check (YYYY-MM-DD format)',
        },
        duration: {
          type: 'number',
          description: 'Duration in minutes (optional)',
        },
      },
    },
  },
];
