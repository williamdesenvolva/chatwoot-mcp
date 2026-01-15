#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { platformAccountTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-platform-accounts',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: platformAccountTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'platform_list_accounts': {
                const params = {};
                if (args?.page)
                    params.page = args.page;
                result = await client.get(client.platformPath('/accounts'), params);
                break;
            }
            case 'platform_create_account': {
                result = await client.post(client.platformPath('/accounts'), args);
                break;
            }
            case 'platform_get_account': {
                const accountId = args?.account_id;
                result = await client.get(client.platformPath(`/accounts/${accountId}`));
                break;
            }
            case 'platform_update_account': {
                const accountId = args?.account_id;
                const updateData = { ...args };
                delete updateData.account_id;
                result = await client.patch(client.platformPath(`/accounts/${accountId}`), updateData);
                break;
            }
            case 'platform_delete_account': {
                const accountId = args?.account_id;
                await client.delete(client.platformPath(`/accounts/${accountId}`));
                result = { success: true, message: `Account ${accountId} deleted` };
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
    console.error('Chatwoot Platform Accounts MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map