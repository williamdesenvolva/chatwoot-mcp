#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { profileTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-profile',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: profileTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'get_profile': {
                result = await client.get('/api/v1/profile');
                break;
            }
            case 'update_profile': {
                result = await client.patch('/api/v1/profile', args);
                break;
            }
            case 'update_availability': {
                result = await client.post('/api/v1/profile/availability', { availability: args?.availability });
                break;
            }
            case 'update_avatar': {
                result = await client.post('/api/v1/profile/avatar', { avatar_url: args?.avatar_url });
                break;
            }
            case 'delete_avatar': {
                await client.delete('/api/v1/profile/avatar');
                result = { success: true, message: 'Avatar deleted' };
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
    console.error('Chatwoot Profile MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map