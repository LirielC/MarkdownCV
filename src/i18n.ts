export type Locale = 'pt' | 'en';

interface Messages {
  [key: string]: string;
}

const messages: Record<Locale, Messages> = {
  pt: {
    'error.noFileOpen': 'Nenhum arquivo aberto. Abra um arquivo .md para gerar o PDF.',
    'error.notMarkdown': 'O arquivo aberto não é Markdown (.md).',
    'error.pdfGeneration': 'Erro ao gerar PDF: {0}',
    'error.templateNotFound': 'Template "{0}" não encontrado.',
    'error.browserNotFound': 'Chrome ou Edge não encontrado. Instale o Google Chrome ou Microsoft Edge para gerar PDFs.',
    'warn.missingSections': 'Seções faltando: {0}. Deseja continuar mesmo assim?',
    'prompt.chooseTemplate': 'Escolha um template para o currículo',
    'progress.generatingPdf': 'MarkdownCV: Gerando PDF...',
    'info.pdfGenerated': 'PDF gerado com sucesso: {0}',
    'prompt.yes': 'Sim',
    'prompt.no': 'Não',
    'section.name': 'Nome (título H1)',
    'section.contact': 'Contato',
    'section.experience': 'Experiência',
    'section.education': 'Educação',
    'section.skills': 'Habilidades',
    'ats.inputPrompt': 'Copie a descrição da vaga para a área de transferência e execute este comando.',
    'ats.clipboardEmpty': 'A área de transferência está vazia ou contém pouco texto. Copie a descrição da vaga primeiro.',
    'ats.scoreTitle': 'Pontuação ATS',
    'ats.foundKeywords': 'Palavras-chave encontradas',
    'ats.missingKeywords': 'Palavras-chave faltando',
    'ats.score': 'Pontuação: {0}%',
    'ats.analyzing': 'MarkdownCV: Analisando currículo...',
  },
  en: {
    'error.noFileOpen': 'No file open. Open a .md file to generate the PDF.',
    'error.notMarkdown': 'The open file is not Markdown (.md).',
    'error.pdfGeneration': 'Error generating PDF: {0}',
    'error.templateNotFound': 'Template "{0}" not found.',
    'error.browserNotFound': 'Chrome or Edge not found. Install Google Chrome or Microsoft Edge to generate PDFs.',
    'warn.missingSections': 'Missing sections: {0}. Continue anyway?',
    'prompt.chooseTemplate': 'Choose a template for the CV',
    'progress.generatingPdf': 'MarkdownCV: Generating PDF...',
    'info.pdfGenerated': 'PDF generated successfully: {0}',
    'prompt.yes': 'Yes',
    'prompt.no': 'No',
    'section.name': 'Name (H1 title)',
    'section.contact': 'Contact',
    'section.experience': 'Experience',
    'section.education': 'Education',
    'section.skills': 'Skills',
    'ats.inputPrompt': 'Copy the job description to clipboard and run this command.',
    'ats.clipboardEmpty': 'Clipboard is empty or has too little text. Copy the job description first.',
    'ats.scoreTitle': 'ATS Score',
    'ats.foundKeywords': 'Keywords found',
    'ats.missingKeywords': 'Missing keywords',
    'ats.score': 'Score: {0}%',
    'ats.analyzing': 'MarkdownCV: Analyzing CV...',
  }
};

let currentLocale: Locale = 'en';

export function initLocale(language?: string): void {
  const lang = language || 'en';
  currentLocale = lang.startsWith('pt') ? 'pt' : 'en';
}

export function t(key: string, ...args: string[]): string {
  let msg = messages[currentLocale][key] || messages['en'][key] || key;
  args.forEach((arg, i) => {
    msg = msg.replace(`{${i}}`, arg);
  });
  return msg;
}
