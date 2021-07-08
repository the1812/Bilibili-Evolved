export const logError = async (error: Error | string, duration?: number) => {
  let finalMessage: string
  if (typeof error === 'string') {
    finalMessage = error
    console.error(finalMessage)
  } else {
    const { getGeneralSettings } = await import('../settings')
    if (getGeneralSettings().devMode) {
      finalMessage = error.stack
    } else {
      finalMessage = error.message
    }
    console.error(error)
  }
  const { Toast } = await import('../toast')
  Toast.error(finalMessage, '错误', duration)
}
