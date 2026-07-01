import { createContext } from './context'
import { rules } from './rules'

const context = createContext()
const results = rules.map(rule => rule.check(context))
const errors = results.flatMap(result => result.errors || [])
const warnings = results.flatMap(result => result.warnings || [])

if (warnings.length > 0) {
  console.warn(['PR file check warnings:', ...warnings.map(message => `- ${message}`)].join('\n'))
}

if (errors.length > 0) {
  console.error(['PR file check failed:', ...errors.map(message => `- ${message}`)].join('\n'))
  process.exit(1)
}

console.log('PR file check passed.')
