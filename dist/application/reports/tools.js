export const reportTools = [
    {
        name: 'get_account_summary',
        description: 'Get account summary report with key metrics',
        inputSchema: {
            type: 'object',
            properties: {
                since: {
                    type: 'string',
                    description: 'Start date (ISO 8601 format or Unix timestamp)',
                },
                until: {
                    type: 'string',
                    description: 'End date (ISO 8601 format or Unix timestamp)',
                },
            },
        },
    },
    {
        name: 'get_conversations_report',
        description: 'Get conversations metrics over time',
        inputSchema: {
            type: 'object',
            required: ['metric', 'type'],
            properties: {
                metric: {
                    type: 'string',
                    enum: ['conversations_count', 'incoming_messages_count', 'outgoing_messages_count', 'avg_first_response_time', 'avg_resolution_time', 'resolutions_count'],
                    description: 'Metric to retrieve',
                },
                type: {
                    type: 'string',
                    enum: ['account', 'agent', 'inbox', 'label', 'team'],
                    description: 'Group by type',
                },
                id: {
                    type: 'string',
                    description: 'ID for agent/inbox/label/team filtering',
                },
                since: {
                    type: 'string',
                    description: 'Start date (ISO 8601 format or Unix timestamp)',
                },
                until: {
                    type: 'string',
                    description: 'End date (ISO 8601 format or Unix timestamp)',
                },
                timezone_offset: {
                    type: 'number',
                    description: 'Timezone offset in hours',
                },
            },
        },
    },
    {
        name: 'get_agent_report',
        description: 'Get detailed report for a specific agent',
        inputSchema: {
            type: 'object',
            required: ['agent_id'],
            properties: {
                agent_id: {
                    type: 'number',
                    description: 'ID of the agent',
                },
                since: {
                    type: 'string',
                    description: 'Start date (ISO 8601 format or Unix timestamp)',
                },
                until: {
                    type: 'string',
                    description: 'End date (ISO 8601 format or Unix timestamp)',
                },
            },
        },
    },
    {
        name: 'get_inbox_report',
        description: 'Get detailed report for a specific inbox',
        inputSchema: {
            type: 'object',
            required: ['inbox_id'],
            properties: {
                inbox_id: {
                    type: 'number',
                    description: 'ID of the inbox',
                },
                since: {
                    type: 'string',
                    description: 'Start date (ISO 8601 format or Unix timestamp)',
                },
                until: {
                    type: 'string',
                    description: 'End date (ISO 8601 format or Unix timestamp)',
                },
            },
        },
    },
    {
        name: 'get_team_report',
        description: 'Get detailed report for a specific team',
        inputSchema: {
            type: 'object',
            required: ['team_id'],
            properties: {
                team_id: {
                    type: 'number',
                    description: 'ID of the team',
                },
                since: {
                    type: 'string',
                    description: 'Start date (ISO 8601 format or Unix timestamp)',
                },
                until: {
                    type: 'string',
                    description: 'End date (ISO 8601 format or Unix timestamp)',
                },
            },
        },
    },
    {
        name: 'get_label_report',
        description: 'Get detailed report for a specific label',
        inputSchema: {
            type: 'object',
            required: ['label'],
            properties: {
                label: {
                    type: 'string',
                    description: 'Label name',
                },
                since: {
                    type: 'string',
                    description: 'Start date (ISO 8601 format or Unix timestamp)',
                },
                until: {
                    type: 'string',
                    description: 'End date (ISO 8601 format or Unix timestamp)',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map