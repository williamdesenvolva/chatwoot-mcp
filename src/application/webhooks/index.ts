#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { webhookTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { Webhook, WebhookPayloadVariables, WebhookTriggerResult } from '../../shared/types.js';

const server = new Server(
  {
    name: 'chatwoot-webhooks',
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
  tools: webhookTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'list_webhooks': {
        result = await client.get<Webhook[]>(
          client.accountPath('/webhooks')
        );
        break;
      }

      case 'get_webhook': {
        const webhookId = args?.webhook_id as number;
        result = await client.get<Webhook>(
          client.accountPath(`/webhooks/${webhookId}`)
        );
        break;
      }

      case 'create_webhook': {
        result = await client.post<Webhook>(
          client.accountPath('/webhooks'),
          args as Record<string, unknown>
        );
        break;
      }

      case 'update_webhook': {
        const webhookId = args?.webhook_id as number;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.webhook_id;
        result = await client.patch<Webhook>(
          client.accountPath(`/webhooks/${webhookId}`),
          { webhook: updateData }
        );
        break;
      }

      case 'update_webhook_payload': {
        const webhookId = args?.webhook_id as number;
        const customPayload = args?.custom_payload as Record<string, unknown> | undefined;
        const headers = args?.headers as Record<string, string> | undefined;
        result = await client.patch<Webhook>(
          client.accountPath(`/webhooks/${webhookId}`),
          {
            webhook: {
              custom_payload: customPayload,
              headers: headers
            }
          }
        );
        break;
      }

      case 'delete_webhook': {
        const webhookId = args?.webhook_id as number;
        await client.delete(client.accountPath(`/webhooks/${webhookId}`));
        result = { success: true, message: `Webhook ${webhookId} deleted` };
        break;
      }

      case 'trigger_webhook': {
        const webhookId = args?.webhook_id as number;
        const customFields = args?.custom_fields as Record<string, unknown> | undefined;
        const attachments = args?.attachments as Array<{
          filename: string;
          content_type: string;
          data: string;
        }> | undefined;

        result = await client.post<WebhookTriggerResult>(
          client.accountPath(`/webhooks/${webhookId}/trigger`),
          {
            custom_fields: customFields || {},
            attachments: attachments || [],
          }
        );
        break;
      }

      case 'get_webhook_payload_variables': {
        result = await client.get<WebhookPayloadVariables>(
          client.accountPath('/webhooks/payload_variables')
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
  console.error('Chatwoot Webhooks MCP Server running on stdio');
}

main().catch(console.error);
