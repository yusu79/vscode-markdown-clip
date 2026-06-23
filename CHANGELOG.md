# Change Log

## v1.1.0 - 2026-06-23

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

---

## v1.0.8 - 2025-12-15
- Security: update glob dependency to a patched version

- セキュリティ対応: glob の依存関係を修正済みバージョンへ更新

## v1.0.7 - 2025-02-12
- Change default setting of Remove Heading ID to 'false'

## v1.0.5 - 2025-02-10
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


## v1.0.0
- Initial release
