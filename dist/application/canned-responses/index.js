#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { cannedResponseTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-canned-responses',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: cannedResponseTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_canned_responses': {
                result = await client.get(client.accountPath('/canned_responses'));
                break;
            }
            case 'create_canned_response': {
                result = await client.post(client.accountPath('/canned_responses'), args);
                break;
            }
            case 'update_canned_response': {
                const cannedResponseId = args?.canned_response_id;
                const updateData = { ...args };
                delete updateData.canned_response_id;
                result = await client.patch(client.accountPath(`/canned_responses/${cannedResponseId}`), updateData);
                break;
            }
            case 'delete_canned_response': {
                const cannedResponseId = args?.canned_response_id;
                await client.delete(client.accountPath(`/canned_responses/${cannedResponseId}`));
                result = { success: true, message: `Canned response ${cannedResponseId} deleted` };
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
    console.error('Chatwoot Canned Responses MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map