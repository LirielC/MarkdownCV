import puppeteer from 'puppeteer-core';
import { t } from './i18n';

/**
 * Encontra o caminho do Chrome/Edge instalado no sistema.
 */
function findBrowser(): string {
  const paths: string[] = [];

  if (process.platform === 'win32') {
    paths.push(
      process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
      process.env['PROGRAMFILES'] + '\\Google\\Chrome\\Application\\chrome.exe',
      process.env['LOCALAPPDATA'] + '\\Google\\Chrome\\Application\\chrome.exe',
      process.env['PROGRAMFILES(X86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
      process.env['PROGRAMFILES'] + '\\Microsoft\\Edge\\Application\\msedge.exe'
    );
  } else if (process.platform === 'darwin') {
    paths.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    );
  } else {
    paths.push(
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/usr/bin/microsoft-edge'
    );
  }

  const fs = require('fs');
  for (const p of paths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(t('error.browserNotFound'));
}

/**
 * Gera PDF a partir de HTML completo.
 */
export async function generatePDF(htmlContent: string, outputPath: string): Promise<string> {
  const browserPath = findBrowser();

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 10000 });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '18mm',
        right: '18mm',
        bottom: '18mm',
        left: '18mm'
      },
      printBackground: true
    });

    return outputPath;
  } finally {
    await browser.close();
  }
}
