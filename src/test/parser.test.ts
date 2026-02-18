import * as assert from 'assert';
import { initLocale } from '../i18n';
import { validateSections } from '../parser';

describe('Parser - validateSections', () => {
  before(() => {
    initLocale('pt-br');
  });

  it('deve retornar valid=true para CV completo em PT', () => {
    const cv = `# João Silva\n## Contato\n## Experiência\n## Educação\n## Habilidades`;
    const result = validateSections(cv);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.missing.length, 0);
  });

  it('deve retornar valid=true para CV completo em EN', () => {
    const cv = `# John Doe\n## Contact\n## Experience\n## Education\n## Skills`;
    const result = validateSections(cv);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.missing.length, 0);
  });

  it('deve aceitar "Formação" como alternativa a "Educação"', () => {
    const cv = `# João\n## Contato\n## Experiência\n## Formação Acadêmica\n## Habilidades`;
    const result = validateSections(cv);
    assert.strictEqual(result.valid, true);
  });

  it('deve retornar todas as seções faltando para string vazia', () => {
    const result = validateSections('');
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.missing.length, 5);
  });

  it('deve retornar seções faltantes para CV incompleto', () => {
    const cv = `# João Silva\n## Experiência`;
    const result = validateSections(cv);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.missing.length, 3);
  });

  it('deve ser case-insensitive nos headers', () => {
    const cv = `# Nome\n## CONTATO\n## EXPERIÊNCIA\n## EDUCAÇÃO\n## HABILIDADES`;
    const result = validateSections(cv);
    assert.strictEqual(result.valid, true);
  });
});
