#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { inboxTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-inboxes',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: inboxTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_inboxes': {
                result = await client.get(client.accountPath('/inboxes'));
                break;
            }
            case 'create_inbox': {
                result = await client.post(client.accountPath('/inboxes'), args);
                break;
            }
            case 'get_inbox': {
                const inboxId = args?.inbox_id;
                result = await client.get(client.accountPath(`/inboxes/${inboxId}`));
                break;
            }
            case 'update_inbox': {
                const inboxId = args?.inbox_id;
                const updateData = { ...args };
                delete updateData.inbox_id;
                result = await client.patch(client.accountPath(`/inboxes/${inboxId}`), updateData);
                break;
            }
            case 'delete_inbox': {
                const inboxId = args?.inbox_id;
                await client.delete(client.accountPath(`/inboxes/${inboxId}`));
                result = { success: true, message: `Inbox ${inboxId} deleted` };
                break;
            }
            case 'list_inbox_members': {
                const inboxId = args?.inbox_id;
                result = await client.get(client.accountPath(`/inboxes/${inboxId}/members`));
                break;
            }
            case 'add_inbox_member': {
                const inboxId = args?.inbox_id;
                result = await client.post(client.accountPath(`/inboxes/${inboxId}/members`), { user_ids: args?.user_ids });
                break;
            }
            case 'remove_inbox_member': {
                const inboxId = args?.inbox_id;
                result = await client.patch(client.accountPath(`/inboxes/${inboxId}/members`), { user_ids: args?.user_ids });
                break;
            }
            case 'get_inbox_agentbot': {
                const inboxId = args?.inbox_id;
                result = await client.get(client.accountPath(`/inboxes/${inboxId}/agent_bot`));
                break;
            }
            case 'set_inbox_agentbot': {
                const inboxId = args?.inbox_id;
                result = await client.post(client.accountPath(`/inboxes/${inboxId}/set_agent_bot`), { agent_bot: args?.agent_bot_id });
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
    console.error('Chatwoot Inboxes MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map