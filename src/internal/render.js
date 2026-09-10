const
    extension = require("../../extension"), // md = require("markdown-it")()と同様
    {GetConfig} = require("../configs/getConfig"),
    markdownMermaidConfig = /^<span\b(?=[^>]*\bid="markdown-mermaid")(?=[^>]*\baria-hidden="true")(?=[^>]*\bdata-config="[^"]*")[^>]*><\/span>\r?\n?/,
    htmlTag = /<[A-Za-z][^<>]*>/g,
    dataLineAttribute = /\sdata-line=(?:"[^"]*"|'[^']*')/gi,
    classAttribute = /\sclass=("([^"]*)"|'([^']*)')/gi;


function renderHTML(markdownDocument) {
    const env = {
        frontmatter: structuredClone(markdownDocument.meta.data),
        markdownClip: {
            removeHeadingId: GetConfig.get("removeHeadingId"),
            removeVSCodeAttributes: GetConfig.get("removeVSCodeAttributes"),
        },
    };
    let html = extension.md.render(markdownDocument.content, env); // extension.mdは､markdown-itプラグインを全て読み込んだ後のMarkdown｡つまり､md = require("markdown-it")().use("プラグイン")と同義｡これにより、VScode拡張機能を通じてインストールしたMarkdownプラグイン全てを反映したHTMLを生成できる。

    html = html.replace(markdownMermaidConfig, "");
    if (env.markdownClip.removeVSCodeAttributes) {
        html = removeVSCodeAttributes(html);
    }

    return html.trim(); // 一番下の空白行を削除
}

function removeVSCodeAttributes(html) {
    return html.replace(htmlTag, tag => {
        return tag
            .replace(dataLineAttribute, "")
            .replace(classAttribute, (attribute, quotedValue, doubleQuotedValue, singleQuotedValue) => {
                const
                    quote = quotedValue[0],
                    value = doubleQuotedValue !== undefined ? doubleQuotedValue : singleQuotedValue,
                    classNames = value.split(/\s+/);

                if (!classNames.includes("code-line")) return attribute;

                const classes = classNames.filter(name => name && name !== "code-line");

                return classes.length ? ` class=${quote}${classes.join(" ")}${quote}` : "";
            });
    });
}

exports.renderHTML = renderHTML;

