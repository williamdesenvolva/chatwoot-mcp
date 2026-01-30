export const appointmentTools = [
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
    // Appointment Attachments
    {
        name: 'list_appointment_attachments',
        description: 'List all attachments for an appointment',
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
        name: 'get_appointment_attachment',
        description: 'Get details of a specific attachment',
        inputSchema: {
            type: 'object',
            required: ['appointment_id', 'attachment_id'],
            properties: {
                appointment_id: {
                    type: 'number',
                    description: 'ID of the appointment',
                },
                attachment_id: {
                    type: 'number',
                    description: 'ID of the attachment',
                },
            },
        },
    },
    {
        name: 'delete_appointment_attachment',
        description: 'Delete an attachment from an appointment',
        inputSchema: {
            type: 'object',
            required: ['appointment_id', 'attachment_id'],
            properties: {
                appointment_id: {
                    type: 'number',
                    description: 'ID of the appointment',
                },
                attachment_id: {
                    type: 'number',
                    description: 'ID of the attachment to delete',
                },
            },
        },
    },
    {
        name: 'download_appointment_attachment',
        description: 'Get the download URL for an appointment attachment. Returns a secure signed URL that can be used to download the file.',
        inputSchema: {
            type: 'object',
            required: ['appointment_id', 'attachment_id'],
            properties: {
                appointment_id: {
                    type: 'number',
                    description: 'ID of the appointment',
                },
                attachment_id: {
                    type: 'number',
                    description: 'ID of the attachment to download',
                },
            },
        },
    },
    {
        name: 'upload_appointment_attachment',
        description: 'Upload a file as an attachment to an appointment. You can provide either a file_url to download from or file_content as base64 encoded data.',
        inputSchema: {
            type: 'object',
            required: ['appointment_id'],
            properties: {
                appointment_id: {
                    type: 'number',
                    description: 'ID of the appointment to attach the file to',
                },
                file_url: {
                    type: 'string',
                    description: 'Public URL of the file to download and attach',
                },
                file_content: {
                    type: 'string',
                    description: 'Base64 encoded file content',
                },
                file_name: {
                    type: 'string',
                    description: 'Name of the file (required when using file_content)',
                },
                file_type: {
                    type: 'string',
                    description: 'MIME type of the file (e.g., application/pdf, image/jpeg)',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map