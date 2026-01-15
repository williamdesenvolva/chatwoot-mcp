#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { messageTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-messages',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: messageTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_messages': {
                const conversationId = args?.conversation_id;
                const params = {};
                if (args?.before)
                    params.before = args.before;
                if (args?.after)
                    params.after = args.after;
                result = await client.get(client.accountPath(`/conversations/${conversationId}/messages`), params);
                break;
            }
            case 'create_message': {
                const conversationId = args?.conversation_id;
                const messageData = { ...args };
                delete messageData.conversation_id;
                result = await client.post(client.accountPath(`/conversations/${conversationId}/messages`), messageData);
                break;
            }
            case 'delete_message': {
                const conversationId = args?.conversation_id;
                const messageId = args?.message_id;
                await client.delete(client.accountPath(`/conversations/${conversationId}/messages/${messageId}`));
                result = { success: true, message: `Message ${messageId} deleted` };
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
    console.error('Chatwoot Messages MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map