const {BaseConfig} = require("./baseConfig");

class GetConfig extends BaseConfig {
    constructor() {
        super('markdown-clip'); // package.jsonの「configuration」を全て格納
    }

    onChange() {}
    
    // 汎用的なgetメソッド
    get(propertyName) {
        return this.read(propertyName);
    }
}

exports.GetConfig = new GetConfig();
