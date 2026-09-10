# Changelog
すべての重要な変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づき、
バージョニングは [Semantic Versioning](https://semver.org/lang/ja/) を採用しています。

変更の種類
- Added         新機能
- Changed       既存機能の変更
- Deprecated    間もなく削除される機能
- Removed       今回で削除された機能
- Fixed         不具合修正
- Security      脆弱性に関する報告

バージョン X.Y.Z
- X メジャーバージョン      パブリックAPIに対して後方互換性を持たない変更
- Y マイナーバージョン      後方互換性を保ちつつ機能性をパブリックAPIに追加した場合
- Z パッチバージョン        後方互換性を保ったバグ修正を取り込んだ場合


---

## [1.2.0] - 2026-09-10

### Added

* Pass parsed document Front Matter to Markdown-it plugins through `env.frontmatter` for both full-document and selection conversions
* Show warnings when an explicit heading ID is duplicated in the same Markdown document

### Changed

* Apply heading ID and VS Code attribute cleanup only to HTML copied by Markdown Clip, without changing the VS Code preview
* Enable removal of automatic heading IDs, `data-line` attributes, and `code-line` classes by default
* Preserve explicit heading IDs assigned by Markdown-it plugins and prefer them over automatic heading IDs
* Combine the English and Japanese documentation into one README with in-page language links
* Strengthen the release workflow with tests, tag/version validation, fixed local publishing tools, and package-content exclusions

### Removed

* Remove the VS Code Mermaid configuration span from copied HTML
* Remove the unused VS Code extension quickstart document

### Fixed

* Isolate Markdown-it `env` and cloned Front Matter data for every conversion so plugin changes do not leak across renders or documents
* Handle missing, empty, and `null` Front Matter consistently
* Prevent copied headings from containing both explicit and automatic `id` attributes

### Security

* Update runtime and development dependencies, including security fixes and newer `js-yaml` and `linkify-it` versions

### 追加

* 全文変換と選択範囲変換の両方で、解析済みの文書Front Matterを`env.frontmatter`としてMarkdown-itプラグインへ渡す機能を追加
* 同じMarkdown文書内で見出しの明示IDが重複した場合に警告を表示する機能を追加

### 変更

* 見出しIDとVS Code属性の整理をMarkdown ClipがコピーするHTMLだけに適用し、VS Codeプレビューを変更しない方式へ変更
* 自動見出しID、`data-line`属性、`code-line`クラスの削除をデフォルトで有効化
* Markdown-itプラグインが付けた明示見出しIDを維持し、自動見出しIDより優先するよう変更
* 英語と日本語の説明を1つのREADMEへ統合し、ページ内の言語切替リンクを追加
* 公開前テスト、タグとバージョンの照合、固定したローカル公開ツールの使用、パッケージ対象の除外によりリリースworkflowを強化

### 削除

* コピーHTMLからVS CodeのMermaid設定用spanを削除
* 未使用のVS Code拡張機能クイックスタート文書を削除

### 修正

* 変換ごとにMarkdown-itの`env`と複製したFront Matterを分離し、プラグインによる変更が別の描画や文書へ漏れないよう修正
* Front Matterの欠落、空、`null`を一貫して処理するよう修正
* コピーした見出しへ明示IDと自動IDの両方が出力されないよう修正

### セキュリティ

* セキュリティ修正と`js-yaml`・`linkify-it`の更新を含む、実行時・開発用依存関係の更新


## [1.1.0] - 2026-06-23

### Changed

* Replace the `copy-paste` dependency with the native VS Code clipboard API (`vscode.env.clipboard.writeText`)
* Remove callback-based clipboard handling and use Promise-based processing

### Fixed

* Fix missing success notification after clipboard copy
* Fix YAML parsing errors when metadata is empty
* Update Japanese localization messages

### 変更

* `copy-paste` 依存を廃止し、ネイティブの VS Code クリップボード API (`vscode.env.clipboard.writeText`) へ移行
* コールバックベースのクリップボード処理を削除し、Promise ベースの処理へ変更

### 修正

* クリップボードコピー後に成功通知が表示されない問題を修正
* YAML メタデータが空の場合に発生するパースエラーを修正
* クリップボード関連の日本語翻訳を更新


## [1.0.8] - 2025-12-15
- Security: update glob dependency to a patched version

- セキュリティ対応: glob の依存関係を修正済みバージョンへ更新

## [1.0.7] - 2025-02-12
- Change default setting of Remove Heading ID to 'false'

## [1.0.5] - 2025-02-10
- Enhance Markdown processing and attribute handling
    - Add option to remove auto-generated heading IDs
    - Introduce functionality to remove VSCode-specific attributes
- Optimization of text expressions for both Japanese and English languages
   - User guidance messages during extension reload
   - Context menu
   - Functional description of the clip icon

- Markdownの処理と属性の取り扱いを強化
  - 自動生成された見出しIDを削除するオプションを追加
  - VSCode固有の属性を削除する機能を導入
- 日本語と英語の両言語に対応した文章表現の最適化
   - 拡張機能リロード時におけるユーザーガイダンスメッセージ
   - コンテキストメニュー
   - クリップアイコンの機能説明


## [1.0.0]
- Initial release
