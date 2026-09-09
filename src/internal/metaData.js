"use strict";
const yaml = require("js-yaml");// YAML形式からJSON形式に変更するため
class MetaData {
    constructor(meta, uri) {
        const data = !meta || !meta.trim()
            ? {}
            : yaml.load(meta);

        this._meta = data == null ? {} : data;

        this._uri = uri;
    }
    get data() {
        return this._meta;
    }
}
exports.MetaData = MetaData;
