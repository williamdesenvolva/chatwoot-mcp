#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { helpCenterTools } from './tools.js';
import { ChatwootClient } from '../../shared/api-client.js';
import { Portal } from '../../shared/types.js';

interface Category {
  id: number;
  name: string;
  slug: string;
  locale: string;
  description?: string;
  position: number;
}

interface Article {
  id: number;
  title: string;
  content: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  category_id: number;
  position: number;
  views: number;
}

const server = new Server(
  {
    name: 'chatwoot-help-center',
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
  tools: helpCenterTools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      // Portal management
      case 'list_portals': {
        result = await client.get<Portal[]>(
          client.accountPath('/portals')
        );
        break;
      }

      case 'create_portal': {
        result = await client.post<Portal>(
          client.accountPath('/portals'),
          args as Record<string, unknown>
        );
        break;
      }

      case 'get_portal': {
        const portalSlug = args?.portal_slug as string;
        result = await client.get<Portal>(
          client.accountPath(`/portals/${portalSlug}`)
        );
        break;
      }

      case 'update_portal': {
        const portalSlug = args?.portal_slug as string;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.portal_slug;
        result = await client.patch<Portal>(
          client.accountPath(`/portals/${portalSlug}`),
          updateData
        );
        break;
      }

      // Category management
      case 'list_categories': {
        const portalSlug = args?.portal_slug as string;
        const params: Record<string, unknown> = {};
        if (args?.locale) params.locale = args.locale;
        result = await client.get<Category[]>(
          client.accountPath(`/portals/${portalSlug}/categories`),
          params
        );
        break;
      }

      case 'create_category': {
        const portalSlug = args?.portal_slug as string;
        const categoryData = { ...args } as Record<string, unknown>;
        delete categoryData.portal_slug;
        result = await client.post<Category>(
          client.accountPath(`/portals/${portalSlug}/categories`),
          categoryData
        );
        break;
      }

      // Article management
      case 'list_articles': {
        const portalSlug = args?.portal_slug as string;
        const params: Record<string, unknown> = {};
        if (args?.category_slug) params.category_slug = args.category_slug;
        if (args?.locale) params.locale = args.locale;
        if (args?.status) params.status = args.status;
        if (args?.page) params.page = args.page;
        result = await client.get<Article[]>(
          client.accountPath(`/portals/${portalSlug}/articles`),
          params
        );
        break;
      }

      case 'create_article': {
        const portalSlug = args?.portal_slug as string;
        const articleData = { ...args } as Record<string, unknown>;
        delete articleData.portal_slug;
        result = await client.post<Article>(
          client.accountPath(`/portals/${portalSlug}/articles`),
          articleData
        );
        break;
      }

      case 'get_article': {
        const portalSlug = args?.portal_slug as string;
        const articleId = args?.article_id as number;
        result = await client.get<Article>(
          client.accountPath(`/portals/${portalSlug}/articles/${articleId}`)
        );
        break;
      }

      case 'update_article': {
        const portalSlug = args?.portal_slug as string;
        const articleId = args?.article_id as number;
        const updateData = { ...args } as Record<string, unknown>;
        delete updateData.portal_slug;
        delete updateData.article_id;
        result = await client.patch<Article>(
          client.accountPath(`/portals/${portalSlug}/articles/${articleId}`),
          updateData
        );
        break;
      }

      case 'delete_article': {
        const portalSlug = args?.portal_slug as string;
        const articleId = args?.article_id as number;
        await client.delete(
          client.accountPath(`/portals/${portalSlug}/articles/${articleId}`)
        );
        result = { success: true, message: `Article ${articleId} deleted` };
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
  console.error('Chatwoot Help Center MCP Server running on stdio');
}

main().catch(console.error);
