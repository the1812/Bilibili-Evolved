import { builders } from './build'
import path from 'path'

export default builders.doc().then(configs => {
  return configs.map(config => {
    config.output.path = path.resolve(`./registry/dist/`)
    config.output.filename = 'doc.js'
    return config
  })
})
