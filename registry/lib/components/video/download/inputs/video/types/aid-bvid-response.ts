export interface BiliBiliQueryAidAndBvidResponse {
  code: number
  message: string
  ttl: number
  data: BiliBiliQueryAidAndBvidData
}

export interface BiliBiliQueryAidAndBvidData {
  View: View
  Card: Card2
  Tags: Tag[]
  Reply: Reply2
  Related: Related[]
  Spec: null
  hot_share: Hotshare
  elec: null
  emergency: Emergency
  view_addit: Viewaddit
  guide: null
  query_tags: null
  participle: null
  module_ctrl: null
  replace_recommend: boolean
  is_hit_labour_day_activity: boolean
}

interface Viewaddit {
  '63': boolean
  '64': boolean
  '69': boolean
  '71': boolean
  '72': boolean
}

interface Emergency {
  no_like: boolean
  no_coin: boolean
  no_fav: boolean
  no_share: boolean
}

interface Hotshare {
  show: boolean
  list: any[]
}

interface Related {
  aid: number
  videos: number
  tid: number
  tname: string
  copyright: number
  pic: string
  title: string
  pubdate: number
  ctime: number
  desc: string
  state: number
  duration: number
  rights: Rights3
  owner: Owner
  stat: Stat4
  dynamic: string
  cid: number
  dimension: Dimension
  short_link_v2: string
  first_frame: string
  pub_location: string
  cover43: string
  tidv2: number
  tnamev2: string
  pid_v2: number
  pid_name_v2: string
  bvid: string
  season_type: number
  is_ogv: boolean
  ogv_info: null
  rcmd_reason: string
  enable_vt: number
  ai_rcmd: Aircmd
  season_id?: number
  mission_id?: number
  up_from_v2?: number
}

interface Aircmd {
  id: number
  goto: string
  trackid: string
  uniq_id: string
}

interface Stat4 {
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
  vt: number
  vv: number
  fav_g: number
  like_g: number
}

interface Rights3 {
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
  arc_pay: number
  pay_free_watch: number
}

interface Reply2 {
  page: null
  replies: Reply[]
}

interface Reply {
  rpid: number
  oid: number
  type: number
  mid: number
  root: number
  parent: number
  dialog: number
  count: number
  rcount: number
  state: number
  fansgrade: number
  attr: number
  ctime: number
  like: number
  action: number
  content: null
  replies: null
  assist: number
  show_follow: boolean
}

interface Tag {
  tag_id: number
  tag_name: string
  music_id: string
  tag_type: string
  jump_url: string
}

interface Card2 {
  card: Card
  space: Space
  following: boolean
  archive_count: number
  article_count: number
  follower: number
  like_num: number
}

interface Space {
  s_img: string
  l_img: string
}

interface Card {
  mid: string
  name: string
  approve: boolean
  sex: string
  rank: string
  face: string
  face_nft: number
  face_nft_type: number
  DisplayRank: string
  regtime: number
  spacesta: number
  birthday: string
  place: string
  description: string
  article: number
  attentions: any[]
  fans: number
  friend: number
  attention: number
  sign: string
  level_info: Levelinfo
  pendant: Pendant
  nameplate: Nameplate
  Official: Official
  official_verify: Officialverify
  vip: Vip
  is_senior_member: number
  name_render: null
}

interface Vip {
  type: number
  status: number
  due_date: number
  vip_pay_type: number
  theme_type: number
  label: Label
  avatar_subscript: number
  nickname_color: string
  role: number
  avatar_subscript_url: string
  tv_vip_status: number
  tv_vip_pay_type: number
  tv_due_date: number
  avatar_icon: Avataricon
  vipType: number
  vipStatus: number
}

interface Avataricon {
  icon_resource: Honorreply
}

interface Label {
  path: string
  text: string
  label_theme: string
  text_color: string
  bg_style: number
  bg_color: string
  border_color: string
  use_img_label: boolean
  img_label_uri_hans: string
  img_label_uri_hant: string
  img_label_uri_hans_static: string
  img_label_uri_hant_static: string
}

interface Officialverify {
  type: number
  desc: string
}

interface Official {
  role: number
  title: string
  desc: string
  type: number
}

interface Nameplate {
  nid: number
  name: string
  image: string
  image_small: string
  level: string
  condition: string
}

interface Pendant {
  pid: number
  name: string
  image: string
  expire: number
  image_enhance: string
  image_enhance_frame: string
  n_pid: number
}

interface Levelinfo {
  current_level: number
  current_min: number
  current_exp: number
  next_exp: number
}

interface View {
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
  season_id: number
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
  ugc_season: Ugcseason
  is_season_display: boolean
  user_garb: Usergarb
  honor_reply: Honorreply
  like_icon: string
  need_jump_bv: boolean
  disable_show_up_info: boolean
  is_story_play: number
  is_view_self: boolean
}

interface Honorreply {}

interface Usergarb {
  url_image_ani_cut: string
}

interface Ugcseason {
  id: number
  title: string
  cover: string
  mid: number
  intro: string
  sign_state: number
  attribute: number
  sections: Section[]
  stat: Stat3
  ep_count: number
  season_type: number
  is_pay_season: boolean
  enable_vt: number
}

interface Stat3 {
  season_id: number
  view: number
  danmaku: number
  reply: number
  fav: number
  coin: number
  share: number
  now_rank: number
  his_rank: number
  like: number
  vt: number
  vv: number
}

interface Section {
  season_id: number
  id: number
  title: string
  type: number
  episodes: Episode[]
}

interface Episode {
  season_id: number
  section_id: number
  id: number
  aid: number
  cid: number
  title: string
  attribute: number
  arc: Arc
  page: Page2
  bvid: string
  pages: Page2[]
}

interface Page2 {
  cid: number
  page: number
  from: string
  part: string
  duration: number
  vid: string
  weblink: string
  dimension: Dimension
}

interface Arc {
  aid: number
  videos: number
  type_id: number
  type_name: string
  copyright: number
  pic: string
  title: string
  pubdate: number
  ctime: number
  desc: string
  state: number
  duration: number
  rights: Rights2
  author: Owner
  stat: Stat2
  dynamic: string
  dimension: Dimension
  desc_v2: null
  is_chargeable_season: boolean
  is_blooper: boolean
  enable_vt: number
  vt_display: string
  type_id_v2: number
  type_name_v2: string
  is_lesson_video: number
}

interface Stat2 {
  aid: number
  view: number
  danmaku: number
  reply: number
  fav: number
  coin: number
  share: number
  now_rank: number
  his_rank: number
  like: number
  dislike: number
  evaluation: string
  argue_msg: string
  vt: number
  vv: number
}

interface Rights2 {
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
  arc_pay: number
  free_watch: number
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
  first_frame: string
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
