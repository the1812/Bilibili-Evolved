import { ClientRequest } from "http";
import commandLineArgs = require("command-line-args");
import clipboardy = require("clipboardy");

interface InputData
{
    urls: string[];
    title: string;
    totalSize: number;
}

const optionDefinitions = [
    { name: 'parts', alias: 'p', type: Number, defaultValue: 30 },
    { name: 'output', alias: 'o', type: String, defaultValue: '' },
];
const options = commandLineArgs(optionDefinitions) as { parts: number, output: string };
process.on("SIGINT", () =>
{
    console.log("break");
    process.exit();
});

const downloadFile = async (inputData: InputData) =>
{
    const partialLength = Math.round(inputData.totalSize / options.parts);

};
(async () =>
{
    console.log(options);
    const jsonText = await clipboardy.read();
    try
    {
        const inputData = JSON.parse(jsonText) as InputData;
        await downloadFile(inputData);
    }
    catch (error)
    {
        console.error(`未在剪贴板找到足够的数据: ${error}`);
    }
})();