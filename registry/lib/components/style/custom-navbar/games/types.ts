export interface GameListItem {
  href: string
  title: string
  poster: string
}

export interface GameInfo {
  panel: GameListItem[]
  list: GameListItem[]
  banner: GameListItem
}
