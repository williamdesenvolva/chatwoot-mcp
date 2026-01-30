#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { waitlistTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
const server = new Server({
    name: 'chatwoot-waitlist',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const client = new ChatwootClient();
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: waitlistTools,
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            // === WAITLIST ENTRIES ===
            case 'list_waitlist_entries': {
                const params = {};
                if (args?.specialist_id)
                    params.specialist_id = args.specialist_id;
                if (args?.contact_id)
                    params.contact_id = args.contact_id;
                if (args?.status)
                    params.status = args.status;
                if (args?.page)
                    params.page = args.page;
                result = await client.get(client.accountPath('/appointment_waitlist_entries'), params);
                break;
            }
            case 'create_waitlist_entry': {
                const entryData = {
                    specialist_id: args?.specialist_id,
                    contact_id: args?.contact_id,
                };
                if (args?.preferred_date)
                    entryData.preferred_date = args.preferred_date;
                if (args?.preferred_time_start)
                    entryData.preferred_time_start = args.preferred_time_start;
                if (args?.preferred_time_end)
                    entryData.preferred_time_end = args.preferred_time_end;
                if (args?.notes)
                    entryData.notes = args.notes;
                if (args?.priority !== undefined)
                    entryData.priority = args.priority;
                result = await client.post(client.accountPath('/appointment_waitlist_entries'), { appointment_waitlist_entry: entryData });
                break;
            }
            case 'get_waitlist_entry': {
                const entryId = args?.waitlist_entry_id;
                result = await client.get(client.accountPath(`/appointment_waitlist_entries/${entryId}`));
                break;
            }
            case 'update_waitlist_entry': {
                const entryId = args?.waitlist_entry_id;
                const updateData = {};
                if (args?.preferred_date)
                    updateData.preferred_date = args.preferred_date;
                if (args?.preferred_time_start)
                    updateData.preferred_time_start = args.preferred_time_start;
                if (args?.preferred_time_end)
                    updateData.preferred_time_end = args.preferred_time_end;
                if (args?.notes !== undefined)
                    updateData.notes = args.notes;
                if (args?.priority !== undefined)
                    updateData.priority = args.priority;
                result = await client.patch(client.accountPath(`/appointment_waitlist_entries/${entryId}`), { appointment_waitlist_entry: updateData });
                break;
            }
            case 'delete_waitlist_entry': {
                const entryId = args?.waitlist_entry_id;
                await client.delete(client.accountPath(`/appointment_waitlist_entries/${entryId}`));
                result = { success: true, message: `Waitlist entry ${entryId} deleted` };
                break;
            }
            case 'accept_waitlist_slot': {
                const entryId = args?.waitlist_entry_id;
                const acceptData = {};
                if (args?.slot_start_time)
                    acceptData.slot_start_time = args.slot_start_time;
                if (args?.slot_end_time)
                    acceptData.slot_end_time = args.slot_end_time;
                result = await client.post(client.accountPath(`/appointment_waitlist_entries/${entryId}/accept`), acceptData);
                break;
            }
            case 'decline_waitlist_slot': {
                const entryId = args?.waitlist_entry_id;
                const declineData = {};
                if (args?.reason)
                    declineData.reason = args.reason;
                result = await client.post(client.accountPath(`/appointment_waitlist_entries/${entryId}/decline`), declineData);
                break;
            }
            // === WAITLIST NOTIFICATION SETTINGS ===
            case 'get_waitlist_notification_setting': {
                const specialistId = args?.specialist_id;
                result = await client.get(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`));
                break;
            }
            case 'create_waitlist_notification_setting': {
                const specialistId = args?.specialist_id;
                const settingData = {};
                if (args?.enabled !== undefined)
                    settingData.enabled = args.enabled;
                if (args?.notification_template)
                    settingData.notification_template = args.notification_template;
                if (args?.response_timeout_hours !== undefined)
                    settingData.response_timeout_hours = args.response_timeout_hours;
                if (args?.max_notifications_per_slot !== undefined)
                    settingData.max_notifications_per_slot = args.max_notifications_per_slot;
                if (args?.auto_expire_hours !== undefined)
                    settingData.auto_expire_hours = args.auto_expire_hours;
                result = await client.post(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`), { waitlist_notification_setting: settingData });
                break;
            }
            case 'update_waitlist_notification_setting': {
                const specialistId = args?.specialist_id;
                const settingData = {};
                if (args?.enabled !== undefined)
                    settingData.enabled = args.enabled;
                if (args?.notification_template !== undefined)
                    settingData.notification_template = args.notification_template;
                if (args?.response_timeout_hours !== undefined)
                    settingData.response_timeout_hours = args.response_timeout_hours;
                if (args?.max_notifications_per_slot !== undefined)
                    settingData.max_notifications_per_slot = args.max_notifications_per_slot;
                if (args?.auto_expire_hours !== undefined)
                    settingData.auto_expire_hours = args.auto_expire_hours;
                result = await client.patch(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`), { waitlist_notification_setting: settingData });
                break;
            }
            case 'delete_waitlist_notification_setting': {
                const specialistId = args?.specialist_id;
                await client.delete(client.accountPath(`/specialists/${specialistId}/waitlist_notification_setting`));
                result = { success: true, message: `Waitlist notification setting for specialist ${specialistId} deleted` };
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
    console.error('Chatwoot Waitlist MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map