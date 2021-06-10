import { cdnRoot, meta, defaultBranch } from './meta'
import { monkey } from './ajax'
import { Version } from './version'
import { settings } from './settings'
import { fullyLoaded } from './life-cycle'

const checkVersionUpdate = (update: PackageUpdate) => {
  const version = new Version(update.meta.version)
  const current = new Version(meta.version)
  if (version.greaterThan(current)) {
    console.log(`New version available: v${update.meta.version}`)
    // TODO: notify new version
    return true
  }
  return false
}
const installPackageUpdate = (packageCodes: string) => {
  settings.update = packageCodes
}
export const checkUpdate = (() => {
  const update = async () => {
    console.log('Checking for update...')
    const updateUrl = `${cdnRoot}dist/package.js`
    const packageCodes = await monkey({
      url: updateUrl,
    })
    eval(packageCodes)
    const updatePackage = window.bilibiliEvolvedUpdate
    if (checkVersionUpdate(updatePackage)) { // 检查版本, 有新版本时不再进行组件更新
      return
    }
    if (meta.branch === defaultBranch) { // 主分支需要安装组件更新
      installPackageUpdate(packageCodes)
      console.log('Installed package update.')
    }
  }
  return () => {
    // Violentmonkey 不兼容 requestIdleCallback
    if ('requestIdleCallback' in unsafeWindow && GM_info.scriptHandler !== 'Violentmonkey') {
      unsafeWindow.requestIdleCallback(update)
    } else {
      fullyLoaded(update)
    }
  }
})()
