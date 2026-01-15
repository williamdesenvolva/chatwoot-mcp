#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { platformUserTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-platform-users',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: platformUserTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'platform_list_users': {
                const params = {};
                if (args?.page)
                    params.page = args.page;
                result = await client.get(client.platformPath('/users'), params);
                break;
            }
            case 'platform_create_user': {
                result = await client.post(client.platformPath('/users'), args);
                break;
            }
            case 'platform_get_user': {
                const userId = args?.user_id;
                result = await client.get(client.platformPath(`/users/${userId}`));
                break;
            }
            case 'platform_update_user': {
                const userId = args?.user_id;
                const updateData = { ...args };
                delete updateData.user_id;
                result = await client.patch(client.platformPath(`/users/${userId}`), updateData);
                break;
            }
            case 'platform_delete_user': {
                const userId = args?.user_id;
                await client.delete(client.platformPath(`/users/${userId}`));
                result = { success: true, message: `User ${userId} deleted` };
                break;
            }
            case 'platform_get_user_sso_link': {
                const userId = args?.user_id;
                result = await client.get(client.platformPath(`/users/${userId}/login`));
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
    console.error('Chatwoot Platform Users MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map