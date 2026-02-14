export type MetadataType = 'ffmetadata' | 'ogm'

export interface ViewPoint {
  content: string
  from: number
  to: number
  image?: string
}

export type TagType = 'old_channel' | 'topic' | 'bgm'

export interface Tag {
  tag_id: number
  tag_name: string
  music_id: string
  tag_type: TagType
  jump_url: string
}
