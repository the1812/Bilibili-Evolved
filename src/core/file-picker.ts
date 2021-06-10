let input: HTMLInputElement
let lastPromiseResolve: (files: File[]) => void

const defaultConfig = {
  accept: '*',
  multiple: false,
}
/** 打开文件选择 */
export const pickFile = async (config: Partial<typeof defaultConfig> = defaultConfig) => {
  const { accept, multiple } = { ...defaultConfig, ...config }
  if (!input) {
    input = document.createElement('input')
    input.type = 'file'
    input.style.display = 'none'
    document.body.appendChild(input)
    input.addEventListener('change', () => {
      lastPromiseResolve?.([...input.files])
      lastPromiseResolve = null
    })
  }
  input.accept = accept
  input.multiple = multiple
  input.value = ''
  // 如果前面还有个 Promise 在等, 就直接取消
  if (lastPromiseResolve) {
    lastPromiseResolve([])
  }
  const files = await new Promise<File[]>(resolve => {
    lastPromiseResolve = resolve
    input.click()
  })
  return files
}
