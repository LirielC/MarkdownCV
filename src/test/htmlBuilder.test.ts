import * as assert from 'assert';
import * as path from 'path';
import { markdownToHtml } from '../htmlBuilder';

const CSS_PATH = path.join(__dirname, '..', '..', 'templates', 'default.css');

describe('HTML Builder', () => {
  it('deve gerar HTML com doctype e charset UTF-8', () => {
    const html = markdownToHtml('# Teste', CSS_PATH);
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('charset="UTF-8"'));
    assert.ok(html.includes('lang="pt-BR"'));
  });

  it('deve converter heading H1 para tag <h1>', () => {
    const html = markdownToHtml('# João Silva', CSS_PATH);
    assert.ok(html.includes('<h1>João Silva</h1>'));
  });

  it('deve converter lista em <ul><li>', () => {
    const html = markdownToHtml('- item 1\n- item 2', CSS_PATH);
    assert.ok(html.includes('<ul>'));
    assert.ok(html.includes('<li>item 1</li>'));
    assert.ok(html.includes('<li>item 2</li>'));
  });

  it('deve converter negrito em <strong>', () => {
    const html = markdownToHtml('**texto**', CSS_PATH);
    assert.ok(html.includes('<strong>texto</strong>'));
  });

  it('deve converter link em <a> com href', () => {
    const html = markdownToHtml('[site](https://example.com)', CSS_PATH);
    assert.ok(html.includes('href="https://example.com"'));
    assert.ok(html.includes('>site</a>'));
  });

  it('deve incluir CSS inline no HTML', () => {
    const html = markdownToHtml('# Test', CSS_PATH);
    assert.ok(html.includes('<style>'));
    assert.ok(html.includes('font-family'));
  });

  it('deve converter tabela markdown em <table>', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |';
    const html = markdownToHtml(md, CSS_PATH);
    assert.ok(html.includes('<table>'));
    assert.ok(html.includes('<td>'));
  });

  it('deve preservar acentos corretamente', () => {
    const html = markdownToHtml('## Experiência Educação São Paulo', CSS_PATH);
    assert.ok(html.includes('Experiência'));
    assert.ok(html.includes('Educação'));
    assert.ok(html.includes('São Paulo'));
  });
});
