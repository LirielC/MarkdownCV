import { execFile } from 'child_process';
import * as path from 'path';

export interface AtsResult {
  mode: 'basic' | 'nlp';
  score: number;
  similarity?: number;
  foundKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
}

// ========================
// MODO BÁSICO (TypeScript)
// ========================

const STOP_WORDS = new Set([
  // Português
  'a', 'o', 'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na',
  'nos', 'nas', 'um', 'uma', 'uns', 'umas', 'para', 'com', 'por',
  'que', 'se', 'como', 'ou', 'ao', 'aos', 'seu', 'sua', 'seus', 'suas',
  'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
  'ser', 'ter', 'estar', 'ir', 'nao', 'não', 'mais', 'muito', 'entre',
  'sobre', 'até', 'ate', 'bem', 'pode', 'deve', 'isso', 'isto', 'aquilo',
  'já', 'ja', 'ainda', 'também', 'tambem', 'quando', 'onde', 'quem',
  'qual', 'quais', 'todo', 'toda', 'todos', 'todas', 'outro', 'outra',
  'outros', 'outras', 'mesmo', 'mesma', 'cada', 'após', 'apos',
  'será', 'sera', 'são', 'sao', 'foi', 'eram', 'está', 'estão',
  'tem', 'tinha', 'vamos', 'voce', 'você', 'eles', 'elas',
  'ela', 'ele', 'nós', 'meu', 'minha', 'nosso', 'nossa',
  // Inglês
  'the', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
  'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'can',
  'this', 'that', 'these', 'those', 'it', 'its', 'we', 'you',
  'they', 'them', 'their', 'our', 'your', 'my', 'he', 'she',
  'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very',
  'just', 'about', 'above', 'after', 'again', 'all', 'also', 'am',
  'any', 'because', 'before', 'between', 'both', 'come', 'each',
  'from', 'get', 'here', 'how', 'into', 'more', 'most', 'must',
  'new', 'now', 'only', 'other', 'out', 'over', 'own', 'same',
  'some', 'such', 'there', 'through', 'under', 'up', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'work', 'working', 'within', 'without', 'year', 'years',
  'experiência', 'experiencia', 'experience', 'required', 'preferred',
  'ability', 'strong', 'looking', 'join', 'team', 'role', 'position',
  'company', 'empresa', 'vaga', 'candidato', 'responsável', 'responsavel',
]);

function extractKeywords(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[#*_\[\](){}|`>~]/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^\w\sàáâãéêíóôõúçñ\-\.#+]/gi, ' ');

  const words = normalized.split(/\s+/).filter(w => w.length > 2);
  const keywords = words.filter(w => !STOP_WORDS.has(w));
  return [...new Set(keywords)];
}

export function analyzeAtsBasic(cvContent: string, jobDescription: string): AtsResult {
  const jobKeywords = extractKeywords(jobDescription);
  const cvText = cvContent.toLowerCase();

  const found: string[] = [];
  const missing: string[] = [];

  for (const keyword of jobKeywords) {
    if (cvText.includes(keyword)) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const score = jobKeywords.length > 0
    ? Math.round((found.length / jobKeywords.length) * 100)
    : 0;

  return {
    mode: 'basic',
    score,
    foundKeywords: found,
    missingKeywords: missing,
    totalKeywords: jobKeywords.length
  };
}

// ========================
// MODO NLP (Python + spaCy)
// ========================

const PYTHON_SCRIPT = path.join(__dirname, '..', 'python', 'ats_nlp.py');

function runPython(args: string[], stdin?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const proc = execFile(pythonCmd, [PYTHON_SCRIPT, ...args], {
      timeout: 30000,
      maxBuffer: 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout.trim());
      }
    });

    if (stdin && proc.stdin) {
      proc.stdin.write(stdin);
      proc.stdin.end();
    }
  });
}

export async function isNlpAvailable(): Promise<boolean> {
  try {
    const output = await runPython(['check']);
    const result = JSON.parse(output);
    return result.available === true;
  } catch {
    return false;
  }
}

export async function analyzeAtsNlp(cvContent: string, jobDescription: string): Promise<AtsResult> {
  const input = JSON.stringify({ cv: cvContent, job: jobDescription });
  const output = await runPython(['analyze'], input);
  const result = JSON.parse(output);

  return {
    mode: 'nlp',
    score: result.score,
    similarity: result.similarity,
    foundKeywords: result.foundKeywords,
    missingKeywords: result.missingKeywords,
    totalKeywords: result.totalKeywords
  };
}

// ========================
// FUNÇÃO PRINCIPAL (híbrida)
// ========================

export async function analyzeAts(cvContent: string, jobDescription: string): Promise<AtsResult> {
  const nlpAvailable = await isNlpAvailable();

  if (nlpAvailable) {
    return analyzeAtsNlp(cvContent, jobDescription);
  }

  return analyzeAtsBasic(cvContent, jobDescription);
}
