#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.DILLINGER_URL || "https://dillinger.io";
const API_KEY = process.env.DILLINGER_API_KEY || "";

async function apiCall(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${BASE_URL}/api/v1${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`API error ${response.status}: ${(error as { error: string }).error}`);
  }

  return response;
}

const server = new Server(
  { name: "dillinger", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "render_markdown",
      description:
        "Render markdown to HTML using Dillinger's full plugin pipeline (KaTeX math, footnotes, syntax highlighting, tables, task lists, and more)",
      inputSchema: {
        type: "object" as const,
        properties: {
          markdown: {
            type: "string",
            description: "Markdown content to render",
          },
        },
        required: ["markdown"],
      },
    },
    {
      name: "export_pdf",
      description:
        "Convert markdown to a PDF document. Returns the PDF as base64-encoded data.",
      inputSchema: {
        type: "object" as const,
        properties: {
          markdown: {
            type: "string",
            description: "Markdown content to convert to PDF",
          },
          title: {
            type: "string",
            description: "Document title (used in PDF metadata)",
          },
        },
        required: ["markdown"],
      },
    },
    {
      name: "export_html",
      description:
        "Convert markdown to a complete, styled HTML document ready for publishing or sharing.",
      inputSchema: {
        type: "object" as const,
        properties: {
          markdown: {
            type: "string",
            description: "Markdown content to convert",
          },
          title: {
            type: "string",
            description: "Document title",
          },
          styled: {
            type: "boolean",
            description: "Include CSS styling in the HTML document (default: true)",
          },
        },
        required: ["markdown"],
      },
    },
    {
      name: "convert_html_to_markdown",
      description:
        "Convert HTML content to clean markdown. Useful for scraping web content into markdown format.",
      inputSchema: {
        type: "object" as const,
        properties: {
          html: {
            type: "string",
            description: "HTML content to convert to markdown",
          },
        },
        required: ["html"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "render_markdown": {
        const response = await apiCall("/render", {
          markdown: (args as { markdown: string }).markdown,
        });
        const data = (await response.json()) as { html: string };
        return { content: [{ type: "text", text: data.html }] };
      }

      case "export_pdf": {
        const typedArgs = args as { markdown: string; title?: string };
        const response = await apiCall("/export/pdf", {
          markdown: typedArgs.markdown,
          title: typedArgs.title || "document",
        });
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return {
          content: [
            {
              type: "text",
              text: `PDF generated successfully (${buffer.byteLength} bytes). Base64-encoded content follows:\n${base64}`,
            },
          ],
        };
      }

      case "export_html": {
        const typedArgs = args as { markdown: string; title?: string; styled?: boolean };
        const response = await apiCall("/export/html", {
          markdown: typedArgs.markdown,
          title: typedArgs.title || "document",
          styled: typedArgs.styled ?? true,
        });
        const html = await response.text();
        return { content: [{ type: "text", text: html }] };
      }

      case "convert_html_to_markdown": {
        const response = await apiCall("/convert", {
          html: (args as { html: string }).html,
        });
        const data = (await response.json()) as { markdown: string };
        return { content: [{ type: "text", text: data.markdown }] };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
