const 
    vscode = require("vscode"),
    extension = require("../../extension");

async function ensureMarkdownEngine() {// もしextension.mdが無かったら'markdown.api.render'というコマンドに'init markdown engine'を渡して実行
    if (!extension.md) await vscode.commands.executeCommand('markdown.api.render', 'init markdown engine');// executeCommand(コマンド,引数)｡"markdown.api.render"は､VScodeのMarkdownエンジン｡「init markdown engine」を引数に渡すと､初期化される｡
}

exports.ensureMarkdownEngine = ensureMarkdownEngine;
