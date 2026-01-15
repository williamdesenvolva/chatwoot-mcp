export const publicContactTools = [
    {
        name: 'public_create_contact',
        description: 'Create or get a contact using the public API (for widget/client integration)',
        inputSchema: {
            type: 'object',
            required: ['inbox_identifier'],
            properties: {
                inbox_identifier: {
                    type: 'string',
                    description: 'Inbox identifier token',
                },
                identifier: {
                    type: 'string',
                    description: 'Unique identifier for the contact',
                },
                identifier_hash: {
                    type: 'string',
                    description: 'HMAC hash for identity validation',
                },
                name: {
                    type: 'string',
                    description: 'Contact name',
                },
                email: {
                    type: 'string',
                    description: 'Contact email',
                },
                phone_number: {
                    type: 'string',
                    description: 'Contact phone number',
                },
                avatar_url: {
                    type: 'string',
                    description: 'URL to contact avatar',
                },
                custom_attributes: {
                    type: 'object',
                    description: 'Custom attributes for the contact',
                },
            },
        },
    },
    {
        name: 'public_get_contact',
        description: 'Get contact details using the public API',
        inputSchema: {
            type: 'object',
            required: ['inbox_identifier', 'contact_identifier'],
            properties: {
                inbox_identifier: {
                    type: 'string',
                    description: 'Inbox identifier token',
                },
                contact_identifier: {
                    type: 'string',
                    description: 'Contact identifier token',
                },
            },
        },
    },
    {
        name: 'public_update_contact',
        description: 'Update contact details using the public API',
        inputSchema: {
            type: 'object',
            required: ['inbox_identifier', 'contact_identifier'],
            properties: {
                inbox_identifier: {
                    type: 'string',
                    description: 'Inbox identifier token',
                },
                contact_identifier: {
                    type: 'string',
                    description: 'Contact identifier token',
                },
                name: {
                    type: 'string',
                    description: 'New contact name',
                },
                email: {
                    type: 'string',
                    description: 'New contact email',
                },
                phone_number: {
                    type: 'string',
                    description: 'New phone number',
                },
                custom_attributes: {
                    type: 'object',
                    description: 'New custom attributes',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map