#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commandLineArgs = require("command-line-args");
const clipboardy = require("clipboardy");
const request = require("request");
const fs = require("fs");
const ProgressBar = require("progress");
const optionDefinitions = [
    { name: 'info', alias: 'i', defaultOption: true, type: String, defaultValue: undefined },
    { name: 'parts', alias: 'p', type: Number, defaultValue: 30 },
    { name: 'output', alias: 'o', type: String, defaultValue: '.' },
];
const commandLineOptions = commandLineArgs(optionDefinitions);
let options = commandLineOptions;
// if (fs.existsSync("settings.json"))
// {
//     const jsonOptions = JSON.parse(fs.readFileSync("settings.json").toString("utf-8")) as Settings;
//     options = Object.assign(jsonOptions, options);
// }
if (options.parts < 1) {
    console.error("分段数不能小于1");
    process.exit();
}
class Downloader {
    constructor(inputData, progress) {
        this.inputData = inputData;
        this.progress = progress;
        this.progressMap = new Map();
    }
    updateProgress() {
        const progress = this.progressMap ?
            [...this.progressMap.values()].reduce((a, b) => a + b, 0) / this.inputData.totalSize : 0;
        this.progress && this.progress(progress);
    }
    cancelDownload() {
        [...this.progressMap.keys()].forEach(it => it.abort());
        const files = fs.readdirSync(".");
        const parts = files.filter(it => it.includes(this.inputData.title));
        parts.forEach(file => fs.unlinkSync(file));
        console.log("已取消下载");
    }
    async downloadUrl(url, index = -1) {
        const partialLength = Math.round(this.inputData.totalSize / options.parts);
        const title = (index === -1 ? this.inputData.title : this.inputData.title + " - " + index.toString());
        let startByte = 0;
        let part = 0;
        const promises = [];
        while (startByte < this.inputData.totalSize) {
            const endByte = Math.min(this.inputData.totalSize - 1, Math.round(startByte + partialLength));
            const range = `bytes=${startByte}-${endByte}`;
            promises.push(new Promise((resolve, reject) => {
                const makeRequest = () => {
                    const req = request({
                        url,
                        method: "GET",
                        headers: {
                            Range: range,
                            Origin: "https://www.bilibili.com",
                            Referer: "https://www.bilibili.com",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
                        },
                    }).on("complete", response => {
                        if (response.statusCode.toString()[0] === "2") {
                            resolve(response);
                        }
                        else {
                            reject(`请求失败`);
                        }
                    }).on("data", data => {
                        this.progressMap.set(req, this.progressMap.get(req) + data.length);
                        this.updateProgress();
                    }).on("error", error => {
                        this.progressMap.set(req, 0);
                        this.updateProgress();
                        // makeRequest();
                        console.error(error);
                    });
                    req.pipe(fs.createWriteStream(`${title}.part${part}`));
                    return req;
                };
                this.progressMap.set(makeRequest(), 0);
            }));
            startByte = Math.round(startByte + partialLength) + 1;
            part++;
        }
        await Promise.all(promises);
        const dest = title + ".flv";
        console.log("正在合并文件...");
        if (options.parts === 1) {
            fs.renameSync(title + ".part0", dest);
        }
        else {
            if (fs.existsSync(dest)) {
                fs.unlinkSync(dest);
            }
            const files = fs.readdirSync(".");
            const parts = files.filter(it => it.includes(title + ".part"));
            const partRegex = /.*\.part([\d]+)/;
            parts.sort((a, b) => {
                const partA = parseInt(a.replace(partRegex, "$1"));
                const partB = parseInt(b.replace(partRegex, "$1"));
                return partA - partB;
            }).forEach(file => {
                const buffer = fs.readFileSync(file);
                fs.appendFileSync(dest, buffer);
            });
            parts.forEach(file => fs.unlinkSync(file));
        }
        return dest;
    }
    async download() {
        if (this.inputData.urls.length === 1) {
            return await this.downloadUrl(this.inputData.urls[0]);
        }
        else {
            return await Promise.all(this.inputData.urls.map((url, i) => this.downloadUrl(url, i)));
        }
    }
}
(async () => {
    // console.log(`分段值: ${options.parts}`);
    let jsonText = '';
    if (fs.existsSync(options.info)) {
        jsonText = fs.readFileSync(options.info).toString("utf-8");
    }
    else {
        jsonText = await clipboardy.read();
    }
    let inputData = { urls: [], totalSize: 0, title: '' };
    try {
        inputData = JSON.parse(jsonText);
    }
    catch (error) {
        console.log(`未在剪贴板检测到有效数据, 也没有指定输入文件.`);
        process.exit();
    }
    try {
        process.chdir(options.output);
        const progressBar = new ProgressBar(":percent [:bar]", {
            total: inputData.totalSize,
            width: 20,
            incomplete: ' ',
        });
        const downloader = new Downloader(inputData, progress => {
            progressBar.update(progress);
        });
        process.on("SIGINT", () => {
            progressBar.terminate();
            downloader.cancelDownload();
            process.exit();
        });
        progressBar.render();
        const result = await downloader.download();
        console.log(`下载完成: `);
        if (typeof result === "string") {
            console.log(result);
        }
        else {
            result.forEach(console.log);
        }
    }
    catch (error) {
        console.error(`错误: ${error}`);
    }
})();
