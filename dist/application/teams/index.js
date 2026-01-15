#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { teamTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-teams',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: teamTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case 'list_teams': {
                result = await client.get(client.accountPath('/teams'));
                break;
            }
            case 'create_team': {
                result = await client.post(client.accountPath('/teams'), args);
                break;
            }
            case 'get_team': {
                const teamId = args?.team_id;
                result = await client.get(client.accountPath(`/teams/${teamId}`));
                break;
            }
            case 'update_team': {
                const teamId = args?.team_id;
                const updateData = { ...args };
                delete updateData.team_id;
                result = await client.patch(client.accountPath(`/teams/${teamId}`), updateData);
                break;
            }
            case 'delete_team': {
                const teamId = args?.team_id;
                await client.delete(client.accountPath(`/teams/${teamId}`));
                result = { success: true, message: `Team ${teamId} deleted` };
                break;
            }
            case 'list_team_members': {
                const teamId = args?.team_id;
                result = await client.get(client.accountPath(`/teams/${teamId}/team_members`));
                break;
            }
            case 'add_team_members': {
                const teamId = args?.team_id;
                result = await client.post(client.accountPath(`/teams/${teamId}/team_members`), { user_ids: args?.user_ids });
                break;
            }
            case 'remove_team_members': {
                const teamId = args?.team_id;
                result = await client.delete(client.accountPath(`/teams/${teamId}/team_members`));
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
    console.error('Chatwoot Teams MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map