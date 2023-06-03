import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import { basename, dirname, extname, join, resolve } from 'path'
import { stringify } from 'yaml'

const jsonFiles = glob.sync('./.github-json/data/**/*.json')
const changeExtension = (path: string, extension: string) => {
  const fileName = basename(path, extname(path))
  return join(dirname(path), fileName + extension)
}
const transformPath = (sourcePath: string) => {
  const path = resolve(sourcePath).replace(resolve('./.github-json/data'), resolve('./.github'))
  return changeExtension(path, '.yml')
}
jsonFiles.forEach(jsonFile => {
  const json = JSON.parse(readFileSync(jsonFile, { encoding: 'utf-8' }))
  const yaml = stringify(json, {
    nullStr: '',
    doubleQuotedMinMultiLineLength: Infinity,
    lineWidth: 0,
    minContentWidth: 0,
  })
  const yamlFile = transformPath(jsonFile)
  // console.log(`${jsonFile} -> ${yamlFile}`)
  writeFileSync(yamlFile, yaml)
})
