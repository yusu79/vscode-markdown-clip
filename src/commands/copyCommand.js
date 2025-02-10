"use strict";
const 
    {BaseCommand} = require("./baseCommand"),
    vscode = require("vscode"),
    {copy} = require("copy-paste"),
    {ensureMarkdownEngine} = require("../internal/ensure"),
    {renderHTML} = require("../internal/render"),
    {MarkdownDocument} = require("../internal/markdownDocument");

class CopyCommand extends BaseCommand {
    constructor() {
        super("markdown-clip.copyAsHtml"); // super()は親クラスのconstructorを呼び出している。
    }
    async execute() {
        return copy(await this.renderMarkdown(),() => {
            vscode.window.showInformationMessage(
                vscode.l10n.t("Markdown converted to HTML and copied to clipboard.")
            )
        });
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
