# Markdown Clip
[![GitHub License](https://img.shields.io/github/license/yusu79/vscode-markdown-clip)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/yusu79/vscode-markdown-clip)](https://github.com/yusu79/vscode-markdown-clip/releases/latest)

[English](#markdown-clip) | [日本語](#日本語)

A Visual Studio Code extension that provides functionality to convert Markdown to HTML and copy it to the clipboard.

## Installation
Enter "Markdown Clip" in the VS Code marketplace.

<p align="center">
<img src="images/setup.png" width="70%"/>
</p>

## Example
Converts the entire Markdown text of a file to HTML and automatically copies it to the clipboard.

![Markdown Clip](https://raw.githubusercontent.com/yusu79/vscode-markdown-clip/main/images/markdown-clip.gif)

## Features
- Convert selected Markdown text to HTML
- If no range is selected, convert the entire Markdown file
- Automatically copy the converted HTML to the clipboard
- Apply Markdown-it plugins registered with VS Code to the converted HTML
- Pass the source document's parsed YAML Front Matter to plugins as `env.frontmatter`, including selection conversions

## Usage

| Command                                                  | Keyboard Shortcut                        | Icon                                         |
|----------------------------------------------------------|------------------------------------------|----------------------------------------------|
| Convert to HTML and Copy to clipboard                 | <kbd>CTRL</kbd> + <kbd>Shift</kbd> + <kbd>c</kbd> | <p align="center"><img src="./images/copyAsHtml.png" width="50%"/></p> |

## Explanation
"Markdown Clip" is a VS Code extension that converts Markdown to HTML and copies it to the clipboard.

1. Open a Markdown file
2. Select the range you want to convert (optional)
3. Execute the command using any method
4. HTML is copied to the clipboard

```md
// Markdown Text
**Text**
```
```html
// HTML converted and copied to clipboard
<strong>Text</strong>
```

## Settings

### Remove Heading ID

- `true` (Default): Remove automatic heading IDs from the HTML copied by Markdown Clip. Explicit IDs assigned by Markdown-it plugins, such as `markdown-it-attrs`, are preserved.
- `false`: Keep automatic IDs on headings without an explicit ID. If a heading has an explicit ID, the explicit ID takes precedence.

This setting changes only the copied HTML. It does not affect heading navigation in the VS Code preview.

```md
# Automatic ID
# Automatic ID {#explicit-id}
```
```html
<!-- If setting is true -->
<h1>Automatic ID</h1>
<h1 id="explicit-id">Automatic ID</h1>

<!-- If setting is false -->
<h1 id="automatic-id">Automatic ID</h1>
<h1 id="explicit-id">Automatic ID</h1>
```

The exact automatic ID depends on the active renderer. If both an explicit ID and an automatic ID are assigned to the same heading, Markdown Clip preserves only the explicit ID regardless of this setting. It does not output multiple `id` attributes on one heading.

If an explicit heading ID is duplicated within the same Markdown document, a warning is shown on every affected `{#ID}`. Keep HTML `id` values unique within a document.

This is only a warning. Markdown Clip does not stop conversion or copying, and it does not automatically change explicit IDs. Automatic IDs, `{#ID}` inside code blocks, and matching IDs in separate Markdown documents do not trigger this warning.

### Remove VSCode Attributes

- `true` (Default): Remove VS Code's `data-line` attribute and `code-line` class from the HTML copied by Markdown Clip. Other classes and `dir="auto"` are preserved.
- `false`: Keep these VS Code attributes in the copied HTML.

This setting changes only the copied HTML and does not affect the VS Code preview.

```md
// Markdown Text
# Test
```
```html
<!-- If setting is true -->
<h1 dir="auto">Test</h1>

<!-- If setting is false -->
<h1 data-line="0" class="code-line" dir="auto">Test</h1>
```

### Plugin Settings

#### ON/OFF Function
- `Markdown-it-attrs: Enable`
    - `true` (Default): When custom attributes (`{#id .class}` format) are specified, apply them to the HTML tag.
    - `false`: The plugin is disabled, and custom IDs (`{#id}` format) are no longer reflected.

```md
// Markdown Text
# Test {.test}
```
```html
// If setting is true
<h1 class="test">Test</h1>

// If setting is false
<h1>Test {.test}</h1>
```

#### Detailed Settings
- `Markdown-it-attrs: Options`
    - `Edit in settings.json`: You can edit the detailed settings for each plugin.

The following is the default setting:
```json
{
    "leftDelimiter": "{",    // Opening delimiter
    "rightDelimiter": "}",   // Closing delimiter
    "allowedAttributes": []  // Allowed attributes (No notation means all are allowed)
}
```

## Credits
The icon displayed in the VS Code extension is a combination of the following two images:

| Image                                                                                                                                                                                            | License                                                        | Author/Site                                                                                                      |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| [Free Markdown Icon](https://iconscout.com/free-icon/markdown-1)                                                                                                                                   | [MIT License](https://opensource.org/license/MIT)             | [Benjamin J sperry](https://iconscout.com/contributors/benjamin-j-sperry) / [IconScout](https://iconscout.com/)  |
| [Clip Free Icon Material](https://icooon-mono.com/00017-%E3%82%AF%E3%83%AA%E3%83%83%E3%83%97%E3%81%AE%E3%83%95%E3%83%AA%E3%83%BC%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E7%B4%A0%E6%9D%90/) | [icooon-mono License](https://icooon-mono.com/license/) | [icooon-mono](https://icooon-mono.com/)                                                                          |

## Used Plugins
- [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs)

## Acknowledgments

In developing this project, we referenced the following open-source software. We would like to express our gratitude:

- [qjebbs/vscode-markdown-extended](https://github.com/qjebbs/vscode-markdown-extended)

For additional licensing information, please see the [NOTICE](https://github.com/yusu79/vscode-markdown-clip/blob/main/NOTICE) file.

---

## 日本語

[English](#markdown-clip) | [日本語](#日本語)

MarkdownをHTMLに変換し、クリップボードにコピーする機能を提供するVisual Studio Code拡張機能です。

### インストール
Visual Studio Code のマーケットプレイスで「Markdown Clip」と入力してください｡

<p align="center">
<img src="images/setup.png" width="70%"/>
</p>

### 使用例
ファイル全体のMarkdownテキストをHTMLに変換し、クリップボードに自動コピーします。

![Markdown Clip](https://raw.githubusercontent.com/yusu79/vscode-markdown-clip/main/images/markdown-clip_jp.gif)

### 機能
- 選択したMarkdownテキストをHTMLに変換
- 選択範囲がない場合は、Markdownファイル全体を変換
- 変換したHTMLをクリップボードに自動コピー
- VS Codeに登録されたMarkdown-itプラグインを変換後のHTMLへ反映
- 選択範囲の変換時も、元文書の解析済みYAML Front Matterを`env.frontmatter`としてプラグインへ渡す

### 使用方法
| コマンド                                                   | キーボード                                        | アイコン                                      |
| ---------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------- |
| HTMLに変換してクリップボードにコピーする | <kbd>CTRL</kbd> + <kbd>Shift</kbd> + <kbd>c</kbd> | <p align="center"><img src="./images/copyAsHtml.png" width="50%"/></p> |

### 解説
「Markdown Clip」は、MarkdownをHTMLに変換し、クリップボードにコピーするVisual Studio Code拡張機能です。

1. Markdownファイルを開く
2. 変換したい範囲を選択（任意）
3. 任意の方法でコマンドを実行
4. クリップボードにHTMLがコピーされます

```md
// Markdown の文章
**文字**
```
```html
// HTML に変換されてクリップボードにコピーされる
<strong>文字</strong>
```

### 設定オプション

#### Remove Heading ID

- true（**デフォルト**）: Markdown ClipでコピーするHTMLから、自動IDを削除します。`markdown-it-attrs`などのMarkdown-itプラグインで明示的に付けたIDは維持します。
- false: 明示IDがない見出しの自動IDを維持します。明示IDがある場合は、明示IDを優先します。

この設定が変更するのはコピーするHTMLだけです。VS Codeプレビューの見出しジャンプには影響しません。

```md
# 自動ID
# 自動ID {#明示ID}
```
```html
<!-- 設定がtrueの場合 -->
<h1>自動ID</h1>
<h1 id="明示ID">自動ID</h1>

<!-- 設定がfalseの場合 -->
<h1 id="自動id">自動ID</h1>
<h1 id="明示ID">自動ID</h1>
```

自動IDの具体的な値は使用中のrendererによって異なります。明示IDと自動IDが同じ見出しに付与された場合は、設定にかかわらず明示IDだけを維持し、1つの見出しに複数の`id`属性を出力しません。

同じMarkdown文書内で、見出しの明示IDが重複すると、該当するすべての`{#ID}`に警告を表示します。HTMLの`id`は文書内で一意にしてください。

これは警告のみです。Markdown ClipはHTMLへの変換やコピーを中止せず、明示IDを自動的に変更しません。自動ID、コードブロック内の`{#ID}`、別のMarkdown文書にある同名IDは警告の対象外です。

#### Remove VSCode Attributes

- true（**デフォルト**）: Markdown ClipでコピーするHTMLから、VS Codeの`data-line`属性と`code-line`クラスを削除します。他のクラスと`dir="auto"`は維持します。
- false: コピーするHTMLにこれらのVS Code属性を維持します。

この設定が変更するのはコピーするHTMLだけで、VS Codeプレビューには影響しません。

```md
// Markdown の文章
# テスト
```
```html
<!-- 設定がtrueの場合 -->
<h1 dir="auto">テスト</h1>

<!-- 設定がfalseの場合 -->
<h1 data-line="0" class="code-line" dir="auto">テスト</h1>
```

#### プラグイン設定
##### ON/OFF機能
- `Markdown-it-attrs: Enable`
  - true（デフォルト） : カスタム属性（{#id .class}形式）を指定すると、それをHTMLタグに適用します。
  - false : プラグインは無効になり、カスタムID（{#id}形式）が反映されなくなります。

```md
// Markdown の文章
# テスト {.test}
```
```html
// 設定が true の場合
<h1 class="test">テスト</h1>

// 設定が false の場合
<h1>テスト {.test}</h1>
```

##### 詳細設定
- `Markdown-it-attrs: Options`
  - settings.json で編集: 各プラグインの詳細設定を編集できます

以下がデフォルト設定です。
```json
{
    "leftDelimiter": "{",    // 開始区切り文字
    "rightDelimiter": "}",   // 終了区切り文字
    "allowedAttributes": []  // 許可する属性（表記無しは全て許可）
}
```

### クレジット
VS Code拡張機能で表示されるアイコンは、以下の2つの画像を組み合わせたものです。

| 画像                                                                                                                                                                                          | ライセンス                                                      | 作者/サイト                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [Free Markdown Icon](https://iconscout.com/free-icon/markdown-1)                                                                                                                                  | [MIT ライセンス](https://opensource.org/license/MIT)            | [Benjamin J sperry](https://iconscout.com/contributors/benjamin-j-sperry) / [IconScout](https://iconscout.com/) |
| [クリップのフリーアイコン素材](https://icooon-mono.com/00017-%E3%82%AF%E3%83%AA%E3%83%83%E3%83%97%E3%81%AE%E3%83%95%E3%83%AA%E3%83%BC%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E7%B4%A0%E6%9D%90/) | [icooon-mono独自のライセンス](https://icooon-mono.com/license/) | [icooon-mono](https://icooon-mono.com/)                                                                          |

### 使用しているプラグイン
- [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs)

### 謝辞

このプロジェクトの開発にあたり、以下のオープンソースソフトウェアを参考にさせていただきました。この場を借りて感謝の意を表します。

- [qjebbs/vscode-markdown-extended](https://github.com/qjebbs/vscode-markdown-extended)

追加のライセンス情報については、[NOTICE](https://github.com/yusu79/vscode-markdown-clip/blob/main/NOTICE)ファイルをご覧ください。

