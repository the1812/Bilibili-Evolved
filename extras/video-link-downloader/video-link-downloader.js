"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commandLineArgs = require("command-line-args");
const clipboardy = require("clipboardy");
const downloadFile = async (url) => {
};
(async () => {
    const optionDefinitions = [
        { name: 'parts', alias: 'p', type: Number, defaultValue: 30 },
        { name: 'output', alias: 'o', type: String, defaultValue: '' },
    ];
    const options = commandLineArgs(optionDefinitions);
    const urls = (await clipboardy.read()).split("\n").map(it => it.trim());
    process.on("SIGINT", () => {
        console.log("break");
        process.exit();
    });
    console.log(urls);
    console.log(options);
    urls.forEach(url => downloadFile(url));
})();
