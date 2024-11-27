const {MetaData} = require("./metaData"); // 「---から---までのメタデータ」をjs.yamlに渡してJSON形式に変更する

// Markdown全体の文章を「---から---までのメタデータ」と「それ以外の本文」に分けるclass
class MarkdownDocument {
    constructor(document, overrideContent) {
        this._document = document;// vscode.window.activeTextEditor.documentを格納
        this._content = overrideContent;// 引数に渡していれば､最後の「---」の次の文章からドキュメントの最後の文章までを格納｡つまり「---」から「---」以外全てではなく､任意の箇所をレンダリングする本文に選べる
        this.load();// vscode.window.activeTextEditor.documentの「---」から「---」までのメタデータを抜き出し､それをmeta.jsに渡すことで､js.yamlでロードする関数｡constructorにあるので､自動で実行され､this._metaにjs.yamlでロードされた「---」から「---」までの情報が格納される
    }
    get document() {
        return this._document; // 元の文章｡1行目から最後まで全部
    }
    get meta() {
        return this._meta; // 元の文章の「---」から「---」までをjs.yamlでYAML形式からJSON形式に変更したもの
    }
    get content() {
        return this._content; // デフォルトは「---」から「---」以外の全ての文章｡レンダリングされる箇所｡
    }
    load() {
        let 
            meta = "",
            startLine = -1,
            endLine = -1;

        if (this.document.lineAt(0).text == "---") {
            // 1行目が「---」なら､以下の処理｡
            startLine = 0;
            for (let i = 1; i < this.document.lineCount; i++) {
                if (this.document.lineAt(i).text == "---") {
                    // i+1行目が「---」ならfor文を抜ける
                    endLine = i;
                    break;
                }
            }
            if (endLine < 0) startLine = -1;// 2つ目の「---」が無いなら､startLineを-1に
        }
        if (startLine == 0 && endLine > 0)
            // 最初の「---」が1行目で､2つ目の「---」が存在するなら､以下の処理を実行
            meta = this.document.getText(this.document.lineAt(1).range.union(this.document.lineAt(endLine - 1).range));// A.union(B)は和集合を意味する｡テキスト.rangeはその行全体を意味する｡1行目は「---」､endLineは「---」なので､その間の文章全てを取得するという意味｡
        else
            meta = "";
            // 最初の「---」が1行目じゃない､もしくは､2つ目の「---」が存在しないならば､meta.jsに渡すデータを空にする｡
        this._meta = new MetaData(meta, this.document.uri);// uriは使われていないので無視｡「---」から「---」までを渡して､YAMLからJSONに変える｡
        if (!this._content)// 引数が空なら､「---」から「---」以外をレンダリング対象とする｡
            this._content = this.document.getText(this.document.lineAt(endLine + 1).range.union(this.document.lineAt(this.document.lineCount - 1).range)); // endLineは最後の「---」｡「this.document.lineCount」はドキュメントの総行数番目｡0から始まっている為､-1している｡
            // つまり､最後の「---」の次の文章からドキュメントの最後の文章までを格納｡つまり「---」から「---」以外全て｡
    }
}

exports.MarkdownDocument = MarkdownDocument;
