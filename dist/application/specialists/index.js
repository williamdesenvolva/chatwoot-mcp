#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { specialistTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-specialists',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: specialistTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_specialists': {
                const params = {};
                if (args?.page)
                    params.page = args.page;
                result = await client.get(client.accountPath('/specialists'), params);
                break;
            }
            case 'create_specialist': {
                result = await client.post(client.accountPath('/specialists'), args);
                break;
            }
            case 'get_specialist': {
                const specialistId = args?.specialist_id;
                result = await client.get(client.accountPath(`/specialists/${specialistId}`));
                break;
            }
            case 'update_specialist': {
                const specialistId = args?.specialist_id;
                const updateData = { ...args };
                delete updateData.specialist_id;
                result = await client.patch(client.accountPath(`/specialists/${specialistId}`), updateData);
                break;
            }
            case 'delete_specialist': {
                const specialistId = args?.specialist_id;
                await client.delete(client.accountPath(`/specialists/${specialistId}`));
                result = { success: true, message: `Specialist ${specialistId} deleted` };
                break;
            }
            case 'get_specialist_availabilities': {
                const specialistId = args?.specialist_id;
                result = await client.get(client.accountPath(`/specialists/${specialistId}/availabilities`));
                break;
            }
            case 'update_specialist_availabilities': {
                const specialistId = args?.specialist_id;
                const availabilities = args?.availabilities;
                result = await client.put(client.accountPath(`/specialists/${specialistId}/availabilities`), { availabilities });
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
    console.error('Chatwoot Specialists MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map