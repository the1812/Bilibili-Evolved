import { defineComponentMetadata } from '@/components/define'
import { videoChange } from '@/core/observer'
import { hasVideo } from '@/core/spin-query'
import { Toast } from '@/core/toast'
import { useScopedConsole } from '@/core/utils/log'
import { playerUrls } from '@/core/utils/urls'
import {
  getRememberState,
  jumpToEpisode,
  waitForStateUpdate,
  emitMemoryUpdate,
  type EpisodeState,
  type RememberOptions,
} from './shared'

const name = 'rememberVideoCollection'
const jumpPromptTitle = '记忆合集'
const logger = useScopedConsole(name)

const style = `
/* 单P合集项：圆点作用于 single-p 容器（不影响分P子项） */
.single-p.remember-dot-history .title-txt::before,
/* 多P合集项：圆点仅作用于 head 行（不影响分P子项） */
.multi-p.remember-dot-history > .simple-base-item.head .title-txt::before,
/* 分P子项圆点 */
.remember-page-history .title-txt::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
  transform: translateY(-1px);
  background-color: #9499a0;
}
/* 置灰：单P作用于 single-p 容器，多P作用于 head 行，分P子项各自置灰 */
.single-p.pod-item-watched,
.multi-p > .simple-base-item.head.pod-item-watched,
.page-item-watched {
  opacity: 0.7;
  transition: opacity 0.2s;
}
.single-p.pod-item-watched:hover,
.multi-p > .simple-base-item.head.pod-item-watched:hover,
.page-item-watched:hover {
  opacity: 1;
}
`

const getPageKey = (bvid: string, page: number) => `${bvid}:${Math.max(1, page)}`

const getEpisodePagesCount = (episode: EpisodeState) => {
  const pageCount = episode.pages?.length ?? 0
  return pageCount > 0 ? pageCount : 1
}

const setEpisodeMarks = (options: RememberOptions) => {
  const rememberState = getRememberState()
  logger.log('setEpisodeMarks - rememberState', rememberState)
  const podList = document.querySelector('.video-pod__list') as HTMLElement | null
  if (!rememberState || !podList) {
    return
  }

  const items = Array.from(podList.querySelectorAll('.pod-item')) as HTMLElement[]
  items.forEach(item => {
    const bvid = item.dataset.key ?? ''
    if (!bvid) {
      return
    }

    // 获取 single-p 或 multi-p 容器元素
    const singleP = item.querySelector('.single-p') as HTMLElement | null
    const multiP = item.querySelector('.multi-p') as HTMLElement | null
    const containerEl = singleP ?? multiP

    // 清除旧标记
    containerEl?.classList.remove('remember-dot-history')
    // 对于 multi-p，置灰作用于 head 行；对于 single-p，作用于容器本身
    const headEl = multiP
      ? (multiP.querySelector('.simple-base-item.head') as HTMLElement | null)
      : singleP
    headEl?.classList.remove('pod-item-watched')

    const episode = rememberState.episodes.find(it => it.bvid === bvid)
    const pageCount = getEpisodePagesCount(episode ?? {})

    // 始终通过历史记录回推已看分P数（不依赖DOM渲染状态，避免虚拟滚动导致计数不准）
    let watchedPages = 0
    for (let page = 1; page <= pageCount; page += 1) {
      const pageKey = getPageKey(bvid, page)
      if (options.history[pageKey]) {
        watchedPages += 1
      }
    }

    // 处理分P子项标记：
    // - 单P视频（singleP）：没有分P子项，灰点由 containerEl 上的 remember-dot-history 控制
    // - 多P视频（multiP）：分P子项为 .page-item.sub，每个子项独立显示灰点
    const pageElements = multiP
      ? (Array.from(item.querySelectorAll('.page-item.sub')) as HTMLElement[])
      : []

    pageElements.forEach((pageElement, index) => {
      const page = index + 1
      const pageKey = getPageKey(bvid, page)
      pageElement.classList.remove('remember-page-history', 'page-item-watched')

      const isCurrentPage = bvid === rememberState.currentBvid && page === rememberState.currentP
      if (isCurrentPage) {
        return
      }

      if (options.history[pageKey]) {
        pageElement.classList.add('remember-page-history', 'page-item-watched')
      }
    })

    const isCurrentVideo = bvid === rememberState.currentBvid
    if (isCurrentVideo) {
      return
    }

    // 只要看过任意一P，就在容器上显示灰点（头部灰点）
    if (watchedPages > 0 && containerEl) {
      containerEl.classList.add('remember-dot-history')
    }
    // 仅当所有分P都看过才将合集项标题行置灰（降低透明度）
    if (pageCount > 0 && watchedPages >= pageCount && headEl) {
      headEl.classList.add('pod-item-watched')
    }
  })
}

