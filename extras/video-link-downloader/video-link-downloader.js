"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commandLineArgs = require("command-line-args");
const clipboardy = require("clipboardy");
const request = require("request");
const fs = require("fs");
const optionDefinitions = [
    { name: 'parts', alias: 'p', type: Number, defaultValue: 30 },
];
const options = commandLineArgs(optionDefinitions);
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
        console.log("已取消下载");
    }
    async downloadUrl(url, index = -1) {
        const partialLength = Math.round(this.inputData.totalSize / options.parts);
        console.log(partialLength);
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
                    req.pipe(fs.createWriteStream(`${this.inputData.title}.part${part}`));
                    return req;
                };
                this.progressMap.set(makeRequest(), 0);
            }));
            startByte = Math.round(startByte + partialLength) + 1;
            part++;
        }
        await Promise.all(promises);
        const dest = (index === -1 ? this.inputData.title : this.inputData.title + " - " + index.toString()) + ".flv";
        await new Promise(resolve => {
            fs.readdir(".", (_, files) => {
                const parts = files.filter(it => it.includes(this.inputData.title));
                const data = parts.map(file => fs.readFileSync(file));
                const stream = fs.createWriteStream(dest);
                data.forEach(it => stream.write(it));
                stream.close();
                parts.forEach(file => fs.unlinkSync(file));
                resolve();
            });
        });
    }
    async download() {
        if (this.inputData.urls.length === 1) {
            await this.downloadUrl(this.inputData.urls[0]);
        }
        else {
            await Promise.all(this.inputData.urls.map((url, i) => this.downloadUrl(url, i)));
        }
    }
}
(async () => {
    console.log(options);
    const jsonText = await clipboardy.read();
    try {
        const inputData = JSON.parse(jsonText);
        const downloader = new Downloader(inputData, progress => {
            console.log((progress * 100).toFixed(2) + "%");
        });
        process.on("SIGINT", () => {
            downloader.cancelDownload();
            process.exit();
        });
        await downloader.download();
    }
    catch (error) {
        console.error(`未在剪贴板找到足够的数据: ${error}`);
    }
})();
