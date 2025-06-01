export interface BiliBiliQueryAidResponse {
  code: number
  message: string
  ttl: number
  data: BiliBiliQueryAidData
}

export interface BiliBiliQueryAidData {
  bvid: string
  aid: number
  videos: number
  tid: number
  tid_v2: number
  tname: string
  tname_v2: string
  copyright: number
  pic: string
  title: string
  pubdate: number
  ctime: number
  desc: string
  desc_v2: Descv2[]
  state: number
  duration: number
  rights: Rights
  owner: Owner
  stat: Stat
  argue_info: Argueinfo
  dynamic: string
  cid: number
  dimension: Dimension
  premiere: null
  teenage_mode: number
  is_chargeable_season: boolean
  is_story: boolean
  is_upower_exclusive: boolean
  is_upower_play: boolean
  is_upower_preview: boolean
  enable_vt: number
  vt_display: string
  is_upower_exclusive_with_qa: boolean
  no_cache: boolean
  pages: Page[]
  subtitle: Subtitle
  is_season_display: boolean
  user_garb: Usergarb
  honor_reply: Honorreply
  like_icon: string
  need_jump_bv: boolean
  disable_show_up_info: boolean
  is_story_play: number
  is_view_self: boolean
}

interface Honor {
  /** 当前稿件aid */
  aid: number
  /** 1：入站必刷收录。2：第?期每周必看。3：全站排行榜最高第?名。4：热门 */
  type: number
  /** 描述 */
  desc: string
  /** 每周推荐数量 */
  weeklyRecommendNum: number
}

interface Honorreply {
  honor: Honor[]
}

interface Usergarb {
  url_image_ani_cut: string
}

interface Subtitle {
  allow_submit: boolean
  list: List[]
}

interface List {
  id: number
  lan: string
  lan_doc: string
  is_lock: boolean
  subtitle_url: string
  type: number
  id_str: string
  ai_type: number
  ai_status: number
  author: Author
}

interface Author {
  mid: number
  name: string
  sex: string
  face: string
  sign: string
  rank: number
  birthday: number
  is_fake_account: number
  is_deleted: number
  in_reg_audit: number
  is_senior_member: number
  name_render: null
}

interface Page {
  cid: number
  page: number
  from: string
  part: string
  duration: number
  vid: string
  weblink: string
  dimension: Dimension
  ctime: number
}

interface Dimension {
  width: number
  height: number
  rotate: number
}

interface Argueinfo {
  argue_msg: string
  argue_type: number
  argue_link: string
}

interface Stat {
  aid: number
  view: number
  danmaku: number
  reply: number
  favorite: number
  coin: number
  share: number
  now_rank: number
  his_rank: number
  like: number
  dislike: number
  evaluation: string
  vt: number
}

interface Owner {
  mid: number
  name: string
  face: string
}

interface Rights {
  bp: number
  elec: number
  download: number
  movie: number
  pay: number
  hd5: number
  no_reprint: number
  autoplay: number
  ugc_pay: number
  is_cooperation: number
  ugc_pay_preview: number
  no_background: number
  clean_mode: number
  is_stein_gate: number
  is_360: number
  no_share: number
  arc_pay: number
  free_watch: number
}

interface Descv2 {
  raw_text: string
  type: number
  biz_id: number
}
