export const customFilterTools = [
    {
        name: 'list_custom_filters',
        description: 'List all custom filters',
        inputSchema: {
            type: 'object',
            required: ['filter_type'],
            properties: {
                filter_type: {
                    type: 'string',
                    enum: ['conversation', 'contact', 'report'],
                    description: 'Type of filter',
                },
            },
        },
    },
    {
        name: 'create_custom_filter',
        description: 'Create a new custom filter',
        inputSchema: {
            type: 'object',
            required: ['name', 'filter_type', 'query'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the filter',
                },
                filter_type: {
                    type: 'string',
                    enum: ['conversation', 'contact', 'report'],
                    description: 'Type of filter',
                },
                query: {
                    type: 'object',
                    description: 'Filter query definition',
                },
            },
        },
    },
    {
        name: 'get_custom_filter',
        description: 'Get details of a custom filter',
        inputSchema: {
            type: 'object',
            required: ['custom_filter_id'],
            properties: {
                custom_filter_id: {
                    type: 'number',
                    description: 'ID of the custom filter',
                },
            },
        },
    },
    {
        name: 'update_custom_filter',
        description: 'Update a custom filter',
        inputSchema: {
            type: 'object',
            required: ['custom_filter_id'],
            properties: {
                custom_filter_id: {
                    type: 'number',
                    description: 'ID of the custom filter',
                },
                name: {
                    type: 'string',
                    description: 'New name for the filter',
                },
                query: {
                    type: 'object',
                    description: 'New filter query definition',
                },
            },
        },
    },
    {
        name: 'delete_custom_filter',
        description: 'Delete a custom filter',
        inputSchema: {
            type: 'object',
            required: ['custom_filter_id'],
            properties: {
                custom_filter_id: {
                    type: 'number',
                    description: 'ID of the custom filter to delete',
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map