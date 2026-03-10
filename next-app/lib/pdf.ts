import fs from "node:fs";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { renderHtmlDocument } from "@/lib/export";
import { renderMarkdown } from "@/lib/markdown";

const PDF_OPTIONS = {
  format: "A4" as const,
  margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
  printBackground: true,
};

const DEFAULT_VIEWPORT = {
  width: 1280,
  height: 720,
};

const LOCAL_CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

async function resolveChromeExecutablePath() {
  for (const candidate of LOCAL_CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const executablePath = await chromium.executablePath();

  if (!executablePath) {
    throw new Error("No Chromium executable available for PDF export");
  }

  return executablePath;
}

export async function renderPdfBuffer({
  markdown,
  title,
}: {
  markdown: string;
  title?: string;
}) {
  const html = renderHtmlDocument({
    title,
    html: renderMarkdown(markdown),
    styled: true,
  });

  const executablePath = await resolveChromeExecutablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: DEFAULT_VIEWPORT,
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf(PDF_OPTIONS);

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
