const 
    vscode = require("vscode"),
    {GetConfig} = require('./src/configs/getConfig'),
    {CopyCommand} = require('./src/commands/copyCommand'),
    {plugins} = require("./src/external/plugins");


exports.outputPanel = vscode.window.createOutputChannel("Markdown Clip");  // エラーメッセージを出力するパネル

function activate(context) {
    context.subscriptions.push(
        exports.outputPanel,
        GetConfig,
        new CopyCommand()
    );
    return {        
        extendMarkdownIt(md) {
            // カスタムID（{#custom-id}の形式）を抽出し、HTMLタグに反映
            if (GetConfig.get("headingIdRemove")) {
                md.renderer.rules.heading_open = function(tokens, idx) {
                    const 
                        token = tokens[idx],
                        customId = tokens[idx + 1].content.match(/{#([^}]+)}/); 
                    
                    if (customId) {
                        // 見出しにカスタムIDが存在する場合、そのIDのみを使用
                        return `<${token.tag} id="${customId[1]}">`;
                    } else {
                        // 見出しにカスタムIDがない場合は通常のヘッダータグを返す
                        return `<${token.tag}>`;
                    }
                };
            }
            
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
