export const logError = async (error: Error | string) => {
  let finalError: string
  if (typeof error === 'string') {
    finalError = error
    console.error(finalError)
  } else {
    const { getGeneralSettings } = await import('../settings')
    if (getGeneralSettings().devMode) {
      finalError = error.stack
    } else {
      finalError = error.message
    }
    console.error(error)
  }
  const { Toast } = await import('../toast')
  Toast.error(finalError, '错误')
}
