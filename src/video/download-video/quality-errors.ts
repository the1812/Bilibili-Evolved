export const throwQualityError = (q: number) => {
  // 大会员清晰度: 1080P60 1080P+ 720P60
  if (q === 116 || q === 112 || q === 74) {
    throw new Error('您选择的清晰度需要大会员, 请更改清晰度后重试.')
  }
  // 登录后可看清晰度: 1080P 720P
  if (q === 80 || q === 64) {
    throw new Error('您选择的清晰度需要先登录.')
  }
  throw new Error('获取下载链接失败, 请尝试更换清晰度或更换视频格式.')
}
export default {
  export: {
    throwQualityError
  },
}