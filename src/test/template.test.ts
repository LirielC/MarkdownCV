import * as assert from 'assert';
import { initLocale } from '../i18n';
import { getAvailableTemplates, getTemplatePath } from '../template';

describe('Template', () => {
  before(() => {
    initLocale('pt-br');
  });

  it('deve retornar ao menos o template "default"', () => {
    const templates = getAvailableTemplates();
    assert.ok(templates.includes('default'));
  });

  it('deve retornar caminho válido para template existente', () => {
    const path = getTemplatePath('default');
    assert.ok(path.endsWith('default.css'));
  });

  it('deve lançar erro para template inexistente', () => {
    assert.throws(() => {
      getTemplatePath('inexistente');
    });
  });
});
