import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  describe("basic markdown rendering", () => {
    it("renders headings", async () => {
      const result = await renderMarkdown("# Hello World");
      expect(result).toContain("<h1");
      expect(result).toContain("Hello World");
    });

    it("renders paragraphs", async () => {
      const result = await renderMarkdown("Some paragraph text.");
      expect(result).toContain("<p");
      expect(result).toContain("Some paragraph text.");
    });

    it("renders bold text", async () => {
      const result = await renderMarkdown("**bold text**");
      expect(result).toContain("<strong>bold text</strong>");
    });

    it("renders italic text", async () => {
      const result = await renderMarkdown("*italic text*");
      expect(result).toContain("<em>italic text</em>");
    });

    it("renders links with target _blank and rel noopener noreferrer", async () => {
      const result = await renderMarkdown("[example](http://example.com)");
      expect(result).toContain('href="http://example.com"');
      expect(result).toContain("example</a>");
    });
  });

  describe("code blocks with syntax highlighting", () => {
    it("applies hljs classes for known languages", async () => {
      const result = await renderMarkdown(
        '```javascript\nconst x = 1;\n```'
      );
      expect(result).toContain("<code");
      expect(result).toContain("hljs");
    });

    it("renders code blocks without highlighting for unknown languages", async () => {
      const result = await renderMarkdown(
        "```unknownlang\nsome code\n```"
      );
      expect(result).toContain("<code");
      expect(result).toContain("some code");
    });

    it("renders fenced code blocks without a language", async () => {
      const result = await renderMarkdown("```\nplain code\n```");
      expect(result).toContain("<code");
      expect(result).toContain("plain code");
      expect(result).not.toContain("hljs");
    });
  });

  describe("checkbox rendering", () => {
    it("renders unchecked checkboxes", async () => {
      const result = await renderMarkdown("- [ ] todo item");
      expect(result).toContain('type="checkbox"');
      expect(result).not.toMatch(/\bchecked\b/);
      expect(result).toContain("todo item");
    });

    it("renders checked checkboxes", async () => {
      const result = await renderMarkdown("- [x] checked item");
      expect(result).toContain('type="checkbox"');
      expect(result).toContain("checked");
      expect(result).toContain("checked item");
    });
  });

  describe("footnotes", () => {
    it("renders footnote references and definitions", async () => {
      const input = "Text with a footnote[^1].\n\n[^1]: Footnote content.";
      const result = await renderMarkdown(input);
      expect(result).toContain("footnote");
      expect(result).toContain("Footnote content.");
    });
  });

  describe("subscript and superscript", () => {
    it("renders subscript with tilde syntax", async () => {
      const result = await renderMarkdown("H~2~O");
      expect(result).toContain("<sub>2</sub>");
    });

    it("renders superscript with caret syntax", async () => {
      const result = await renderMarkdown("x^2^");
      expect(result).toContain("<sup>2</sup>");
    });
  });

  describe("mark/highlight", () => {
    it("renders marked text with double equals", async () => {
      const result = await renderMarkdown("==marked text==");
      expect(result).toContain("<mark>marked text</mark>");
    });
  });

  describe("insert", () => {
    it("renders inserted text with double plus", async () => {
      const result = await renderMarkdown("++inserted text++");
      expect(result).toContain("<ins>inserted text</ins>");
    });
  });

  describe("definition lists", () => {
    it("renders definition list markup", async () => {
      const input = "Term\n:   Definition of the term";
      const result = await renderMarkdown(input);
      expect(result).toContain("<dl>");
      expect(result).toContain("<dt>Term</dt>");
      expect(result).toContain("<dd>");
      expect(result).toContain("Definition of the term");
    });
  });

  describe("abbreviations", () => {
    it("renders abbreviation tags", async () => {
      const input = "*[HTML]: Hyper Text Markup Language\n\nThe HTML spec.";
      const result = await renderMarkdown(input);
      expect(result).toContain("<abbr");
      expect(result).toContain("Hyper Text Markup Language");
    });
  });

  describe("table of contents", () => {
    it("generates a table of contents from @[toc]", async () => {
      const input = "@[toc]\n\n# Heading One\n\n## Heading Two";
      const result = await renderMarkdown(input);
      expect(result).toContain("Heading One");
      expect(result).toContain("Heading Two");
      expect(result).toContain("<ul>");
    });
  });

  describe("math rendering with KaTeX", () => {
    it("renders inline math with single dollar signs", async () => {
      const result = await renderMarkdown("An equation $E=mc^2$ here.");
      expect(result).toContain("katex");
    });

    it("renders block math with double dollar signs", async () => {
      const result = await renderMarkdown("$$\nE=mc^2\n$$");
      expect(result).toContain("katex");
    });
  });

  describe("edge cases", () => {
    it("returns empty string for empty input", async () => {
      const result = await renderMarkdown("");
      expect(result).toBe("");
    });

    it("wraps plain text in a paragraph", async () => {
      const result = await renderMarkdown("just plain text");
      expect(result).toContain("<p");
      expect(result).toContain("just plain text");
    });
  });

  describe("line number attributes", () => {
    it("applies data-line-start and data-line-end to paragraphs", async () => {
      const result = await renderMarkdown("A paragraph of text.");
      expect(result).toContain("data-line-start");
      expect(result).toContain("data-line-end");
      expect(result).toContain("has-line-data");
    });

    it("applies line data attributes to headings", async () => {
      const result = await renderMarkdown("# My Heading");
      expect(result).toContain("data-line-start");
      expect(result).toContain("data-line-end");
      expect(result).toContain("has-line-data");
    });

    it("applies line data attributes to list items", async () => {
      const result = await renderMarkdown("- item one\n- item two");
      expect(result).toContain("data-line-start");
      expect(result).toContain("has-line-data");
    });

    it("applies line data attributes to fenced code blocks", async () => {
      const result = await renderMarkdown("```\ncode here\n```");
      expect(result).toContain("data-line-start");
      expect(result).toContain("has-line-data");
    });
  });

  describe("table rendering", () => {
    it("adds bootstrap table classes to tables", async () => {
      const input =
        "| Header |\n| ------ |\n| Cell   |";
      const result = await renderMarkdown(input);
      expect(result).toContain("table table-striped table-bordered");
    });
  });

  describe("heading anchors", () => {
    it("generates anchor ids from heading content", async () => {
      const result = await renderMarkdown("# Hello World");
      expect(result).toContain('<a id="Hello_World_0"></a>');
    });
  });

  describe("caching", () => {
    it("returns consistent results across multiple calls", async () => {
      const input = "# Consistency check";
      const first = await renderMarkdown(input);
      const second = await renderMarkdown(input);
      expect(first).toBe(second);
    });
  });
});
