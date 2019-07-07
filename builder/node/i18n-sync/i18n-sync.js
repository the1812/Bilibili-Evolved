"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
class LanguageKeys {
    constructor(mapKeys, regexKeys) {
        this.mapKeys = mapKeys;
        this.regexKeys = regexKeys;
    }
    diff(other) {
        return new LanguageKeys(this.mapKeys.filter(it => !other.mapKeys.includes(it)), this.regexKeys.filter(it => !other.regexKeys.includes(it)));
    }
}
const readFile = (filename) => fs_1.readFileSync(filename, { encoding: 'utf-8' });
const config = JSON.parse(readFile('i18n-sync.json'));
const extractKeys = (language) => {
    let temp = null;
    const mapKeys = [];
    const mapRegex = /\[`(.+?)`,/g;
    while (temp = mapRegex.exec(language)) {
        mapKeys.push(temp[1]);
    }
    const regexKeys = [];
    const regexRegex = /\[(\/.*\/[a-z]*),/g;
    while (temp = regexRegex.exec(language)) {
        regexKeys.push(temp[1]);
    }
    return new LanguageKeys(mapKeys, regexKeys);
};
const mainLanguageKey = extractKeys(readFile(path_1.join(config.folder, `i18n.${config.mainLanguage}.js`)));
const targetLanguages = config.targetLanguages.map(name => {
    const path = path_1.join(config.folder, `i18n.${name}.js`);
    return {
        name,
        path,
        text: readFile(path)
    };
});
targetLanguages.forEach(language => {
    const diff = mainLanguageKey.diff(extractKeys(language.text));
    const output = language.text
        .replace(/([\s\n]*\[`\*`)/, `\n  ${diff.mapKeys.map(k => '[`' + k + '`, `TODO:`],').join('\n  ')}$1`)
        .replace(/(\]\);?[\s\n]*export default)/, `  ${diff.regexKeys.map(k => '[' + k + ', `TODO:`],').join('\n  ')}\n$1`);
    fs_1.writeFileSync(language.path, output, { encoding: 'utf-8' });
});
