const 
    vscode = require("vscode"),
    {GetConfig} = require('./src/configs/getConfig'),
    {CopyCommand} = require('./src/commands/copyCommand'),
    {DuplicateHeadingIdDiagnostics} = require('./src/internal/duplicateHeadingIdDiagnostics'),
    {configureHeadingIds} = require('./src/internal/headingIds'),
    {plugins} = require("./src/external/plugins");


exports.outputPanel = vscode.window.createOutputChannel("Markdown Clip");  // エラーメッセージを出力するパネル

function activate(context) {
    const duplicateHeadingIdDiagnostics = new DuplicateHeadingIdDiagnostics();

    context.subscriptions.push(
        exports.outputPanel,
        GetConfig,
        new CopyCommand(),
        duplicateHeadingIdDiagnostics
    );
    return {        
        extendMarkdownIt(md) {
            plugins.map(p => {       
                const 
                    plugin = require(p.plugin),
                    options = p.options

                if (options) {
                    md.use(plugin,options);
                } else {
                    md.use(plugin);
                }
            });
            configureHeadingIds(md);
            duplicateHeadingIdDiagnostics.setMarkdownIt(md);
            exports.md = md;
            return md;
        }
    };
}


function deactivate() {}


module.exports = {
	activate,
	deactivate
}
