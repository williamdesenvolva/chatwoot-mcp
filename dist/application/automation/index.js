#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { automationTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-automation',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: automationTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_automation_rules': {
                const params = {};
                if (args?.page)
                    params.page = args.page;
                result = await client.get(client.accountPath('/automation_rules'), params);
                break;
            }
            case 'create_automation_rule': {
                result = await client.post(client.accountPath('/automation_rules'), args);
                break;
            }
            case 'get_automation_rule': {
                const ruleId = args?.automation_rule_id;
                result = await client.get(client.accountPath(`/automation_rules/${ruleId}`));
                break;
            }
            case 'update_automation_rule': {
                const ruleId = args?.automation_rule_id;
                const updateData = { ...args };
                delete updateData.automation_rule_id;
                result = await client.patch(client.accountPath(`/automation_rules/${ruleId}`), updateData);
                break;
            }
            case 'delete_automation_rule': {
                const ruleId = args?.automation_rule_id;
                await client.delete(client.accountPath(`/automation_rules/${ruleId}`));
                result = { success: true, message: `Automation rule ${ruleId} deleted` };
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
    console.error('Chatwoot Automation MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map