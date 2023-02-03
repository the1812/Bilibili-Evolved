import type { CustomNavbarItemInit } from './custom-navbar-item'
import { favorites } from './favorites/favorites'
import { feeds } from './feeds/feeds'
import { blanks } from './flexible-blank/flexible-blank'
import { history } from './history/history'
import { home } from './home/home'
import { gamesIframe, livesIframe, mangaIframe } from './iframe/iframe'
import { logo } from './logo/logo'
import { messages } from './messages/messages'
import { ranking } from './ranking/ranking'
import { search } from './search/search'
import { bangumi, drawing, match, music, shop } from './simple-links/simple-links'
import { subscriptions } from './subscriptions/subscriptions'
import { upload } from './upload/upload'
import { userInfo } from './user-info/user-info'
import { watchlater } from './watchlater/watchlater'

const [blank1, blank2, blank3, blank4] = blanks
export const getBuiltInItems = (): CustomNavbarItemInit[] => [
  blank1,
  logo,
  home,
  bangumi,
  ranking,
  drawing,
  music,
  gamesIframe,
  livesIframe,
  shop,
  match,
  mangaIframe,
  blank2,
  search,
  blank3,
  userInfo,
  messages,
  feeds,
  subscriptions,
  watchlater,
  favorites,
  history,
  upload,
  blank4,
]
