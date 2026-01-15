import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const helpCenterTools: Tool[] = [
  // Portal management
  {
    name: 'list_portals',
    description: 'List all help center portals',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_portal',
    description: 'Create a new help center portal',
    inputSchema: {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        name: {
          type: 'string',
          description: 'Name of the portal',
        },
        slug: {
          type: 'string',
          description: 'URL slug for the portal',
        },
        custom_domain: {
          type: 'string',
          description: 'Custom domain for the portal',
        },
        color: {
          type: 'string',
          description: 'Primary color (hex)',
        },
        homepage_link: {
          type: 'string',
          description: 'Homepage link',
        },
        page_title: {
          type: 'string',
          description: 'Page title',
        },
        header_text: {
          type: 'string',
          description: 'Header text',
        },
      },
    },
  },
  {
    name: 'get_portal',
    description: 'Get details of a portal',
    inputSchema: {
      type: 'object',
      required: ['portal_slug'],
      properties: {
        portal_slug: {
          type: 'string',
          description: 'Slug of the portal',
        },
      },
    },
  },
  {
    name: 'update_portal',
    description: 'Update a portal',
    inputSchema: {
      type: 'object',
      required: ['portal_slug'],
      properties: {
        portal_slug: {
          type: 'string',
          description: 'Slug of the portal',
        },
        name: {
          type: 'string',
          description: 'New name',
        },
        custom_domain: {
          type: 'string',
          description: 'New custom domain',
        },
        color: {
          type: 'string',
          description: 'New primary color (hex)',
        },
        archived: {
          type: 'boolean',
          description: 'Archive the portal',
        },
      },
    },
  },
  // Category management
  {
    name: 'list_categories',
    description: 'List all categories in a portal',
    inputSchema: {
      type: 'object',
      required: ['portal_slug'],
      properties: {
        portal_slug: {
          type: 'string',
          description: 'Slug of the portal',
        },
        locale: {
          type: 'string',
          description: 'Locale code (e.g., en, pt-BR)',
        },
      },
    },
  },
  {
    name: 'create_category',
    description: 'Create a new category in a portal',
    inputSchema: {
      type: 'object',
      required: ['portal_slug', 'name', 'slug', 'locale'],
      properties: {
        portal_slug: {
          type: 'string',
          description: 'Slug of the portal',
        },
        name: {
          type: 'string',
          description: 'Category name',
        },
        slug: {
          type: 'string',
          description: 'Category slug',
        },
        locale: {
          type: 'string',
          description: 'Locale code',
        },
        description: {
          type: 'string',
          description: 'Category description',
        },
        position: {
          type: 'number',
          description: 'Display position',
        },
      },
    },
  },
  // Article management
  {
    name: 'list_articles',
    description: 'List all articles in a portal',
    inputSchema: {
      type: 'object',
      required: ['portal_slug'],
      properties: {
        portal_slug: {
          type: 'string',
          description: 'Slug of the portal',
        },
        category_slug: {
          type: 'string',
          description: 'Filter by category slug',
        },
        locale: {
          type: 'string',
          description: 'Locale code',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'archived'],
          description: 'Filter by status',
        },
        page: {
          type: 'number',
          description: 'Page number',
        },
      },
    },
  },
  {
    name: 'create_article',
    description: 'Create a new article',
    inputSchema: {
      type: 'object',
      required: ['portal_slug', 'title', 'content', 'category_id'],
      properties: {
        portal_slug: {
          type: 'string',
          description: 'Slug of the portal',
        },
        title: {
          type: 'string',
          description: 'Article title',
        },
        content: {
          type: 'string',
          description: 'Article content (HTML or Markdown)',
        },
        category_id: {
          type: 'number',
          description: 'Category ID',
        },
        description: {
          type: 'string',
          description: 'Short description',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'Article status',
        },
        position: {
          type: 'number',
          description: 'Display position',
        },
      },
    },
  },
  {
    name: 'get_article',
    description: 'Get details of an article',
    inputSchema: {
      type: 'object',
      required: ['portal_slug', 'article_id'],
      properties: {
        portal_slug: {
          type: 'string',
          description: 'Slug of the portal',
        },
        article_id: {
          type: 'number',
          description: 'Article ID',
        },
      },
    },
  },
  {
    name: 'update_article',
    description: 'Update an article',
    inputSchema: {
      type: 'object',
      required: ['portal_slug', 'article_id'],
      properties: {
        portal_slug: {
          type: 'string',
          description: 'Slug of the portal',
        },
        article_id: {
          type: 'number',
          description: 'Article ID',
        },
        title: {
          type: 'string',
          description: 'New title',
        },
        content: {
          type: 'string',
          description: 'New content',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'archived'],
          description: 'New status',
        },
      },
    },
  },
  {
    name: 'delete_article',
    description: 'Delete an article',
    inputSchema: {
      type: 'object',
      required: ['portal_slug', 'article_id'],
      properties: {
        portal_slug: {
          type: 'string',
          description: 'Slug of the portal',
        },
        article_id: {
          type: 'number',
          description: 'Article ID to delete',
        },
      },
    },
  },
];
