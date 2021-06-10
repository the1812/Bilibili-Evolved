import * as component from './component'
import * as userComponent from './user-component'
import * as styledComponent from './styled-component'
import * as description from './description'
import * as feedsApis from './feeds/api'
import BangumiCard from './feeds/BangumiCard.vue'
import VideoCard from './feeds/VideoCard.vue'
import ColumnCard from './feeds/ColumnCard.vue'
import * as disableProfilePopup from './feeds/disable-profile-popup'
import * as notify from './feeds/notify'
import LaunchBar from './launch-bar/LaunchBar.vue'

export const componentApis = {
  component,
  userComponent,
  styledComponent,
  description,
  launchBar: {
    LaunchBar,
  },
  feeds: {
    api: feedsApis,
    BangumiCard,
    VideoCard,
    ColumnCard,
    disableProfilePopup,
    notify,
  },
}
export type ComponentApis = typeof componentApis
