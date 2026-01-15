export const agentTools = [
    {
        name: 'list_agents',
        description: 'List all agents in the account',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'create_agent',
        description: 'Create a new agent in the account',
        inputSchema: {
            type: 'object',
            required: ['name', 'email', 'role'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the agent',
                },
                email: {
                    type: 'string',
                    description: 'Email of the agent',
                },
                role: {
                    type: 'string',
                    enum: ['agent', 'administrator'],
                    description: 'Role of the agent',
                },
                availability_status: {
                    type: 'string',
                    enum: ['available', 'busy', 'offline'],
                    description: 'Availability status',
                },
                auto_offline: {
                    type: 'boolean',
                    description: 'Whether to auto-offline after inactivity',
                },
            },
        },
    },
    {
        name: 'update_agent',
        description: 'Update an existing agent',
        inputSchema: {
            type: 'object',
            required: ['agent_id'],
            properties: {
                agent_id: {
                    type: 'number',
                    description: 'ID of the agent to update',
                },
                name: {
                    type: 'string',
                    description: 'New name for the agent',
                },
                role: {
                    type: 'string',
                    enum: ['agent', 'administrator'],
                    description: 'New role for the agent',
                },
                availability_status: {
                    type: 'string',
                    enum: ['available', 'busy', 'offline'],
                    description: 'Availability status',
                },
                auto_offline: {
                    type: 'boolean',
                    description: 'Whether to auto-offline after inactivity',
                },
            },
        },
    },
    {
        name: 'delete_agent',
        description: 'Remove an agent from the account',
        inputSchema: {
            type: 'object',
            required: ['agent_id'],
            properties: {
                agent_id: {
                    type: 'number',
                    description: 'ID of the agent to delete',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map