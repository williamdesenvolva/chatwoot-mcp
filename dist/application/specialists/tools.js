export const specialistTools = [
    {
        name: 'list_specialists',
        description: 'List all specialists in the account',
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
        name: 'create_specialist',
        description: 'Create a new specialist',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the specialist',
                },
                email: {
                    type: 'string',
                    description: 'Email of the specialist',
                },
                phone: {
                    type: 'string',
                    description: 'Phone number of the specialist',
                },
                active: {
                    type: 'boolean',
                    description: 'Whether the specialist is active',
                },
                max_concurrent_appointments: {
                    type: 'number',
                    description: 'Maximum number of concurrent appointments allowed (1-10, default: 1)',
                },
            },
        },
    },
    {
        name: 'get_specialist',
        description: 'Get details of a specialist',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: {
                    type: 'number',
                    description: 'ID of the specialist',
                },
            },
        },
    },
    {
        name: 'update_specialist',
        description: 'Update a specialist',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: {
                    type: 'number',
                    description: 'ID of the specialist',
                },
                name: {
                    type: 'string',
                    description: 'New name for the specialist',
                },
                email: {
                    type: 'string',
                    description: 'New email',
                },
                phone: {
                    type: 'string',
                    description: 'New phone number',
                },
                active: {
                    type: 'boolean',
                    description: 'Whether the specialist is active',
                },
                max_concurrent_appointments: {
                    type: 'number',
                    description: 'Maximum number of concurrent appointments allowed (1-10)',
                },
            },
        },
    },
    {
        name: 'delete_specialist',
        description: 'Delete a specialist',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: {
                    type: 'number',
                    description: 'ID of the specialist to delete',
                },
            },
        },
    },
    {
        name: 'get_specialist_availabilities',
        description: 'Get availability schedule for a specialist',
        inputSchema: {
            type: 'object',
            required: ['specialist_id'],
            properties: {
                specialist_id: {
                    type: 'number',
                    description: 'ID of the specialist',
                },
            },
        },
    },
    {
        name: 'update_specialist_availabilities',
        description: 'Update availability schedule for a specialist',
        inputSchema: {
            type: 'object',
            required: ['specialist_id', 'availabilities'],
            properties: {
                specialist_id: {
                    type: 'number',
                    description: 'ID of the specialist',
                },
                availabilities: {
                    type: 'array',
                    description: 'Array of availability slots',
                    items: {
                        type: 'object',
                        properties: {
                            day_of_week: { type: 'number', description: '0-6 (Sunday to Saturday)' },
                            open_hour: { type: 'number', description: 'Opening hour (0-23)' },
                            open_minutes: { type: 'number', description: 'Opening minutes (0-59)' },
                            close_hour: { type: 'number', description: 'Closing hour (0-23)' },
                            close_minutes: { type: 'number', description: 'Closing minutes (0-59)' },
                            closed_all_day: { type: 'boolean', description: 'Whether closed all day' },
                        },
                    },
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map