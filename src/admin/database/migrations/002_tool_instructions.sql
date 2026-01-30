-- Chatwoot MCP Admin Panel - Tool Instructions Schema
-- Version: 1.0.0
-- Description: Stores custom instructions/descriptions for MCP tools

-- Tool Instructions table
CREATE TABLE IF NOT EXISTS tool_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name VARCHAR(255) UNIQUE NOT NULL,
    custom_description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tool_instructions_tool_name ON tool_instructions(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_instructions_is_enabled ON tool_instructions(is_enabled);
