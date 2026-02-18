import * as path from 'path';
import * as fs from 'fs';
import { t } from './i18n';

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

export function getAvailableTemplates(): string[] {
  const files = fs.readdirSync(TEMPLATES_DIR);
  return files
    .filter(f => f.endsWith('.css'))
    .map(f => f.replace('.css', ''));
}

export function getTemplatePath(templateName: string): string {
  const cssPath = path.join(TEMPLATES_DIR, `${templateName}.css`);
  if (!fs.existsSync(cssPath)) {
    throw new Error(t('error.templateNotFound', templateName));
  }
  return cssPath;
}
