# @dillinger/mcp

MCP (Model Context Protocol) server for Dillinger. Lets LLMs use Dillinger as a native markdown tool.

## Setup

```bash
npm install
npm run build
```

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "dillinger": {
      "command": "node",
      "args": ["/path/to/packages/mcp/dist/index.js"],
      "env": {
        "DILLINGER_API_KEY": "your-api-key",
        "DILLINGER_URL": "https://dillinger.io"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `render_markdown` | Markdown to HTML with full plugin support |
| `export_pdf` | Markdown to PDF document |
| `export_html` | Markdown to styled HTML document |
| `convert_html_to_markdown` | HTML to clean markdown |
