# Markdown Clip
![GitHub License](https://img.shields.io/github/license/vscode-markdown-clip/yusu79/)
![Visual Studio Marketplace Version (including pre-releases)](https://img.shields.io/visual-studio-marketplace/v/yusu79.vscode-markdown-clip)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/yusu79.vscode-markdown-clip)

A VSCode extension that provides functionality to convert Markdown to HTML and copy it to the clipboard.

- [Setup](#setup)
- [Features](#features)
- [Usage](#usage)
- [Description](#description)
- [Settings](#settings)
- [Credits](#credits)
- [Used Plugins](#used-plugins)
- [Acknowledgments](#acknowledgments)

## Setup
Enter "Markdown Clip" in the VScode marketplace.

<div style="text-align: center;"><img src="icons/setup.png" width="70%"/></div>

## Features
- Convert selected Markdown text to HTML
- Convert entire file if no text is selected
- Automatically copy converted HTML to clipboard
- Quick conversion with keyboard shortcut (<kbd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd></kbd>)

## Usage
1. Open a Markdown file
2. Select the text to convert (optional)
3. Execute the command using any method<sup>*</sup>
4. HTML will be copied to your clipboard

*There are 4 ways to execute the command:

- Run "Copy as HTML" from the command palette
- Run "Copy as HTML" from the right-click menu
- Press <kbd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd></kbd>
- Click the clip icon displayed in the top menu

## Description
"Markdown Clip" is a VScode extension that renders Markdown to HTML using `markdown-it`. Its key feature is the ability to convert to HTML while reflecting installed "markdown-it plugins" through the extension.

For example, "[Markdown MojiColor](https://marketplace.visualstudio.com/items?itemName=yusu79.markdown-mojicolor)" is an extension that allows easy color specification using `%text%{color}` notation. When you execute "Clip as HTML" on Markdown with colors set through this feature, it will be properly reflected in the HTML.

```md:Extension is reflected in HTML
%text%{skyblue} // Before conversion
<p><span style="color: #a0d8ef;">text</span></p> // After conversion
```

Thus, Markdown Clip is a **tool that can convert Markdown to HTML and copy to clipboard while reflecting any plugins**.

## Settings

### 1. Heading ID Control
`Heading ID: Remove`: Controls automatic ID generation for headings (Default: true)
- true: Remove automatically generated IDs
- false: Keep IDs

"Markdown Clip" uses markdown-it to render HTML. For example, when rendering `# Title`, it automatically generates an id like `<h1 id="title">Title</h1>`.

```md:Heading ID Control (false)
# Title // Before conversion
<h1 id="title">Title</h1> // After conversion
```

This auto-generated title can be problematic for users of non-English languages, particularly when using Markdown as a draft for WordPress posts.

Therefore, we added a setting to turn off this feature (default is true).

```md:Heading ID Control (true)
# Title // Before conversion
<h1>Title</h1> // After conversion
```

### 2. Custom ID Control
`Markdown-it-attrs: Enable`: Enable custom ID functionality (Default: true)
- true: Controls processing of Markdown syntax `{#customID}`
  - Hidden during preview and HTML output

`markdown-it-attrs` is automatically installed. This plugin allows adding custom IDs to HTML tags using `{#customID}`.

```md:
# Title{#custom-id} // Before conversion
<h1 id="custom-id">Title</h1> // After conversion
```

### 3. Plugin Settings
`Markdown-it-attrs: Options`: Detailed settings for custom ID plugin
```json
{
    "leftDelimiter": "{",    // Opening delimiter
    "rightDelimiter": "}",   // Closing delimiter
    "allowedAttributes": ["id","class"]  // Allowed attributes
}
```

You can specify option settings for `markdown-it-attrs`. By default it's `{#customID}`, but you can assign any symbol by setting `"leftDelimiter": "「"` to use something like `「#customID}`.

## Credits
The icon displayed in the VScode extension is a combination of these two images:

| Image | License | Author/Site |
|-------|---------|-------------|
| [Markdown](https://iconscout.com/free-icon/markdown-486861) | [MIT License](https://opensource.org/license/MIT) | [Benjamin J sperry](https://iconscout.com/contributors/benjamin-j-sperry) / [IconScout](https://iconscout.com/) |
| [Clip Free Icon Material](https://icooon-mono.com/00017-%E3%82%AF%E3%83%AA%E3%83%83%E3%83%97%E3%81%AE%E3%83%95%E3%83%AA%E3%83%BC%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E7%B4%A0%E6%9D%90/) | [icooon-mono License](https://icooon-mono.com/license/) | [icooon-mono](https://icooon-mono.com/) |

## Used Plugins
- [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs)

## Acknowledgments

In developing this project, we referenced the following open source software. We would like to express our gratitude:

- [qjebbs/vscode-markdown-extended](https://github.com/qjebbs/vscode-markdown-extended)
