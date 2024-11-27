const vscode = require("vscode");

class DebugConfig extends vscode.Disposable {
    constructor(configSection) {
        super(() => this.dispose());
        this._configSectionName = configSection;
        this._folderConfigSections = {};
        this._previousConfig = this.getConfObjects(configSection);
        this._disposable = vscode.workspace.onDidChangeConfiguration(async(e) => {
            if (e.affectsConfiguration(this._configSectionName)) {
                const newConfig = this.getConfObjects(configSection);
                this.detectChanges(this._previousConfig, newConfig);
                this._previousConfig = newConfig;
                const answer = await vscode.window.showInformationMessage(
                    '設定を反映するにはVSCodeをリロードする必要があります。リロードしますか？',
                    'はい', 'いいえ'
                );
                if (answer === 'はい') {
                    await vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            }
            this.onChange(e);
            this.getConfObjects(configSection);
        });
    }

    detectChanges(oldConfig, newConfig) {
        // 全てのプロパティの変更を確認
        for (const key in newConfig) {
            if (oldConfig[key] !== newConfig[key]) {
                console.log(`\n設定が変更されました: ${this._configSectionName}.${key}`);
                console.log(`\t旧値: ${oldConfig[key]}`);
                console.log(`\t新値: ${newConfig[key]}`);
            }
        }
    }

    dispose() { this._disposable && this._disposable.dispose(); }

    getConfObjects(configSection) {
        this._configSection = vscode.workspace.getConfiguration(configSection); 
        // 〇〇.config 全てを取得する
        // "contributes":{ 
        //    "configuration": { 
        //      "type": "object",
        //      "title": "〇〇 Configuration",
        //      "properties": {
        //          "〇〇.config1": {}, 
        //          "〇〇.config2": {},
        //                  :,
        //      } 
        // }

        this._folders = vscode.workspace.workspaceFolders;
        this._folderConfigSections = {};

        if (!this._folders) return;
        this._folders.map(folder => this._folderConfigSections[folder.uri.fsPath] = vscode.workspace.getConfiguration(configSection, folder.uri));

        // 設定オブジェクトを複製して返す
        return Object.keys(this._configSection).reduce((acc, key) => {
            if (typeof this._configSection[key] !== 'function') {
                acc[key] = this._configSection.get(key);
            }
            return acc;
        }, {});
    }

    // 子classがthis.read(propertyName)でコンフィグを読み込めるようになる
    read(config, ...para) {
        if (!para || !para.length || !para[0]) return this._configSection.get(config); 

        let 
            uri = para.shift(),
            folder = vscode.workspace.getWorkspaceFolder(uri);

        if (!folder || !folder.uri) return this._configSection.get(config); 
        

        let folderConfigSection = this._folderConfigSections[folder.uri.fsPath];
        if (!folderConfigSection) {
            folderConfigSection = vscode.workspace.getConfiguration(this._configSectionName, folder.uri);
            this._folderConfigSections[folder.uri.fsPath] = folderConfigSection;
        }

        let 
            folderConfig = folderConfigSection.inspect(config),
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

exports.DebugConfig = DebugConfig;
