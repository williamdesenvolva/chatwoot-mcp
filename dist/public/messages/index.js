#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { publicMessageTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-public-messages',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: publicMessageTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        const inboxId = args?.inbox_identifier;
        const contactId = args?.contact_identifier;
        const conversationId = args?.conversation_id;
        switch (name) {
            case 'public_list_messages': {
                const params = {};
                if (args?.before)
                    params.before = args.before;
                result = await client.get(client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}/conversations/${conversationId}/messages`), params);
                break;
            }
            case 'public_create_message': {
                const messageData = {
                    content: args?.content,
                };
                if (args?.echo_id)
                    messageData.echo_id = args.echo_id;
                result = await client.post(client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}/conversations/${conversationId}/messages`), messageData);
                break;
            }
            case 'public_update_message': {
                const messageId = args?.message_id;
                const updateData = {};
                if (args?.submitted_values)
                    updateData.submitted_values = args.submitted_values;
                result = await client.patch(client.publicPath(`/inboxes/${inboxId}/contacts/${contactId}/conversations/${conversationId}/messages/${messageId}`), updateData);
                break;
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Chatwoot Public Messages MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map