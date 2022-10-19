const notLoginResult = {
  isLogin: false,
}
/** 获取用户信息 */
export const getUserInfo = lodash.once(async () => {
  const { getUID } = await import('./utils')
  if (!getUID()) {
    return notLoginResult
  }
  const { getJsonWithCredentials } = await import('./ajax')
  const api = 'https://api.bilibili.com/x/web-interface/nav'
  const json = await getJsonWithCredentials(api)
  if (json.code !== 0 && json.code !== -101) {
    // -101: not login
    console.warn('[store.fetchUserInfo] API Error', json.message)
    return notLoginResult
  }
  return json.data
})
