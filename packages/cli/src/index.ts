#!/usr/bin/env node

const BASE_URL = process.env.DILLINGER_URL || "https://dillinger.io";
const API_KEY = process.env.DILLINGER_API_KEY || "";

async function apiCall(
  path: string,
  body: Record<string, unknown>
): Promise<Response> {
  const response = await fetch(`${BASE_URL}/api/v1${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    console.error(
      `Error ${response.status}: ${(error as { error: string }).error}`
    );
    process.exit(1);
  }

  return response;
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

async function readInput(filePath?: string): Promise<string> {
  if (filePath) {
    const { readFile } = await import("node:fs/promises");
    return readFile(filePath, "utf8");
  }

  if (!process.stdin.isTTY) {
    return readStdin();
  }

  console.error("Error: provide a file path or pipe content via stdin");
  process.exit(1);
}

async function render(filePath?: string) {
  const markdown = await readInput(filePath);
  const response = await apiCall("/render", { markdown });
  const data = (await response.json()) as { html: string };
  process.stdout.write(data.html);
}

async function exportPdf(filePath?: string, output?: string) {
  const markdown = await readInput(filePath);
  const title = filePath?.replace(/\.[^.]+$/, "") || "document";
  const response = await apiCall("/export/pdf", { markdown, title });
  const buffer = Buffer.from(await response.arrayBuffer());

  if (output) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(output, buffer);
    console.error(`Written to ${output}`);
  } else {
    process.stdout.write(buffer);
  }
}

async function exportHtml(filePath?: string, styled = true) {
  const markdown = await readInput(filePath);
  const title = filePath?.replace(/\.[^.]+$/, "") || "document";
  const response = await apiCall("/export/html", { markdown, title, styled });
  process.stdout.write(await response.text());
}

async function convert(filePath?: string) {
  const html = await readInput(filePath);
  const response = await apiCall("/convert", { html });
  const data = (await response.json()) as { markdown: string };
  process.stdout.write(data.markdown + "\n");
}

function printUsage() {
  console.log(`dlg - Dillinger CLI

Usage:
  dlg render <file.md>              Render markdown to HTML
  dlg export <file.md> [--format]   Export to PDF or HTML (default: pdf)
  dlg convert <file.html>           Convert HTML to markdown
  dlg help                          Show this help

Options:
  --format pdf|html    Export format (default: pdf)
  --styled             Include CSS in HTML export (default: true)
  --output, -o <file>  Output file path (PDF only)

Environment:
  DILLINGER_API_KEY    API key for authentication
  DILLINGER_URL        API base URL (default: https://dillinger.io)

Examples:
  dlg render README.md
  dlg export README.md --format pdf -o output.pdf
  dlg export README.md --format html
  cat README.md | dlg render
  echo "<h1>Hello</h1>" | dlg convert`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!API_KEY && command !== "help") {
    console.error("Error: set DILLINGER_API_KEY environment variable");
    process.exit(1);
  }

  switch (command) {
    case "render": {
      await render(args[1]);
      break;
    }

    case "export": {
      const format = args.includes("--format")
        ? args[args.indexOf("--format") + 1]
        : "pdf";
      const outputIdx = args.indexOf("-o") !== -1 ? args.indexOf("-o") : args.indexOf("--output");
      const output = outputIdx !== -1 ? args[outputIdx + 1] : undefined;
      const filePath = args[1] !== "--format" ? args[1] : undefined;

      if (format === "html") {
        const styled = !args.includes("--no-styled");
        await exportHtml(filePath, styled);
      } else {
        await exportPdf(filePath, output);
      }
      break;
    }

    case "convert": {
      await convert(args[1]);
      break;
    }

    case "help":
    case "--help":
    case "-h":
    case undefined: {
      printUsage();
      break;
    }

    default: {
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error(`Fatal: ${error.message}`);
  process.exit(1);
});
