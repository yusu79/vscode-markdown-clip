# VS Code 拡張機能へようこそ

## フォルダの内容

- このフォルダには、拡張機能に必要なすべてのファイルが含まれています。
- `package.json`
  - これは、拡張機能とコマンドを宣言するマニフェストファイルです。
  - サンプルプラグインは、コマンドを登録し、そのタイトルとコマンド名を定義します。この情報により、VS Codeはコマンドパレットにコマンドを表示できます。まだプラグインを読み込む必要はありません。
- `extension.js` 
  - これは、コマンドの実装を提供するメインファイルです。
  - このファイルは、拡張機能が最初にアクティブ化されたときに呼び出される`activate`関数をエクスポートします。`activate`関数の中の`registerCommand`を呼び出します。
  - コマンドの実装を含む関数を、`registerCommand`の第2パラメータとして渡します。

## すぐに始めましょう

- `F5`を押して、拡張機能が読み込まれた新しいウィンドウを開きます。
- `Ctrl+Shift+P`を押してコマンドパレットからコマンドを実行し、`Hello World`と入力します。
- `extension.js`内のコードにブレークポイントを設定して、拡張機能をデバッグします。
- デバッグコンソールで拡張機能からの出力を確認します。

## 変更を加える

- `extension.js`のコードを変更した後、デバッグツールバーから拡張機能を再起動できます。
- VS Codeウィンドウをリロード(`Ctrl+R`)して、変更を読み込むこともできます。

## APIを探る

- `node_modules/@types/vscode/index.d.ts`ファイルを開くと、完全なAPI一式を確認できます。

## テストを実行する

- デバッグビューレット(`Ctrl+Shift+D`)を開き、起動構成ドロップダウンから`Extension Tests`を選択します。
- `F5`を押して、拡張機能が読み込まれた新しいウィンドウでテストを実行します。
- デバッグコンソールでテスト結果の出力を確認します。
- `src/test/suite/extension.test.js`を変更するか、`test/suite`フォルダ内に新しいテストファイルを作成します。
  - 提供されたテストランナーは、名前パターン`**.test.ts`に一致するファイルのみを考慮します。
  - `test`フォルダ内にフォルダを作成して、任意の方法でテストを構造化できます。

## さらに進む

 - [UXガイドライン](https://code.visualstudio.com/api/ux-guidelines/overview)に従って、VS Codeのネイティブインターフェースとパターンにシームレスに統合される拡張機能を作成します。
 - VS Code拡張機能マーケットプレイスで[拡張機能を公開](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)します。
 - [継続的インテグレーション](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)を設定して、ビルドを自動化します。
