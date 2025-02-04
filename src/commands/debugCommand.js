const 
    vscode = require("vscode"),
    extension = require("../../extension");

class DebugCommand extends vscode.Disposable {
    constructor(command) {
        super(() => this.dispose());
        this.command = command;
        this._disposable = vscode.commands.registerCommand(
            command, // コマンドID
            this.executeCatch.bind(this) // 実行される関数
        );
        this._isDisposed = false;
        this._disposables = [];
    }

    // 破棄状態のチェック
    checkDisposed() {
        if (this._isDisposed) {
            throw new Error('既に破棄されたオブジェクトにアクセスしようとしています');
        }
    }

    // リソースの破棄
    dispose() {
        if (this._isDisposed) {
            return;
        }

        this._isDisposed = true;
        
        // 登録された全てのDisposableを破棄
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];

        console.log(this.command+'のリソースを破棄しました');
    }

    // 破棄状態の確認
    isDisposed() {
        return this._isDisposed;
    }

    executeCatch(...args) {
        try {
            let pm = this.execute(...args);
            console.log(this.command+"を実行しました");
            if (pm instanceof Promise) {
                pm.catch(error => this.showEroorPanel(error));
            }
        } catch (error) {
            this.showEroorPanel(error);
        }
    }

    showEroorPanel(error) {
        extension.outputPanel.clear();
        extension.outputPanel.appendLine(this.parseError(error));
        extension.outputPanel.show();
    }


    parseError(error) {        
        if (typeof (error) === "string") {
            return error;
        } else if (error instanceof TypeError || error instanceof Error) {
            let err = error;
            return "エラーメッセージ: " + err.message + '\n' + err.stack;
        } else if (error instanceof Array) {
            let arrs = error;
            return arrs.reduce((p, err) => p + '\n\n' + err.message + '\n' + err.stack, "");
        } else {
            return error.toString();
        }
    }
}

exports.DebugCommand = DebugCommand;
