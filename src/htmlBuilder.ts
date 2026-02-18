import MarkdownIt from 'markdown-it';
import * as fs from 'fs';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  typographer: true
});

export function markdownToHtml(markdownContent: string, cssPath: string): string {
  const body = md.render(markdownContent);
  const css = fs.readFileSync(cssPath, 'utf-8');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}
