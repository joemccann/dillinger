# @dillinger/cli

Command-line interface for Dillinger markdown editor.

## Install

```bash
npm install -g @dillinger/cli
```

## Setup

```bash
export DILLINGER_API_KEY="your-api-key"
```

## Usage

```bash
# Render markdown to HTML
dlg render README.md

# Export to PDF
dlg export README.md --format pdf -o output.pdf

# Export to styled HTML
dlg export README.md --format html

# Convert HTML to markdown
dlg convert page.html

# Pipe from stdin
cat README.md | dlg render
echo "<h1>Hello</h1>" | dlg convert
```
