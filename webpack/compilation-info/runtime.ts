import commonMeta from '../../src/client/common.meta.json'
import { altCdn } from '../cdn'

export const runtimeInfo = {
  year: new Date().getFullYear(),
  version: commonMeta.version,
  altCdn,
}
