"use strict";
const
    {BaseCommand} = require("./baseCommand"),
    vscode = require("vscode"),
    {ensureMarkdownEngine} = require("../internal/ensure"),
    {renderHTML} = require("../internal/render"),
    {MarkdownDocument} = require("../internal/markdownDocument");

class CopyCommand extends BaseCommand {
    constructor() {
        super("markdown-clip.copyAsHtml"); // super()は親クラスのconstructorを呼び出している。
    }
    async execute() {
        try {
            await vscode.env.clipboard.writeText(
                await this.renderMarkdown()
            );

            vscode.window.showInformationMessage(
                vscode.l10n.t("Markdown converted to HTML and copied to clipboard.")
            );
        }
        catch (error) {
            vscode.window.showErrorMessage(
                vscode.l10n.t("Failed to copy to clipboard.")
            );
        }
    }
    async renderMarkdown() {
        await ensureMarkdownEngine();
        const
            document = vscode.window.activeTextEditor.document,
            selection = vscode.window.activeTextEditor.selection;

        let
            doc = new MarkdownDocument(document, document.getText(selection)),
            rendered = renderHTML(doc);

        return rendered;
    }
}


exports.CopyCommand = CopyCommand;
