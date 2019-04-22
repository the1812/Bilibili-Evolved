//@ts-check
const fs = require("fs");

const title = "【2019·东方华灯宴】 - 九天共开怀";
const dest = title + ".flv";

const files = fs.readdirSync(".");
const parts = files.filter(it => it.includes(title + ".part"));
const partRegex = /.*\.part([\d]+)/;
parts.sort((a, b) =>
{
    const partA = parseInt(a.replace(partRegex, "$1"));
    const partB = parseInt(b.replace(partRegex, "$1"));
    return partA - partB;
}).forEach(file =>
{
    const buffer = fs.readFileSync(file);
    fs.appendFileSync(dest, buffer);
});
console.log("end");