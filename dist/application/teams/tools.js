export const teamTools = [
    {
        name: 'list_teams',
        description: 'List all teams in the account',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'create_team',
        description: 'Create a new team',
        inputSchema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the team',
                },
                description: {
                    type: 'string',
                    description: 'Description of the team',
                },
                allow_auto_assign: {
                    type: 'boolean',
                    description: 'Allow automatic assignment to this team',
                },
            },
        },
    },
    {
        name: 'get_team',
        description: 'Get details of a specific team',
        inputSchema: {
            type: 'object',
            required: ['team_id'],
            properties: {
                team_id: {
                    type: 'number',
                    description: 'ID of the team',
                },
            },
        },
    },
    {
        name: 'update_team',
        description: 'Update a team',
        inputSchema: {
            type: 'object',
            required: ['team_id'],
            properties: {
                team_id: {
                    type: 'number',
                    description: 'ID of the team',
                },
                name: {
                    type: 'string',
                    description: 'New name for the team',
                },
                description: {
                    type: 'string',
                    description: 'New description for the team',
                },
                allow_auto_assign: {
                    type: 'boolean',
                    description: 'Allow automatic assignment',
                },
            },
        },
    },
    {
        name: 'delete_team',
        description: 'Delete a team',
        inputSchema: {
            type: 'object',
            required: ['team_id'],
            properties: {
                team_id: {
                    type: 'number',
                    description: 'ID of the team to delete',
                },
            },
        },
    },
    {
        name: 'list_team_members',
        description: 'List all members of a team',
        inputSchema: {
            type: 'object',
            required: ['team_id'],
            properties: {
                team_id: {
                    type: 'number',
                    description: 'ID of the team',
                },
            },
        },
    },
    {
        name: 'add_team_members',
        description: 'Add members to a team',
        inputSchema: {
            type: 'object',
            required: ['team_id', 'user_ids'],
            properties: {
                team_id: {
                    type: 'number',
                    description: 'ID of the team',
                },
                user_ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Array of user IDs to add',
                },
            },
        },
    },
    {
        name: 'remove_team_members',
        description: 'Remove members from a team',
        inputSchema: {
            type: 'object',
            required: ['team_id', 'user_ids'],
            properties: {
                team_id: {
                    type: 'number',
                    description: 'ID of the team',
                },
                user_ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Array of user IDs to remove',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map