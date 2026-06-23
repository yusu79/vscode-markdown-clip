"use strict";
const yaml = require("js-yaml");// YAML形式からJSON形式に変更するため
class MetaData {
    constructor(meta, uri) {
        this._meta = !meta || !meta.trim()
            ? {}
            : yaml.load(meta);

        this._uri = uri;
    }
}
exports.MetaData = MetaData;
