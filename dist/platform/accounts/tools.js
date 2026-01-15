export const platformAccountTools = [
    {
        name: 'platform_list_accounts',
        description: 'List all accounts (Platform Admin API)',
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
        name: 'platform_create_account',
        description: 'Create a new account (Platform Admin API)',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Account name',
                },
                locale: {
                    type: 'string',
                    description: 'Account locale (e.g., en, pt-BR)',
                },
            },
        },
    },
    {
        name: 'platform_get_account',
        description: 'Get account details (Platform Admin API)',
        inputSchema: {
            type: 'object',
            required: ['account_id'],
            properties: {
                account_id: {
                    type: 'number',
                    description: 'Account ID',
                },
            },
        },
    },
    {
        name: 'platform_update_account',
        description: 'Update an account (Platform Admin API)',
        inputSchema: {
            type: 'object',
            required: ['account_id'],
            properties: {
                account_id: {
                    type: 'number',
                    description: 'Account ID',
                },
                name: {
                    type: 'string',
                    description: 'New account name',
                },
                locale: {
                    type: 'string',
                    description: 'New account locale',
                },
                status: {
                    type: 'string',
                    enum: ['active', 'suspended'],
                    description: 'Account status',
                },
            },
        },
    },
    {
        name: 'platform_delete_account',
        description: 'Delete an account (Platform Admin API)',
        inputSchema: {
            type: 'object',
            required: ['account_id'],
            properties: {
                account_id: {
                    type: 'number',
                    description: 'Account ID to delete',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map