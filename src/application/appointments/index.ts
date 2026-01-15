#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { appointmentTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { Appointment, AvailableSlot } from '../../shared/types.js';

const server = new Server(
  {
    name: 'chatwoot-appointments',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const client = new ChatwootClient();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: appointmentTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'list_appointments': {
        const params: Record<string, unknown> = {};
        if (args?.page) params.page = args.page;
        if (args?.status) params.status = args.status;
        if (args?.specialist_id) params.specialist_id = args.specialist_id;
        if (args?.start_date) params.start_date = args.start_date;
        if (args?.end_date) params.end_date = args.end_date;
        result = await client.get<Appointment[]>(
          client.accountPath('/appointments'),
          params
        );
        break;
      }

      case 'create_appointment': {
        result = await client.post<Appointment>(
          client.accountPath('/appointments'),
          args as Record<string, unknown>
        );
        break;
      }

      case 'get_appointment': {
        const appointmentId = args?.appointment_id as number;
        result = await client.get<Appointment>(
          client.accountPath(`/appointments/${appointmentId}`)
        );
        break;
      }

      case 'update_appointment': {
        const appointmentId = args?.appointment_id as number;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.appointment_id;
        result = await client.patch<Appointment>(
          client.accountPath(`/appointments/${appointmentId}`),
          updateData
        );
        break;
      }

      case 'delete_appointment': {
        const appointmentId = args?.appointment_id as number;
        await client.delete(client.accountPath(`/appointments/${appointmentId}`));
        result = { success: true, message: `Appointment ${appointmentId} deleted` };
        break;
      }

      case 'get_available_slots': {
        const specialistId = args?.specialist_id as number;
        const params: Record<string, unknown> = {
          date: args?.date,
        };
        if (args?.duration) params.duration = args.duration;
        result = await client.get<AvailableSlot[]>(
          client.accountPath(`/specialists/${specialistId}/available_slots`),
          params
        );
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
  } catch (error) {
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
  console.error('Chatwoot Appointments MCP Server running on stdio');
}

main().catch(console.error);
