export const getReleaseContent = async (version: string) => {
  const { monkey } = await import('@/core/ajax')
  const { meta, branches } = await import('@/core/meta')
  const { defaultOwner } = await import('@/core/cdn-types')
  const { default: marked } = await import('marked')

  try {
    const tag = meta.compilationInfo.branch === branches.preview ? `${version}-preview` : version
    const api = `https://api.github.com/repos/${defaultOwner}/Bilibili-Evolved/releases/tags/v${tag}`
    const result = JSON.parse(await monkey({ url: api }))
    const content = result?.body ?? ''
    return marked(content as string)
  } catch (error) {
    return `检查更新时发生错误: ${error.message}`
  }
}

export const getUpdateUrl = async () => {
  const { cdnRoots } = await import('@/core/cdn-types')
  const { meta } = await import('@/core/meta')
  const { getGeneralSettings } = await import('@/core/settings')

  return `${cdnRoots[getGeneralSettings().cdnRoot](meta.compilationInfo.branch)}dist/${
    meta.originalFilename
  }`
}

export const showReleaseContent = async (content: string) => {
  const { showDialog } = await import('@/core/dialog')
  const updateUrl = await getUpdateUrl()
  showDialog({
    title: '更新说明',
    content: () => import('./ReleaseContent.vue'),
    contentProps: {
      content,
      updateUrl,
    },
  })
}
