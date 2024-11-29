# Markdown Clip
![Visual Studio Marketplace Version (including pre-releases)](https://img.shields.io/visual-studio-marketplace/v/yusu79.vscode-markdown-clip)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/yusu79.vscode-markdown-clip)

MarkdownをHTMLに変換し、クリップボードにコピーする機能を提供するVSCode拡張機能です。

[English version of README is available here.](https://github.com/yusu79/vscode-markdown-clip/blob/main/README_en.md)


- [インストール](#インストール)
- [機能](#機能)
- [使用方法](#使用方法)
- [解説](#解説)
- [設定オプション](#設定オプション)
- [クレジット](#クレジット)
- [使用しているプラグイン](#使用しているプラグイン)
- [謝辞](#謝辞)



## インストール
VScodeのマーケットプレイスで「Markdown Clip」と入力してください｡

<p align="center">
<img src="icons/setup.png" width="70%"/>
</p>

## 機能
- 選択したMarkdownテキストをHTMLに変換
- 選択範囲がない場合は、ファイル全体を変換
- 変換したHTMLをクリップボードに自動コピー
- キーボードショートカット（<kbd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd></kbd>）でクイック変換


## 使用方法
1. Markdownファイルを開く
2. 変換したい範囲を選択（任意）
3. 任意の方法<sup>※</sup>でコマンドを実行
4. クリップボードにHTMLがコピーされます


※コマンドを実行する方法は4種類あります。

- コマンドパレットから「`Copy as HTML`」を実行
- 右クリックメニューから「`Copy as HTML`」を実行
- <kbd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd></kbd>を押下して実行
- 上部メニューに表示されるクリップアイコンをクリックして実行



## 解説
「Markdown Clip」は、`markdown-it`を利用してMarkdownをHTMLにレンダリングするVScode拡張機能です。特長は、拡張機能を通じてインストールされた「markdown-it plugin」を反映した状態でHTMLに変換できることです。

例えば、「[Markdown MojiColor](https://marketplace.visualstudio.com/items?itemName=yusu79.markdown-mojicolor)」は`%文字%{色}`と表記することで簡単に色指定できる拡張機能です。この機能を通じて色設定したMarkdown上で、「`Clip as HTML`」を実行するときちんとHTMLにも反映されます。

```md:HTMLに拡張機能が反映される
%文字%{空色} // 変換前
<p><span style="color: #a0d8ef;">文字</span></p> // 変換後
```


このように Markdown Clip は、**任意のプラグインを反映させた状態でMarkdownをHTMLに変換しクリップボードにコピーできるツール**です。

## 設定オプション

### 1．見出しID制御
`Heading ID: Remove`: 見出しの自動ID生成を制御（デフォルト: true）
- true: 自動生成されるIDを削除
- false: IDを保持

「Markdown Clip」はmarkdown-itを利用し、HTMLにレンダリングしています。例えば、`# タイトル`をレンダリングしますと、`<h1 id="タイトル">タイトル</h1>`のように自動でidが生成されます。

```md:見出しID制御（false）
# タイトル // 変換前 
<h1 id="タイトル">タイトル</h1>  // 変換後
```

特に日本語など英語圏以外の言語を利用している方は、この自動生成されるタイトルが文字化けすることが多く、Wordpressに投稿する下書きとしてMarkdownを使用している方にとって使いづらい機能です。

そこで、この機能をOFFにする設定を追加しました（デフォルトはtrue）。

```md:見出しID制御（true）
# タイトル // 変換前 
<h1>タイトル</h1>  // 変換後
```

### 2．カスタムID制御
`Markdown-it-attrs: Enable`: カスタムID機能の有効化（デフォルト: true）
- true: Markdown記法 `{#カスタムID}` の処理を制御
  - プレビューとHTML出力時に非表示

`markdown-it-attrs`が自動でインストールされます。このプラグインは`{#カスタムID}`とすることでHTMLタグに任意のIDを付与できます。

```md:
# タイトル{#custom-id} // 変換前
<h1 id="custom-id">タイトル</h1> // 変換後
```

### 3．プラグイン設定
`Markdown-it-attrs: Options`: カスタムIDプラグインの詳細設定
```json
{
    "leftDelimiter": "{",    // 開始区切り文字
    "rightDelimiter": "}",   // 終了区切り文字
    "allowedAttributes": ["id","class"]  // 許可する属性
}
```

`markdown-it-attrs`にオプション設定を指定できます。デフォルトでは`{#カスタムID}`となっていますが、`"leftDelimiter": "「"`とすることで`「#カスタムID}`のように任意の記号を割り当てることができます。


## クレジット
VScode拡張機能で表示されるアイコンは、以下の2つの画像を組み合わせたものです。


| 画像                                                                                                                                                                                          | ライセンス                                                      | 作者/サイト                                                                                                     | 
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | 
| [Free Markdown Icon](https://iconscout.com/free-icon/markdown-1)                                                                                                                                  | [MIT ライセンス](https://opensource.org/license/MIT)            | [Benjamin J sperry](https://iconscout.com/contributors/benjamin-j-sperry) / [IconScout](https://iconscout.com/) | 
| [クリップのフリーアイコン素材](https://icooon-mono.com/00017-%E3%82%AF%E3%83%AA%E3%83%83%E3%83%97%E3%81%AE%E3%83%95%E3%83%AA%E3%83%BC%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E7%B4%A0%E6%9D%90/) | [icooon-mono独自のライセンス](https://icooon-mono.com/license/) | [icooon-mono](https://icooon-mono.com/)                                                                         | 



## 使用しているプラグイン
- [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs)

## 謝辞

このプロジェクトの開発にあたり、以下のオープンソースソフトウェアを参考にさせていただきました。この場を借りて感謝の意を表します。

- [qjebbs/vscode-markdown-extended](https://github.com/qjebbs/vscode-markdown-extended)
