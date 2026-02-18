import * as assert from 'assert';
import { initLocale, t } from '../i18n';

describe('i18n', () => {
  it('deve retornar mensagens em PT quando locale é pt-br', () => {
    initLocale('pt-br');
    assert.strictEqual(t('prompt.yes'), 'Sim');
    assert.strictEqual(t('prompt.no'), 'Não');
  });

  it('deve retornar mensagens em EN quando locale é en-us', () => {
    initLocale('en-us');
    assert.strictEqual(t('prompt.yes'), 'Yes');
    assert.strictEqual(t('prompt.no'), 'No');
  });

  it('deve usar EN como fallback para locale desconhecido', () => {
    initLocale('fr-fr');
    assert.strictEqual(t('prompt.yes'), 'Yes');
  });

  it('deve substituir {0} por argumento', () => {
    initLocale('pt-br');
    const msg = t('info.pdfGenerated', 'curriculo.pdf');
    assert.strictEqual(msg, 'PDF gerado com sucesso: curriculo.pdf');
  });

  it('deve substituir múltiplos argumentos', () => {
    initLocale('en');
    const msg = t('error.pdfGeneration', 'timeout');
    assert.strictEqual(msg, 'Error generating PDF: timeout');
  });

  it('deve retornar a key se não encontrar tradução', () => {
    initLocale('pt-br');
    assert.strictEqual(t('chave.inexistente'), 'chave.inexistente');
  });
});
