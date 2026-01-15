#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { customAttributeTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-custom-attributes',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: customAttributeTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_custom_attributes': {
                const params = {
                    attribute_model: args?.attribute_model,
                };
                result = await client.get(client.accountPath('/custom_attribute_definitions'), params);
                break;
            }
            case 'create_custom_attribute': {
                result = await client.post(client.accountPath('/custom_attribute_definitions'), args);
                break;
            }
            case 'get_custom_attribute': {
                const customAttributeId = args?.custom_attribute_id;
                result = await client.get(client.accountPath(`/custom_attribute_definitions/${customAttributeId}`));
                break;
            }
            case 'update_custom_attribute': {
                const customAttributeId = args?.custom_attribute_id;
                const updateData = { ...args };
                delete updateData.custom_attribute_id;
                result = await client.patch(client.accountPath(`/custom_attribute_definitions/${customAttributeId}`), updateData);
                break;
            }
            case 'delete_custom_attribute': {
                const customAttributeId = args?.custom_attribute_id;
                await client.delete(client.accountPath(`/custom_attribute_definitions/${customAttributeId}`));
                result = { success: true, message: `Custom attribute ${customAttributeId} deleted` };
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
    console.error('Chatwoot Custom Attributes MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map