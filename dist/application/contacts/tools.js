export const contactTools = [
    {
        name: 'list_contacts',
        description: 'List all contacts in the account with pagination',
        inputSchema: {
            type: 'object',
            properties: {
                page: {
                    type: 'number',
                    description: 'Page number (default: 1)',
                },
                sort: {
                    type: 'string',
                    enum: ['name', 'email', 'phone_number', 'last_activity_at', '-name', '-email', '-phone_number', '-last_activity_at'],
                    description: 'Sort field (prefix with - for descending)',
                },
            },
        },
    },
    {
        name: 'create_contact',
        description: 'Create a new contact',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the contact',
                },
                email: {
                    type: 'string',
                    description: 'Email address of the contact',
                },
                phone_number: {
                    type: 'string',
                    description: 'Phone number of the contact',
                },
                identifier: {
                    type: 'string',
                    description: 'External identifier for the contact',
                },
                custom_attributes: {
                    type: 'object',
                    description: 'Custom attributes as key-value pairs',
                },
            },
        },
    },
    {
        name: 'get_contact',
        description: 'Get details of a specific contact by ID',
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
        name: 'update_contact',
        description: 'Update an existing contact',
        inputSchema: {
            type: 'object',
            required: ['contact_id'],
            properties: {
                contact_id: {
                    type: 'number',
                    description: 'ID of the contact to update',
                },
                name: {
                    type: 'string',
                    description: 'New name for the contact',
                },
                email: {
                    type: 'string',
                    description: 'New email address',
                },
                phone_number: {
                    type: 'string',
                    description: 'New phone number',
                },
                custom_attributes: {
                    type: 'object',
                    description: 'Custom attributes to update',
                },
            },
        },
    },
    {
        name: 'delete_contact',
        description: 'Delete a contact by ID',
        inputSchema: {
            type: 'object',
            required: ['contact_id'],
            properties: {
                contact_id: {
                    type: 'number',
                    description: 'ID of the contact to delete',
                },
            },
        },
    },
    {
        name: 'search_contacts',
        description: 'Search contacts by query string',
        inputSchema: {
            type: 'object',
            required: ['query'],
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query (searches name, email, phone)',
                },
                page: {
                    type: 'number',
                    description: 'Page number (default: 1)',
                },
            },
        },
    },
    {
        name: 'filter_contacts',
        description: 'Filter contacts using advanced filters',
        inputSchema: {
            type: 'object',
            required: ['payload'],
            properties: {
                payload: {
                    type: 'array',
                    description: 'Array of filter conditions',
                    items: {
                        type: 'object',
                        properties: {
                            attribute_key: {
                                type: 'string',
                                description: 'Attribute to filter on (e.g., "email", "name", "phone_number")',
                            },
                            filter_operator: {
                                type: 'string',
                                enum: ['equal_to', 'not_equal_to', 'contains', 'does_not_contain', 'is_present', 'is_not_present'],
                                description: 'Filter operator',
                            },
                            values: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Values to filter by',
                            },
                        },
                    },
                },
                page: {
                    type: 'number',
                    description: 'Page number (default: 1)',
                },
            },
        },
    },
    {
        name: 'get_contact_conversations',
        description: 'Get all conversations for a specific contact',
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
        name: 'merge_contacts',
        description: 'Merge two contacts into one',
        inputSchema: {
            type: 'object',
            required: ['base_contact_id', 'mergee_contact_id'],
            properties: {
                base_contact_id: {
                    type: 'number',
                    description: 'ID of the contact to keep (base)',
                },
                mergee_contact_id: {
                    type: 'number',
                    description: 'ID of the contact to merge into base',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map