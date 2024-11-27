"use strict";
const yaml = require("js-yaml");// YAML形式からJSON形式に変更するため
class MetaData {
    constructor(meta, uri) {
        this._meta = yaml.load(meta) || {};// 「---」から「---」までをYAMLからJSONに変えた文章
        this._uri = uri;
    }

    get puppeteerPDF() {// 「---」から「---」までの､「puppeteer:」以下の「pdf:」以下を取得
        if (!this._meta.puppeteer || !this._meta.puppeteer.pdf) return {};
        else return this._meta.puppeteer.pdf;
    }

    get puppeteerImage() {// 「---」から「---」までの､「puppeteer:」以下の「image:」以下を取得
        if (!this._meta.puppeteer || !this._meta.puppeteer.image) return {};
        else return this._meta.puppeteer.image;
    }

    get all() {
        return this._meta;// 「---」から「---」までをYAMLからJSONに変えた文章全てを取得
    }
}
exports.MetaData = MetaData;
