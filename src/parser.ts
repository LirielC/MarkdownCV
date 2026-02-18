import { t } from './i18n';

interface SectionRule {
  pattern: RegExp;
  i18nKey: string;
}

export interface ValidationResult {
  valid: boolean;
  missing: string[];
}

const REQUIRED_SECTIONS: SectionRule[] = [
  { pattern: /^#\s+.+/m, i18nKey: 'section.name' },
  { pattern: /^##\s+(contato|contact)/im, i18nKey: 'section.contact' },
  { pattern: /^##\s+(experi[eê]ncia|experience)/im, i18nKey: 'section.experience' },
  { pattern: /^##\s+(educa[cç][aã]o|education|forma[cç][aã]o)/im, i18nKey: 'section.education' },
  { pattern: /^##\s+(habilidades|skills)/im, i18nKey: 'section.skills' }
];

export function validateSections(markdownContent: string): ValidationResult {
  const missing: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(markdownContent)) {
      missing.push(t(section.i18nKey));
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}
