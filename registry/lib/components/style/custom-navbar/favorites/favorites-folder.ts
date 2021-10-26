/** 收藏夹信息, 供`FavoritesFolderSelect.vue`使用 */
export interface FavoritesFolder {
  id: number
  /** 名称 */
  name: string
  /** 视频数量 */
  count: number
}
/** 未选择时的初始状态 */
export const notSelectedFolder: FavoritesFolder = {
  id: 0,
  name: '加载中...',
  count: 0,
}
