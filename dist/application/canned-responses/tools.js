export const cannedResponseTools = [
    {
        name: 'list_canned_responses',
        description: 'List all canned responses in the account',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'create_canned_response',
        description: 'Create a new canned response',
        inputSchema: {
            type: 'object',
            required: ['short_code', 'content'],
            properties: {
                short_code: {
                    type: 'string',
                    description: 'Short code to trigger the response',
                },
                content: {
                    type: 'string',
                    description: 'Content of the canned response',
                },
            },
        },
    },
    {
        name: 'update_canned_response',
        description: 'Update a canned response',
        inputSchema: {
            type: 'object',
            required: ['canned_response_id'],
            properties: {
                canned_response_id: {
                    type: 'number',
                    description: 'ID of the canned response',
                },
                short_code: {
                    type: 'string',
                    description: 'New short code',
                },
                content: {
                    type: 'string',
                    description: 'New content',
                },
            },
        },
    },
    {
        name: 'delete_canned_response',
        description: 'Delete a canned response',
        inputSchema: {
            type: 'object',
            required: ['canned_response_id'],
            properties: {
                canned_response_id: {
                    type: 'number',
                    description: 'ID of the canned response to delete',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map