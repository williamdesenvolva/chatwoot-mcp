export const webhookTools = [
    {
        name: 'list_webhooks',
        description: 'List all webhooks in the account',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'get_webhook',
        description: 'Get details of a specific webhook including custom payload and headers',
        inputSchema: {
            type: 'object',
            required: ['webhook_id'],
            properties: {
                webhook_id: {
                    type: 'number',
                    description: 'ID of the webhook',
                },
            },
        },
    },
    {
        name: 'create_webhook',
        description: 'Create a new webhook with optional custom payload and auth headers',
        inputSchema: {
            type: 'object',
            required: ['url', 'subscriptions'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the webhook',
                },
                url: {
                    type: 'string',
                    description: 'Webhook URL endpoint',
                },
                subscriptions: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: [
                            'conversation_created',
                            'conversation_status_changed',
                            'conversation_updated',
                            'message_created',
                            'message_updated',
                            'webwidget_triggered',
                            'contact_created',
                            'contact_updated',
                            'manual_trigger',
                        ],
                    },
                    description: 'Events to subscribe to. Use "manual_trigger" for manually triggered webhooks.',
                },
                inbox_id: {
                    type: 'number',
                    description: 'Optional inbox ID to filter events',
                },
                custom_payload: {
                    type: 'object',
                    description: 'Custom key-value pairs to include in webhook payload',
                },
                headers: {
                    type: 'object',
                    description: 'Custom HTTP headers for authentication (e.g., {"Authorization": "Bearer token"})',
                },
            },
        },
    },
    {
        name: 'update_webhook',
        description: 'Update a webhook configuration',
        inputSchema: {
            type: 'object',
            required: ['webhook_id'],
            properties: {
                webhook_id: {
                    type: 'number',
                    description: 'ID of the webhook',
                },
                name: {
                    type: 'string',
                    description: 'New webhook name',
                },
                url: {
                    type: 'string',
                    description: 'New webhook URL',
                },
                subscriptions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'New subscriptions list',
                },
                inbox_id: {
                    type: 'number',
                    description: 'New inbox ID filter',
                },
                custom_payload: {
                    type: 'object',
                    description: 'Custom key-value pairs to include in webhook payload',
                },
                headers: {
                    type: 'object',
                    description: 'Custom HTTP headers for authentication',
                },
            },
        },
    },
    {
        name: 'update_webhook_payload',
        description: 'Update only the custom payload and headers of a webhook',
        inputSchema: {
            type: 'object',
            required: ['webhook_id'],
            properties: {
                webhook_id: {
                    type: 'number',
                    description: 'ID of the webhook',
                },
                custom_payload: {
                    type: 'object',
                    description: 'Custom key-value pairs to include in webhook payload',
                },
                headers: {
                    type: 'object',
                    description: 'Custom HTTP headers for authentication',
                },
            },
        },
    },
    {
        name: 'delete_webhook',
        description: 'Delete a webhook',
        inputSchema: {
            type: 'object',
            required: ['webhook_id'],
            properties: {
                webhook_id: {
                    type: 'number',
                    description: 'ID of the webhook to delete',
                },
            },
        },
    },
    {
        name: 'trigger_webhook',
        description: 'Manually trigger a webhook that has "manual_trigger" subscription. Sends account info plus custom fields and optional attachments.',
        inputSchema: {
            type: 'object',
            required: ['webhook_id'],
            properties: {
                webhook_id: {
                    type: 'number',
                    description: 'ID of the webhook to trigger',
                },
                custom_fields: {
                    type: 'object',
                    description: 'Custom key-value pairs to send in the webhook payload',
                },
                attachments: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['filename', 'content_type', 'data'],
                        properties: {
                            filename: {
                                type: 'string',
                                description: 'Name of the file',
                            },
                            content_type: {
                                type: 'string',
                                description: 'MIME type of the file (e.g., "application/pdf")',
                            },
                            data: {
                                type: 'string',
                                description: 'Base64 encoded file content',
                            },
                        },
                    },
                    description: 'Array of file attachments in base64 format',
                },
            },
        },
    },
    {
        name: 'get_webhook_payload_variables',
        description: 'Get available payload variables that can be used in webhook templates',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
];
//# sourceMappingURL=tools.js.map