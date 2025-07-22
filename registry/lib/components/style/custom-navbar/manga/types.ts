export interface MangaRecommendItem {
  season_id: number
  title: string
  horizontal_cover: string
  square_cover: string
  vertical_cover: string
  is_finish: number
  status: number
  last_ord: number
  total: number
  release_time: string
  last_short_title: string
  ext: string
  recommend_reason: string
  discount_type: number
  allow_wait_free: boolean
  styles: string[]
  tags: string[]
  rank_info: {
    name: string
    rank: number
  }
  score: number
  update_day: number
  good_review: number
  search_num: number
  author_name: string[]
  rec_tag_id: number
  rec_tag: string
  rec_tag_type: number
  vertical_cover_info: {
    cover_id: string
    cover_type: number
  }
}

export interface MangaHotItem {
  comic_id: number
  title: string
  author: string[]
  vertical_cover: string
  is_finish: number
  last_ord: number
  last_short_title: string
  styles: {
    id: number
    name: string
  }[]
  total: number
  last_rank: number
  last_ep: number
}
