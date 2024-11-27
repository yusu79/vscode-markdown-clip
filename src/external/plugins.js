const {GetConfig} = require("../configs/getConfig");

exports.plugins = [
    $('markdown-it-attrs'), // プレビューから{}部分を削除する
].filter(p => !!p);

function $(name) {
    let 
        pluginEnable = name + ".enable",
        pluginOptions = name + ".options",
        options
    
    if (!GetConfig.get(pluginEnable)) {
        return undefined
    }

    if (GetConfig.get(pluginOptions)) {
        options = GetConfig.get(pluginOptions)
    }

    return {
        plugin: name,
        options: options,
    };
}
