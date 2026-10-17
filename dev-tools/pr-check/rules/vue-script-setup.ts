import { Linter } from 'eslint'
import vuePlugin from 'eslint-plugin-vue'
import * as vueParser from 'vue-eslint-parser'
import { readFileSync } from 'fs'
import { CheckRule } from '../types'

const linter = new Linter()
linter.defineParser('vue-eslint-parser', vueParser)
linter.defineRule('vue/component-api-style', vuePlugin.rules['component-api-style'])
linter.defineRule('vue/no-restricted-syntax', vuePlugin.rules['no-restricted-syntax'])

export const vueScriptSetupRule: CheckRule = {
  name: 'vue-script-setup',
  check: ({ changedFiles }) => ({
    errors: changedFiles
      .filter(file => file.status === 'A' && file.path.endsWith('.vue'))
      .flatMap(file =>
        linter
          .verify(
            readFileSync(file.path, 'utf8'),
            {
              parser: 'vue-eslint-parser',
              parserOptions: {
                parser: '@typescript-eslint/parser',
                ecmaVersion: 2020,
                sourceType: 'module',
              },
              rules: {
                'vue/component-api-style': ['error', ['script-setup']],
                'vue/no-restricted-syntax': [
                  'error',
                  {
                    selector:
                      'VElement[parent.type="VDocumentFragment"][name="script"]:not(:has(VAttribute[key.name="setup"]))',
                    message: 'New Vue components must use <script setup>.',
                  },
                ],
              },
            },
            { filename: file.path, allowInlineConfig: false },
          )
          .map(message => `${file.path}:${message.line}:${message.column}: ${message.message}`),
      ),
  }),
}
