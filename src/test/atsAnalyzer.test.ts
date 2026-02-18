import * as assert from 'assert';
import { analyzeAtsBasic } from '../atsAnalyzer';

describe('ATS Analyzer - analyzeAtsBasic', () => {
  it('deve retornar score 0 para vaga vazia', () => {
    const result = analyzeAtsBasic('# CV com conteúdo', '');
    assert.strictEqual(result.score, 0);
    assert.strictEqual(result.mode, 'basic');
  });

  it('deve encontrar keywords presentes no CV', () => {
    const cv = '# Dev\n## Habilidades\n- JavaScript, React, Node.js, Docker';
    const job = 'Procuramos desenvolvedor com experiência em JavaScript e React';
    const result = analyzeAtsBasic(cv, job);
    assert.ok(result.foundKeywords.includes('javascript'));
    assert.ok(result.foundKeywords.includes('react'));
    assert.ok(result.score > 0);
  });

  it('deve listar keywords faltantes', () => {
    const cv = '# Dev\n## Habilidades\n- Python';
    const job = 'Experiência com Kubernetes e Terraform obrigatório';
    const result = analyzeAtsBasic(cv, job);
    assert.ok(result.missingKeywords.includes('kubernetes'));
    assert.ok(result.missingKeywords.includes('terraform'));
  });

  it('deve retornar score 100 quando todas as keywords estão presentes', () => {
    const cv = 'react typescript docker postgresql';
    const job = 'react typescript docker postgresql';
    const result = analyzeAtsBasic(cv, job);
    assert.strictEqual(result.score, 100);
  });

  it('deve ser case-insensitive', () => {
    const cv = 'REACT TYPESCRIPT';
    const job = 'react typescript';
    const result = analyzeAtsBasic(cv, job);
    assert.strictEqual(result.score, 100);
  });

  it('deve filtrar stop-words da análise', () => {
    const cv = '# Dev';
    const job = 'a o e de para com que se como';
    const result = analyzeAtsBasic(cv, job);
    assert.strictEqual(result.totalKeywords, 0);
  });

  it('deve ignorar sintaxe markdown no CV', () => {
    const cv = '## **React** e [Node.js](https://nodejs.org)';
    const job = 'React Node.js';
    const result = analyzeAtsBasic(cv, job);
    assert.ok(result.foundKeywords.includes('react'));
  });
});
