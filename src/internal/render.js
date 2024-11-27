const extension = require("../../extension"); // md = require("markdown-it")()と同様


function renderHTML(markdownDocument) {
    let html = extension.md.render(markdownDocument.content); // extension.mdは､markdown-itプラグインを全て読み込んだ後のMarkdown｡つまり､md = require("markdown-it")().use("プラグイン")と同義｡これにより、VScode拡張機能を通じてインストールしたMarkdownプラグイン全てを反映したHTMLを生成できる。

    return html.trim(); // 一番下の空白行を削除
}

exports.renderHTML = renderHTML;

