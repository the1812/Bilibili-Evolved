import commonMeta from '../../src/client/common.meta.json'
import { allCdns, altCdn } from '../cdn'

export const runtimeInfo = {
  year: new Date().getFullYear(),
  version: commonMeta.version,
  altCdn,
  allCdns,
}
