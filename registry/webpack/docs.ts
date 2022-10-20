import path from 'path'
import { builders } from './build'

export default builders.doc().then(configs =>
  configs.map(config => {
    config.output.path = path.resolve('./registry/dist/')
    config.output.filename = 'doc.js'
    return config
  }),
)
