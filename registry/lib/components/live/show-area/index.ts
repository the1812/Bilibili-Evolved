import { defineComponentMetadata } from '@/components/define'
import { select } from '@/core/spin-query'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'showArea',
  displayName: '直播显示分区信息',
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  tags: [componentsTags.live],
  urlInclude: liveUrls,
  entry: async () => {
    // 获取当前直播间号
    const getLiveRoomId = (): string => {
      let matched = location.href.match(/live.bilibili.com\/(\d+)/)
      if (matched) {
        return matched[1]
      }
      matched = location.href.match(/live.bilibili.com\/blanc\/(\d+)/)
      return matched ? matched[1] : ''
    }

    const fetchAreaInfo = async (roomId: string) => {
      try {
        const res = await fetch(
          `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomId}`,
        )
        const json = await res.json()
        if (json.code === 0 && json.data) {
          return {
            areaId: json.data.area_id,
            areaName: json.data.area_name,
            parentAreaId: json.data.parent_area_id,
            parentAreaName: json.data.parent_area_name,
          }
        }
        throw new Error(json.message || '请求失败')
      } catch (error) {
        console.error('[showArea] 获取分区信息失败', error)
        return null
      }
    }

    // ---------- 主逻辑 ----------
    const roomId = getLiveRoomId()
    if (!roomId) {
      console.warn('[showArea] 未检测到房间号')
      return
    }

    const areaInfo = await fetchAreaInfo(roomId)
    if (!areaInfo) {
      return
    }

    // 同时等待两种可能存在的容器，谁先出现就用谁
    const anchor = (await Promise.race([
      select('.head-info-section .left-anchor-section'),
      select('.left-ctnr .live-title'),
    ])) as Element | null
    if (!anchor) {
      console.warn('[showArea] 未找到可插入的锚点元素')
      return
    }

    // 检查是否已经插入过（避免重复）
    if (anchor.parentElement?.querySelector('.show-area-info')) {
      console.debug('[showArea] 分区信息已存在，跳过')
      return
    }

    // ---------- 构建分区显示 ----------
    const { areaId, areaName, parentAreaId, parentAreaName } = areaInfo
    const parentLink = `https://live.bilibili.com/p/eden/area-tags?parentAreaId=${parentAreaId}`
    const childLink = `https://live.bilibili.com/p/eden/area-tags?parentAreaId=${parentAreaId}&areaId=${areaId}`

    let parentEl = anchor.parentElement as Element | null
    if (!parentEl) {
      parentEl = (anchor.parentNode as Element) || null
    }

    const ShowArea = await import('./ShowArea.vue').then(m => m.default)
    const instance = new ShowArea({
      propsData: {
        parentAreaName,
        areaName,
        parentLink,
        childLink,
      },
    })
    instance.$mount()
    if (parentEl) {
      parentEl.insertBefore(instance.$el, anchor.nextSibling)
    } else {
      anchor.insertAdjacentElement('afterend', instance.$el)
    }

    console.debug('[showArea] 分区信息已显示')
  },
})
