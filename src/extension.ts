import * as vscode from 'vscode';
import * as path from 'path';
import { initLocale, t } from './i18n';
import { validateSections } from './parser';
import { getAvailableTemplates, getTemplatePath } from './template';
import { markdownToHtml } from './htmlBuilder';
import { generatePDF } from './pdfGenerator';
import { analyzeAts } from './atsAnalyzer';

export function activate(context: vscode.ExtensionContext) {
  initLocale(vscode.env.language);

  // Comando: Gerar PDF
  const pdfCommand = vscode.commands.registerCommand('markdowncv.generatePDF', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage(t('error.noFileOpen'));
      return;
    }

    const filePath = editor.document.uri.fsPath;

    if (!filePath.endsWith('.md')) {
      vscode.window.showErrorMessage(t('error.notMarkdown'));
      return;
    }

    await editor.document.save();

    const content = editor.document.getText();

    const validation = validateSections(content);
    if (!validation.valid) {
      const missing = validation.missing.join(', ');
      const yes = t('prompt.yes');
      const no = t('prompt.no');
      const choice = await vscode.window.showWarningMessage(
        t('warn.missingSections', missing),
        yes, no
      );
      if (choice !== yes) {
        return;
      }
    }

    const templates = getAvailableTemplates();
    let templateName = 'default';

    if (templates.length > 1) {
      const picked = await vscode.window.showQuickPick(templates, {
        placeHolder: t('prompt.chooseTemplate')
      });
      if (!picked) {
        return;
      }
      templateName = picked;
    }

    const cssPath = getTemplatePath(templateName);
    const pdfPath = filePath.replace(/\.md$/i, '.pdf');

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t('progress.generatingPdf'),
          cancellable: false
        },
        async () => {
          const htmlContent = markdownToHtml(content, cssPath);
          await generatePDF(htmlContent, pdfPath);
          vscode.window.showInformationMessage(t('info.pdfGenerated', path.basename(pdfPath)));
        }
      );
    } catch (err: any) {
      vscode.window.showErrorMessage(t('error.pdfGeneration', err.message));
    }
  });

  // Comando: ATS Score
  const atsCommand = vscode.commands.registerCommand('markdowncv.atsScore', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor || !editor.document.uri.fsPath.endsWith('.md')) {
      vscode.window.showErrorMessage(t('error.noFileOpen'));
      return;
    }

    const cvContent = editor.document.getText();

    const jobDescription = await vscode.env.clipboard.readText();
    if (!jobDescription || jobDescription.trim().length < 20) {
      vscode.window.showWarningMessage(t('ats.clipboardEmpty'));
      return;
    }

    try {
      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t('ats.analyzing'),
          cancellable: false
        },
        () => analyzeAts(cvContent, jobDescription)
      );

      const channel = vscode.window.createOutputChannel('MarkdownCV ATS');
      channel.clear();
      channel.appendLine(`=== ${t('ats.scoreTitle')} ===`);
      channel.appendLine(`Mode: ${result.mode.toUpperCase()}`);
      channel.appendLine(t('ats.score', result.score.toString()));
      if (result.similarity !== undefined) {
        channel.appendLine(`Semantic similarity: ${result.similarity}%`);
      }
      channel.appendLine('');
      channel.appendLine(`${t('ats.foundKeywords')} (${result.foundKeywords.length}):`);
      result.foundKeywords.forEach((k: string) => channel.appendLine(`  + ${k}`));
      channel.appendLine('');
      channel.appendLine(`${t('ats.missingKeywords')} (${result.missingKeywords.length}):`);
      result.missingKeywords.forEach((k: string) => channel.appendLine(`  - ${k}`));
      channel.show();
    } catch (err: any) {
      vscode.window.showErrorMessage(t('error.pdfGeneration', err.message));
    }
  });

  context.subscriptions.push(pdfCommand, atsCommand);
}

export function deactivate() {}
