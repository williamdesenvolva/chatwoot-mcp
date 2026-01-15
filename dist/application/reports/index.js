#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { reportTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-reports',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: reportTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'get_account_summary': {
                const params = {};
                if (args?.since)
                    params.since = args.since;
                if (args?.until)
                    params.until = args.until;
                result = await client.get(client.accountPath('/reports/summary'), params);
                break;
            }
            case 'get_conversations_report': {
                const params = {
                    metric: args?.metric,
                    type: args?.type,
                };
                if (args?.id)
                    params.id = args.id;
                if (args?.since)
                    params.since = args.since;
                if (args?.until)
                    params.until = args.until;
                if (args?.timezone_offset)
                    params.timezone_offset = args.timezone_offset;
                result = await client.get(client.accountPath('/reports'), params);
                break;
            }
            case 'get_agent_report': {
                const agentId = args?.agent_id;
                const params = {};
                if (args?.since)
                    params.since = args.since;
                if (args?.until)
                    params.until = args.until;
                result = await client.get(client.accountPath(`/reports/agents/${agentId}`), params);
                break;
            }
            case 'get_inbox_report': {
                const inboxId = args?.inbox_id;
                const params = {};
                if (args?.since)
                    params.since = args.since;
                if (args?.until)
                    params.until = args.until;
                result = await client.get(client.accountPath(`/reports/inboxes/${inboxId}`), params);
                break;
            }
            case 'get_team_report': {
                const teamId = args?.team_id;
                const params = {};
                if (args?.since)
                    params.since = args.since;
                if (args?.until)
                    params.until = args.until;
                result = await client.get(client.accountPath(`/reports/teams/${teamId}`), params);
                break;
            }
            case 'get_label_report': {
                const params = {
                    label: args?.label,
                };
                if (args?.since)
                    params.since = args.since;
                if (args?.until)
                    params.until = args.until;
                result = await client.get(client.accountPath('/reports/labels'), params);
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
    console.error('Chatwoot Reports MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map