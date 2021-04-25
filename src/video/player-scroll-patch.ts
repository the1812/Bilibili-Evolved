/**
 * 禁用播放器宽屏模式时的自动定位效果
 * @see https://github.com/the1812/Bilibili-Evolved/issues/483
 * @see https://greasyfork.org/zh-CN/scripts/421421
 * @author https://github.com/CKylinMC
 */
export const playerScrollPatch = _.once(async () => {
  await videoCondition()
  const agent = await SpinQuery.select(() => unsafeWindow.PlayerAgent)
  agent.player_widewin = function () {
    unsafeWindow.isWide = true
    unsafeWindow.setSize()
  }
})

export default {
  export: {
    playerScrollPatch,
  }
}
