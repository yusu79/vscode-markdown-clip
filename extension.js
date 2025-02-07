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
            if (GetConfig.get("removeHeadingId")) {
                md.renderer.rules.heading_open = function(tokens, idx) {
                    const 
                        token = tokens[idx],
                        attrs = token.attrs || [], // トークンの属性を取得（属性がない場合は空配列を使用）
                        customAttributes = tokens[idx + 1].content.match(/{([^}]+)}/);// カスタム属性を取得

                    // 自動生成されたIDを削除
                    const filteredAttrs = attrs.filter(([name]) => {
                        return !["id"].includes(name);
                    });
                    // カスタムIDを生成
                    if (customAttributes) {
                        const 
                            id = customAttributes[1].match(/#([^\s.]+)/) || [],
                            idName = id[1];

                        if (idName) {
                            filteredAttrs.push(['id', idName]);
                        }
                    }                    

                    // 残りの属性を文字列に変換
                    const attrString = filteredAttrs.map(([name, value]) => `${name}="${value}"`).join(' '); // 各属性を 'name="value"' の形式に変換し、スペースで結合

                    // 開始タグを生成
                    return `<${token.tag}${attrString ? ' ' + attrString : ''}>`; // 属性がある場合はスペースを入れて属性を追加、ない場合は単純なタグを返す
                };
            };


            // VSCodeの自動属性を削除する処理を追加
            if (GetConfig.get("removeVSCodeAttributes")) {
                const originalRender = md.renderer.render;
                md.renderer.render = function(tokens, options, env) {
                    let html = originalRender.call(this, tokens, options, env);
                    
                    // VSCodeの属性を削除
                    html = html.replace(/\s?data-line="[^"]*"/g, '')
                                .replace(/\s?dir="auto"/g, '')
                                .replace(/\s?class="code-line"/g, '');
                    
                    return html;
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
