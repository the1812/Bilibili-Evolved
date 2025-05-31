export const setupContainerQueryFeatureDetection = async () => {
  document.documentElement.style.setProperty('--container-query-feature-detection', 'true')
  const bodyStyle = new CSSStyleSheet()
  await bodyStyle.replace(
    '@container style(--container-query-feature-detection) { body { --container-query-supported: true } }',
  )
  document.adoptedStyleSheets.push(bodyStyle)
}

export const isContainerStyleQuerySupported = lodash.once(() => {
  return (
    window.getComputedStyle(document.body).getPropertyValue('--container-query-supported') ===
    'true'
  )
})
