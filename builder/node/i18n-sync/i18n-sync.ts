import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Config {
  folder: string
  mainLanguage: string
  targetLanguages: string[]
}
class LanguageKeys {
  constructor(
    public mapKeys: string[],
    public regexKeys: string[]
  ) { }
  diff(other: LanguageKeys) {
    return new LanguageKeys(
      this.mapKeys.filter(it => !other.mapKeys.includes(it)),
      this.regexKeys.filter(it => !other.regexKeys.includes(it))
    )
  }
}

const readFile = (filename: string) => readFileSync(filename, { encoding: 'utf-8' })
const config = JSON.parse(readFile('i18n-sync.json')) as Config

const extractKeys = (language: string) => {
  let temp = null
  const mapKeys = []
  const mapRegex = /\[`(.+?)`,/g
  while (temp = mapRegex.exec(language)) {
    mapKeys.push(temp[1])
  }
  const regexKeys = []
  const regexRegex = /\[(\/.*\/[a-z]*),/g
  while (temp = regexRegex.exec(language)) {
    regexKeys.push(temp[1])
  }
  return new LanguageKeys(mapKeys, regexKeys)
}

const mainLanguageKey = extractKeys(readFile(join(config.folder, `i18n.${config.mainLanguage}.js`)))
const targetLanguages = config.targetLanguages.map(name => {
  const path = join(config.folder, `i18n.${name}.js`)
  return {
    name,
    path,
    text: readFile(path)
  }
})
targetLanguages.forEach(language => {
  const diff = mainLanguageKey.diff(extractKeys(language.text))
  const output = language.text
    .replace(/([\s\n]*\[`\*`)/, `\n  ${diff.mapKeys.map(k => '[`' + k + '`, `TODO:`],').join('\n  ')}$1`)
    .replace(/(\]\);?[\s\n]*export default)/, `  ${diff.regexKeys.map(k => '[' + k + ', `TODO:`],').join('\n  ')}\n$1`)
  writeFileSync(language.path, output, { encoding: 'utf-8' })
})