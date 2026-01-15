#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { integrationTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-integrations',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: integrationTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_integrations': {
                result = await client.get(client.accountPath('/integrations/apps'));
                break;
            }
            case 'get_integration': {
                const integrationId = args?.integration_id;
                result = await client.get(client.accountPath(`/integrations/apps/${integrationId}`));
                break;
            }
            case 'create_integration_hook': {
                result = await client.post(client.accountPath('/integrations/hooks'), args);
                break;
            }
            case 'update_integration_hook': {
                const hookId = args?.hook_id;
                const updateData = { ...args };
                delete updateData.hook_id;
                result = await client.patch(client.accountPath(`/integrations/hooks/${hookId}`), updateData);
                break;
            }
            case 'delete_integration_hook': {
                const hookId = args?.hook_id;
                await client.delete(client.accountPath(`/integrations/hooks/${hookId}`));
                result = { success: true, message: `Integration hook ${hookId} deleted` };
                break;
            }
            case 'list_slack_channels': {
                result = await client.get(client.accountPath('/integrations/slack/channels'));
                break;
            }
            case 'configure_captain': {
                result = await client.post(client.accountPath('/integrations/captain'), args);
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
    console.error('Chatwoot Integrations MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map