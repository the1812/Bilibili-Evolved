"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sync_1 = __importDefault(require("csv-parse/lib/sync"));
const fs_1 = __importDefault(require("fs"));
const files = process.argv.slice(2);
const parseAliPay = (csv) => {
    csv.forEach(item => {
        item.sortKey = Number(new Date(item.创建时间)).toString();
        item.toString = () => {
            let name = '';
            if (item.商品名称 !== '收钱码收款') {
                name += item.商品名称 + ' ';
            }
            name += item.对方名称 + ' ' + item.付款备注;
            return `| ${item.创建时间.replace(/-/g, '.')} | ${name} | ${item.支付宝交易号.substring(item.支付宝交易号.length - 4)} | ¥${item['订单金额(元)']} |`;
        };
    });
    return csv;
};
const parseWeChat = (csv) => {
    csv.forEach(item => {
        item.sortKey = Number(new Date(item.交易时间)).toString();
        item.toString = () => {
            let name = item.交易对方;
            const noteMatch = item.商品.match(/付款方留言:(.+)/);
            if (noteMatch) {
                name += ' ' + noteMatch[1];
            }
            if (item.备注.trim() !== '/') {
                name += ' ' + item.备注;
            }
            item.交易单号 = item.交易单号.trim();
            return `| ${item.交易时间.replace(/-/g, '.')} | ${name} | ${item.交易单号.substring(item.交易单号.length - 4)} | ${item['金额(元)']} |`;
        };
    });
    return csv;
};
const items = files.map(file => {
    const text = fs_1.default.readFileSync(file, { encoding: 'utf-8' });
    const csv = sync_1.default(text, { columns: true });
    if (file.includes('支付宝')) {
        return parseAliPay(csv);
    }
    if (file.includes('微信')) {
        return parseWeChat(csv);
    }
    console.warn(`not parse method for ${file}`);
    return [];
}).flat().sort((a, b) => parseInt(b.sortKey) - parseInt(a.sortKey));
fs_1.default.writeFileSync('dist/output.md', items.join('\n'));
