import { CustomNavbarItemInit } from './custom-navbar-item'
import { messages } from './messages/messages'
import { userInfo } from './user-info/user-info'
import { logo } from './logo/logo'
import { home } from './home/home'
import { gamesIframe, livesIframe } from './iframe/iframe'
import { blanks } from './flexible-blank/flexible-blank'
import {
  ranking, music, drawing, shop, manga,
} from './simple-links/simple-links'
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
  ranking,
  drawing,
  music,
  gamesIframe,
  livesIframe,
  shop,
  manga,
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
