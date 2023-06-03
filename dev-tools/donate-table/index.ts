import parse from 'csv-parse/lib/sync'
import fs from 'fs'

const files = process.argv.slice(2)
const parseAliPay = (csv: Record<string, string>[]) => {
  csv.forEach(item => {
    item.sortKey = Number(new Date(item.创建时间)).toString()
    item.toString = () => {
      let name = ''
      if (item.商品名称 !== '收钱码收款') {
        name += `${item.商品名称} `
      }
      name += `${item.对方名称} ${item.付款备注}`
      return `| ${item.创建时间.replace(/-/g, '.')} | ${name} | ${item.支付宝交易号.substring(
        item.支付宝交易号.length - 4,
      )} | ¥${item['订单金额(元)']} |`
    }
  })
  return csv
}
const parseWeChat = (csv: Record<string, string>[]) => {
  const items = csv
    .filter(item => item.交易类型 === '赞赏码')
    .map(item => ({
      ...item,
      sortKey: Number(new Date(item.交易时间)).toString(),
      toString: () => {
        let name = item.交易对方
        if (name === '/') {
          name = '匿名'
        }
        const noteMatch = item.商品.match(/付款方留言:(.+)/)
        if (noteMatch) {
          name += ` ${noteMatch[1]}`
        }
        if (item.备注.trim() !== '/') {
          name += ` ${item.备注}`
        }
        item.交易单号 = item.交易单号.trim()
        console.log(item, item.交易时间)
        return `| ${item.交易时间.replace(/-/g, '.')} | ${name} | ${item.交易单号.substring(
          item.交易单号.length - 4,
        )} | ${item['金额(元)']} |`
      },
    }))
  return items
}
const items = files
  .map(file => {
    const text = fs.readFileSync(file, { encoding: 'utf-8' })
    const csv = parse(text, { columns: true })
    if (file.includes('支付宝')) {
      return parseAliPay(csv)
    }
    if (file.includes('微信')) {
      return parseWeChat(csv)
    }
    console.warn(`not parse method for ${file}`)
    return []
  })
  .flat()
  .sort((a, b) => parseInt(b.sortKey) - parseInt(a.sortKey))
fs.mkdirSync('dist/', { recursive: true })
fs.writeFileSync('dist/output.md', items.join('\n'))
