import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Dillinger API",
    version: "1.0.0",
    description:
      "REST API for Dillinger markdown editor. Render, export, and convert markdown documents.",
    contact: { url: "https://dillinger.io" },
    license: { name: "MIT" },
  },
  servers: [{ url: "https://dillinger.io/api/v1" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "API key passed as Bearer token",
      },
    },
  },
  paths: {
    "/render": {
      post: {
        operationId: "renderMarkdown",
        summary: "Render markdown to HTML",
        description:
          "Converts markdown to HTML using Dillinger's full rendering pipeline including KaTeX math, footnotes, syntax highlighting, tables, and task lists.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["markdown"],
                properties: {
                  markdown: {
                    type: "string",
                    description: "Markdown content to render",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Rendered HTML",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    html: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/export/pdf": {
      post: {
        operationId: "exportPdf",
        summary: "Export markdown as PDF",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["markdown"],
                properties: {
                  markdown: { type: "string" },
                  title: { type: "string", default: "document" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "PDF binary",
            content: { "application/pdf": {} },
          },
        },
      },
    },
    "/export/html": {
      post: {
        operationId: "exportHtml",
        summary: "Export markdown as styled HTML document",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["markdown"],
                properties: {
                  markdown: { type: "string" },
                  title: { type: "string", default: "document" },
                  styled: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "HTML document",
            content: { "text/html": {} },
          },
        },
      },
    },
    "/convert": {
      post: {
        operationId: "convertHtmlToMarkdown",
        summary: "Convert HTML to markdown",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["html"],
                properties: {
                  html: { type: "string", description: "HTML content to convert" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Converted markdown",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    markdown: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
