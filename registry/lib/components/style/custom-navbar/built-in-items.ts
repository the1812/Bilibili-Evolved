import { CustomNavbarItemInit } from './custom-navbar-item'
import { messages } from './messages/messages'
import { ranking } from './ranking/ranking'
import { userInfo } from './user-info/user-info'
import { logo } from './logo/logo'
import { home } from './home/home'
import { gamesIframe, livesIframe, mangaIframe } from './iframe/iframe'
import { blanks } from './flexible-blank/flexible-blank'
import { bangumi, music, shop, match, creations } from './simple-links/simple-links'
import { upload } from './upload/upload'
import { search } from './search/search'
import { feeds } from './feeds/feeds'
import { subscriptions } from './subscriptions/subscriptions'
import { watchlater } from './watchlater/watchlater'
import { favorites } from './favorites/favorites'
import { history } from './history/history'

const [blank1, blank2, blank3, blank4] = blanks
export const getBuiltInItems = (): CustomNavbarItemInit[] => [
  blank1,
  logo,
  home,
  bangumi,
  ranking,
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
  creations,
  upload,
  blank4,
]
