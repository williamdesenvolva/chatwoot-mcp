export const platformAgentBotTools = [
    {
        name: 'platform_list_agentbots',
        description: 'List all platform-level agent bots (Platform Admin API)',
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
        name: 'platform_create_agentbot',
        description: 'Create a new platform-level agent bot (Platform Admin API)',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Agent bot name',
                },
                description: {
                    type: 'string',
                    description: 'Agent bot description',
                },
                outgoing_url: {
                    type: 'string',
                    description: 'Webhook URL for the agent bot',
                },
            },
        },
    },
    {
        name: 'platform_get_agentbot',
        description: 'Get agent bot details (Platform Admin API)',
        inputSchema: {
            type: 'object',
            required: ['agentbot_id'],
            properties: {
                agentbot_id: {
                    type: 'number',
                    description: 'Agent bot ID',
                },
            },
        },
    },
    {
        name: 'platform_update_agentbot',
        description: 'Update a platform-level agent bot (Platform Admin API)',
        inputSchema: {
            type: 'object',
            required: ['agentbot_id'],
            properties: {
                agentbot_id: {
                    type: 'number',
                    description: 'Agent bot ID',
                },
                name: {
                    type: 'string',
                    description: 'New name',
                },
                description: {
                    type: 'string',
                    description: 'New description',
                },
                outgoing_url: {
                    type: 'string',
                    description: 'New webhook URL',
                },
            },
        },
    },
    {
        name: 'platform_delete_agentbot',
        description: 'Delete a platform-level agent bot (Platform Admin API)',
        inputSchema: {
            type: 'object',
            required: ['agentbot_id'],
            properties: {
                agentbot_id: {
                    type: 'number',
                    description: 'Agent bot ID to delete',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map