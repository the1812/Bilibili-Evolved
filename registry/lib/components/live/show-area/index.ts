import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'showArea',
  displayName: '直播显示分区信息',
  tags: [componentsTags.live],
  urlInclude: liveUrls,
  entry: async () => {
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true })
      })
    }

    const waitForElement = (selector: string): Promise<Element> => {
      return new Promise(resolve => {
        const existing = document.querySelector(selector)
        if (existing) {
          resolve(existing)
          return
        }
        const observer = new MutationObserver(() => {
          const matched = document.querySelector(selector)
          if (matched) {
            observer.disconnect()
            resolve(matched)
          }
        })
        observer.observe(document.body, { childList: true, subtree: true })
      })
    }

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
    const areaInfo = await fetchAreaInfo(roomId)
    if (!areaInfo) {
      return
    }
    const leftAnchor = await waitForElement('.head-info-section .left-anchor-section')
    const existing = leftAnchor.parentElement?.querySelector('.show-area-info')
    if (existing) {
      console.debug('[showArea] 分区信息已存在，跳过')
      return
    }
    let mainColor = 'rgba(255,255,255,1)'
    const colorSelector1 = '.live-skin-coloration-area .live-skin-normal-a-text'
    const colorSelector2 = '.left-anchor-section .room-owner-username'
    const el1 = document.querySelector(colorSelector1)
    if (el1) {
      mainColor = getComputedStyle(el1).color
    } else {
      const el2 = document.querySelector(colorSelector2)
      if (el2) {
        mainColor = getComputedStyle(el2).color
      }
    }

    // ---------- 构建分区显示 ----------
    const { areaId, areaName, parentAreaId, parentAreaName } = areaInfo
    const parentLink = `https://live.bilibili.com/p/eden/area-tags?parentAreaId=${parentAreaId}`
    const childLink = `https://live.bilibili.com/p/eden/area-tags?parentAreaId=${parentAreaId}&areaId=${areaId}`

    const areaEl = document.createElement('div')
    areaEl.className = 'show-area-info'
    Object.assign(areaEl.style, {
      display: 'inline-flex',
      alignItems: 'center',
      marginLeft: '8px',
      color: mainColor,
      fontSize: '14px',
      whiteSpace: 'nowrap',
    })

    const parentA = document.createElement('a')
    parentA.href = parentLink
    parentA.target = '_blank'
    parentA.textContent = parentAreaName || '父分区'
    Object.assign(parentA.style, {
      color: 'inherit',
      textDecoration: 'none',
    })
    parentA.addEventListener('mouseenter', () => {
      parentA.style.color = '#f69'
    })
    parentA.addEventListener('mouseleave', () => {
      parentA.style.color = mainColor
    })

    const separator = document.createElement('span')
    separator.textContent = '-'
    Object.assign(separator.style, {
      margin: '0 6px',
    })

    const childA = document.createElement('a')
    childA.href = childLink
    childA.target = '_blank'
    childA.textContent = areaName || '子分区'
    Object.assign(childA.style, {
      color: 'inherit',
      textDecoration: 'none',
    })
    childA.addEventListener('mouseenter', () => {
      childA.style.color = '#f69'
    })
    childA.addEventListener('mouseleave', () => {
      childA.style.color = mainColor
    })

    areaEl.appendChild(parentA)
    areaEl.appendChild(separator)
    areaEl.appendChild(childA)

    const parent = leftAnchor.parentNode
    if (parent) {
      parent.insertBefore(areaEl, leftAnchor.nextSibling)
    } else {
      leftAnchor.parentNode?.appendChild(areaEl)
    }

    console.debug('[showArea] 分区信息已显示：', `${parentAreaName} - ${areaName}`)
  },
})
