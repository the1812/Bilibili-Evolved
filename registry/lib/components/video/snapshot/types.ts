export interface VideoPageCard extends Vue {
  bilibiliEvolved_viewSnapshot_btn: boolean
  $props: {
    item: { aid: number; bvid: string; cid: number; title: string }
  }
}

export interface RecommendList extends Vue {
  bilibiliEvolved_viewSnapshot_watched: boolean
  $children: VideoPageCard[]
  recListItems?: any[] // 用于测试是否为有效推荐列表
}
