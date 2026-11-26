export interface Aria2RpcProfile {
  name: string
  secretKey: string
  dir: string
  host: string
  port: string
  method: string
  other: string
}
export const defaultProfile: Aria2RpcProfile = {
  name: '未命名',
  secretKey: '',
  dir: '',
  host: '127.0.0.1',
  port: '6800',
  method: 'get',
  other: '',
}
