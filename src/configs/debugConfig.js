const vscode = require("vscode");

class DebugConfig extends vscode.Disposable {
    constructor(extension) {
        super(() => this.dispose());
        this._extensionName = extension;
        this._folderextensions = {};
        this._previousConfig = this.getConfObjects(extension);
        this._disposable = vscode.workspace.onDidChangeConfiguration(async(e) => {
            if (e.affectsConfiguration(this._extensionName)) {
                const newConfig = this.getConfObjects(extension);
                this.detectChanges(this._previousConfig, newConfig);
                this._previousConfig = newConfig;
                const answer = await vscode.window.showInformationMessage(
                    vscode.l10n.t("You need to reload VSCode to apply the settings.\nDo you want to reload?"),
                    vscode.l10n.t("Yes"),
                    vscode.l10n.t("No")
                );
                if (answer === vscode.l10n.t("Yes")) {
                    await vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            }
            this.onChange(e);
            this.getConfObjects(extension);
        });
    }

    detectChanges(oldConfig, newConfig) {
        let hasChanges = false;
        let changes = [];
    
        // 全てのプロパティの変更を確認
        for (const key in newConfig) {
            if (JSON.stringify(oldConfig[key]) !== JSON.stringify(newConfig[key])) {
                hasChanges = true;
                changes.push({
                    key: key,
                    oldValue: oldConfig[key],
                    newValue: newConfig[key]
                });
            }
        }
    
        // 変更がある場合のみ表示
        if (hasChanges) {
            changes.forEach(change => {
                console.log(`\n【設定が変更されました】 ${this._extensionName}.${change.key}:`);
                console.log(`\t旧値: ${JSON.stringify(change.oldValue, null, 2).replace(/\n/g, '\n\t')}`);
                console.log(`\t新値: ${JSON.stringify(change.newValue, null, 2).replace(/\n/g, '\n\t')}`);
                console.log('---');
            });
        }
    }
    

    dispose() { this._disposable && this._disposable.dispose(); }

    getConfObjects(extension) {
        this._extension = vscode.workspace.getConfiguration(extension); 

        this._folders = vscode.workspace.workspaceFolders;
        this._folderextensions = {};

        if (!this._folders) return;
        this._folders.map(folder => this._folderextensions[folder.uri.fsPath] = vscode.workspace.getConfiguration(extension, folder.uri));

        // 設定オブジェクトを複製して返す
        return Object.keys(this._extension).reduce((acc, key) => {
            if (typeof this._extension[key] !== 'function') {
                acc[key] = this._extension.get(key);
            }
            return acc;
        }, {});
    }

    // this.read(propertyName)で設定値を読み込めるようになる
    read(config, ...para) {
        if (!para || !para.length || !para[0]) return this._extension.get(config); 

        let 
            uri = para.shift(),
            folder = vscode.workspace.getWorkspaceFolder(uri);

        if (!folder || !folder.uri) return this._extension.get(config); 
        

        let folderextension = this._folderextensions[folder.uri.fsPath];
        if (!folderextension) {
            folderextension = vscode.workspace.getConfiguration(this._extensionName, folder.uri);
            this._folderextensions[folder.uri.fsPath] = folderextension;
        }

        let 
            folderConfig = folderextension.inspect(config),
            func = undefined,
            configValue = undefined;
        
        if (para.length) func = para.shift();


        
        if (folderConfig.workspaceFolderValue !== undefined) {
            // ワークスペースフォルダ固有値
            configValue = folderConfig.workspaceFolderValue;
        } else if (folderConfig.workspaceValue !== undefined) {
            // ワークスペース固有値
            configValue = folderConfig.workspaceValue;
        } else if (folderConfig.globalValue !== undefined) {
            // グローバル値
            configValue = folderConfig.globalValue;
        } else {
            // デフォルト値
            configValue = folderConfig.defaultValue;
        }


        if ( folder && folder.uri && func) {
            return func(folder.uri, configValue);
        } else {
            return configValue;
        }
    }
}

exports.BaseConfig = DebugConfig;
