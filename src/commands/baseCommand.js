const 
    vscode = require("vscode"),
    extension = require("../../extension");


class BaseCommand extends vscode.Disposable {
    constructor(command) {
        super(() => this.dispose());
        this.command = command;
        this._disposable = vscode.commands.registerCommand(
            command, // コマンドID
            this.executeCatch.bind(this) // 実行される関数
        );
    }

    dispose() { this._disposable && this._disposable.dispose(); }// 短絡評価（左側がfalseなら、右側は評価されずに飛ばされる）

    executeCatch(...args) {
        try {
            let pm = this.execute(...args);
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
            return "Error message: " + err.message + '\n' + err.stack;
        } else if (error instanceof Array) {
            let arrs = error;
            return arrs.reduce((p, err) => p + '\n\n' + err.message + '\n' + err.stack, "");
        } else {
            return error.toString();
        }
    }
}

exports.BaseCommand = BaseCommand;
