#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { accountAgentBotTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-account-agentbots',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: accountAgentBotTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_account_agentbots': {
                result = await client.get(client.accountPath('/agent_bots'));
                break;
            }
            case 'create_account_agentbot': {
                result = await client.post(client.accountPath('/agent_bots'), args);
                break;
            }
            case 'get_account_agentbot': {
                const botId = args?.agentbot_id;
                result = await client.get(client.accountPath(`/agent_bots/${botId}`));
                break;
            }
            case 'update_account_agentbot': {
                const botId = args?.agentbot_id;
                const updateData = { ...args };
                delete updateData.agentbot_id;
                result = await client.patch(client.accountPath(`/agent_bots/${botId}`), updateData);
                break;
            }
            case 'delete_account_agentbot': {
                const botId = args?.agentbot_id;
                await client.delete(client.accountPath(`/agent_bots/${botId}`));
                result = { success: true, message: `Agent bot ${botId} deleted` };
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
    console.error('Chatwoot Account AgentBots MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map