export const component = defineComponentMetadata({
  name,
  displayName: '记忆合集',
  tags: [componentsTags.video],
  author: {
    name: 'JLoeve (with Kilo Code)',
    link: 'https://github.com/LonelySteve',
  },
  urlInclude: playerUrls,
  instantStyles: [{ name, style }],
  options: {
    showPrompt: {
      defaultValue: true,
      displayName: '显示续播提示',
    },
    resumeNext: {
      defaultValue: false,
      displayName: '续播从下一集开始（T+1）',
    },
    history: {
      defaultValue: {},
      hidden: true,
    },
    seasonMap: {
      defaultValue: {},
      hidden: true,
    },
  },
  widget: {
    condition: hasVideo,
    component: () => import('./Widget.vue').then(m => m.default),
  },
  entry: async ({ settings }) => {
    const options = settings.options as RememberOptions

    const refreshMarks = () => setTimeout(() => setEpisodeMarks(options), 160)

    const observer = new MutationObserver(() => {
      refreshMarks()
    })

    const attachObserver = () => {
      const podList = document.querySelector('.video-pod__list') as HTMLElement | null
      if (!podList) {
        return false
      }
      observer.observe(podList, { childList: true, subtree: true })
      return true
    }

    // 组件挂载时执行一次续播检查（仅在进入页面时触发，页面内切换视频不再提示）
    const checkAndPromptResume = async () => {
      const rememberState = getRememberState()
      if (!rememberState) {
        return
      }
      const { currentBvid, currentP, seasonId } = rememberState
      const seasonRecord = options.seasonMap[seasonId]
      if (!seasonRecord) {
        return
      }
      const needJump = seasonRecord.lastBvid !== currentBvid || seasonRecord.lastPage !== currentP
      if (!needJump || !options.showPrompt) {
        return
      }

      // 计算续播目标（T+1 模式：跳到下一集/下一P）
      const getResumeTarget = (): { bvid: string; page: number } => {
        const { lastBvid, lastPage, nextBvid, nextPage } = seasonRecord
        if (!options.resumeNext) {
          return { bvid: lastBvid, page: lastPage }
        }
        // 使用存储的 nextBvid 和 nextPage（T+1），确保即使合集发生变化也能正确跳转
        return nextBvid && nextPage
          ? { bvid: nextBvid, page: nextPage }
          : { bvid: lastBvid, page: lastPage }
      }

      const resumeTarget = getResumeTarget()
      const targetEpisode = rememberState.episodes.find(it => it.bvid === resumeTarget.bvid)
      const targetTitle = targetEpisode?.title ?? resumeTarget.bvid
      const targetDesc =
        resumeTarget.page > 1 ? `${targetTitle} P${resumeTarget.page}` : targetTitle

      const doJump = async () => {
        const ok = await jumpToEpisode(resumeTarget.bvid, resumeTarget.page)
        if (ok) {
          Toast.success(`已恢复到：${targetDesc}`, jumpPromptTitle, 2500)
        }
      }

      const toast = Toast.show(
        `检测到上次看到：${targetDesc}，<a class="link remember-episodes-jump">跳转</a> / <a class="link remember-episodes-ignore">忽略</a>`,
        jumpPromptTitle,
        6000,
      )
      const toastElement = await toast.element
      toastElement.querySelector('.remember-episodes-jump')?.addEventListener('click', async e => {
        e.preventDefault()
        await doJump()
        toast.close()
      })
      toastElement.querySelector('.remember-episodes-ignore')?.addEventListener('click', e => {
        e.preventDefault()
        toast.close()
      })
    }

    attachObserver()
    await checkAndPromptResume()

    videoChange(async () => {
      // 等待 __INITIAL_STATE__ 更新
      await waitForStateUpdate()

      const rememberState = getRememberState()
      if (!rememberState) {
        return
      }

      logger.log('videoChange - rememberState', rememberState)

      const { currentBvid, currentP, seasonId, seasonTitle, episodes } = rememberState
      const now = Date.now()
      const pageKey = getPageKey(currentBvid, currentP)
      const historyRecord = options.history[pageKey]

      options.history[pageKey] = {
        lastViewTime: now,
        viewCount: (historyRecord?.viewCount ?? 0) + 1,
      }

      // 计算 T+1 目标（考虑分P维度）
      const currentEpisodeIndex = episodes.findIndex(it => it.bvid === currentBvid)
      const currentEpisode = episodes[currentEpisodeIndex]
      const currentEpisodePages = getEpisodePagesCount(currentEpisode ?? {})
      const nextEpisode = episodes[currentEpisodeIndex + 1]

      let nextBvid: string | undefined
      let nextPage: number | undefined

      if (currentP < currentEpisodePages) {
        // 当前视频还有下一P，T+1 是同一视频的下一P
        nextBvid = currentBvid
        nextPage = currentP + 1
      } else if (nextEpisode?.bvid) {
        // 当前视频已是最后一P，T+1 是下一个视频的第一P
        nextBvid = nextEpisode.bvid
        nextPage = 1
      }

      options.seasonMap[seasonId] = {
        lastBvid: currentBvid,
        lastPage: currentP,
        title: seasonTitle,
        nextBvid,
        nextPage,
      }

      if (!document.querySelector('.video-pod__list')) {
        attachObserver()
      }
      refreshMarks()

      // 触发记忆更新事件，通知 Widget 更新状态
      emitMemoryUpdate()
    })

    refreshMarks()
  },
  unload: () => {
    document
      .querySelectorAll('.remember-episodes-jump, .remember-episodes-ignore')
      .forEach(it => it.remove())
  },
})
