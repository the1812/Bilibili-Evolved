import { getDefaultDanmakuConverterConfig, DanmakuConverter } from './danmaku-converter'
import { readFileSync, writeFileSync } from 'fs';

const config = getDefaultDanmakuConverterConfig('test')
const input = 'test.xml'
const output = 'test.ass'

const converter = new DanmakuConverter(config)
const xml = readFileSync(input, { encoding: 'utf8' })
const ass = converter.convertToAssDocument(xml).generateAss()
writeFileSync(output, ass)
