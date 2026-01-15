#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { contactTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-contacts',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: contactTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_contacts': {
                const params = {};
                if (args?.page)
                    params.page = args.page;
                if (args?.sort)
                    params.sort = args.sort;
                result = await client.get(client.accountPath('/contacts'), params);
                break;
            }
            case 'create_contact': {
                result = await client.post(client.accountPath('/contacts'), args);
                break;
            }
            case 'get_contact': {
                const contactId = args?.contact_id;
                result = await client.get(client.accountPath(`/contacts/${contactId}`));
                break;
            }
            case 'update_contact': {
                const contactId = args?.contact_id;
                const updateData = { ...args };
                delete updateData.contact_id;
                result = await client.put(client.accountPath(`/contacts/${contactId}`), updateData);
                break;
            }
            case 'delete_contact': {
                const contactId = args?.contact_id;
                await client.delete(client.accountPath(`/contacts/${contactId}`));
                result = { success: true, message: `Contact ${contactId} deleted` };
                break;
            }
            case 'search_contacts': {
                const params = {
                    q: args?.query,
                };
                if (args?.page)
                    params.page = args.page;
                result = await client.get(client.accountPath('/contacts/search'), params);
                break;
            }
            case 'filter_contacts': {
                const params = {};
                if (args?.page)
                    params.page = args.page;
                result = await client.post(client.accountPath('/contacts/filter'), { payload: args?.payload });
                break;
            }
            case 'get_contact_conversations': {
                const contactId = args?.contact_id;
                result = await client.get(client.accountPath(`/contacts/${contactId}/conversations`));
                break;
            }
            case 'merge_contacts': {
                result = await client.post(client.accountPath('/actions/contact_merge'), {
                    base_contact_id: args?.base_contact_id,
                    mergee_contact_id: args?.mergee_contact_id,
                });
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
    console.error('Chatwoot Contacts MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map