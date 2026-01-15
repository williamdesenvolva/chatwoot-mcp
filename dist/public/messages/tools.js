export const publicMessageTools = [
    {
        name: 'public_list_messages',
        description: 'List messages in a conversation using the public API',
        inputSchema: {
            type: 'object',
            required: ['inbox_identifier', 'contact_identifier', 'conversation_id'],
            properties: {
                inbox_identifier: {
                    type: 'string',
                    description: 'Inbox identifier token',
                },
                contact_identifier: {
                    type: 'string',
                    description: 'Contact identifier token',
                },
                conversation_id: {
                    type: 'number',
                    description: 'Conversation ID',
                },
                before: {
                    type: 'number',
                    description: 'Message ID to load messages before (for pagination)',
                },
            },
        },
    },
    {
        name: 'public_create_message',
        description: 'Send a message in a conversation using the public API',
        inputSchema: {
            type: 'object',
            required: ['inbox_identifier', 'contact_identifier', 'conversation_id', 'content'],
            properties: {
                inbox_identifier: {
                    type: 'string',
                    description: 'Inbox identifier token',
                },
                contact_identifier: {
                    type: 'string',
                    description: 'Contact identifier token',
                },
                conversation_id: {
                    type: 'number',
                    description: 'Conversation ID',
                },
                content: {
                    type: 'string',
                    description: 'Message content',
                },
                echo_id: {
                    type: 'string',
                    description: 'Client-side ID for deduplication',
                },
            },
        },
    },
    {
        name: 'public_update_message',
        description: 'Update a message in a conversation using the public API',
        inputSchema: {
            type: 'object',
            required: ['inbox_identifier', 'contact_identifier', 'conversation_id', 'message_id'],
            properties: {
                inbox_identifier: {
                    type: 'string',
                    description: 'Inbox identifier token',
                },
                contact_identifier: {
                    type: 'string',
                    description: 'Contact identifier token',
                },
                conversation_id: {
                    type: 'number',
                    description: 'Conversation ID',
                },
                message_id: {
                    type: 'number',
                    description: 'Message ID',
                },
                submitted_values: {
                    type: 'object',
                    description: 'Submitted values for interactive messages',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map