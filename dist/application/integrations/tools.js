export const integrationTools = [
    {
        name: 'list_integrations',
        description: 'List all available integrations and their status',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'get_integration',
        description: 'Get details of a specific integration',
        inputSchema: {
            type: 'object',
            required: ['integration_id'],
            properties: {
                integration_id: {
                    type: 'string',
                    description: 'ID/slug of the integration (e.g., slack, dialogflow)',
                },
            },
        },
    },
    {
        name: 'create_integration_hook',
        description: 'Create an integration hook for an inbox',
        inputSchema: {
            type: 'object',
            required: ['app_id', 'inbox_id'],
            properties: {
                app_id: {
                    type: 'string',
                    description: 'ID of the integration app',
                },
                inbox_id: {
                    type: 'number',
                    description: 'ID of the inbox to connect',
                },
                settings: {
                    type: 'object',
                    description: 'Integration-specific settings',
                },
            },
        },
    },
    {
        name: 'update_integration_hook',
        description: 'Update an integration hook',
        inputSchema: {
            type: 'object',
            required: ['hook_id'],
            properties: {
                hook_id: {
                    type: 'number',
                    description: 'ID of the integration hook',
                },
                settings: {
                    type: 'object',
                    description: 'New settings for the integration',
                },
            },
        },
    },
    {
        name: 'delete_integration_hook',
        description: 'Delete an integration hook',
        inputSchema: {
            type: 'object',
            required: ['hook_id'],
            properties: {
                hook_id: {
                    type: 'number',
                    description: 'ID of the integration hook to delete',
                },
            },
        },
    },
    // Slack specific
    {
        name: 'list_slack_channels',
        description: 'List available Slack channels for integration',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    // Captain (AI assistant) specific
    {
        name: 'configure_captain',
        description: 'Configure Captain AI assistant settings',
        inputSchema: {
            type: 'object',
            properties: {
                enabled: {
                    type: 'boolean',
                    description: 'Enable or disable Captain',
                },
                inbox_ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Inbox IDs to enable Captain for',
                },
                response_language: {
                    type: 'string',
                    description: 'Language for AI responses',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map