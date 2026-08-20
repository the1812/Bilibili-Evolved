import { createContext } from './context'
import { rules } from './rules'

const context = createContext()
const results = rules.map(rule => rule.check(context))
const errors = results.flatMap(result => result.errors || [])
const warnings = results.flatMap(result => result.warnings || [])

type AnnotationLevel = 'warning' | 'error'

const escapeWorkflowCommand = (message: string) =>
  message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')

const report = (level: AnnotationLevel, heading: string, messages: string[]) => {
  if (messages.length === 0) {
    return
  }
  console.log([heading, ...messages.map(message => `- ${message}`)].join('\n'))
  if (process.env.GITHUB_ACTIONS === 'true') {
    messages.forEach(message => {
      console.log(`::${level} title=PR file check::${escapeWorkflowCommand(message)}`)
    })
  }
}

report('warning', 'PR file check warnings:', warnings)

if (errors.length > 0) {
  report('error', 'PR file check failed:', errors)
  process.exitCode = 1
} else {
  console.log('PR file check passed.')
}
