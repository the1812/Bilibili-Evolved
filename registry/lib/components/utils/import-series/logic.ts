import Progress from './Progress.vue'
import { mountVueComponent, getCsrf, delay } from '@/core/utils'
import { sq } from '@/core/spin-query'
import { urlChange } from '@/core/observer'
import { Toast } from '@/core/toast'

const addSeries = async (sid, uid, csrf) => {
  // 获取合集所有视频
  const seriesVideos = (
    await fetch(
      `https://api.bilibili.com/x/series/archives?mid=${uid}&series_id=${sid}&only_normal=true&sort=desc&pn=1&ps=99999`,
    ).then(r => r.json())
  ).data.archives

  // 合集名
  const seriesName = await sq(
    () => document.getElementsByClassName('item cur')[0].innerHTML,
    t => t !== '',
  )

  // 挂载弹出框
  const mountPoint = document.createElement('div')
  document.getElementsByTagName('body')[0].appendChild(mountPoint)
  type ProgressSetting = Vue & {
    isDisabled: boolean
    all: number
    handled: number
  }
  const p: ProgressSetting = mountVueComponent(Progress, mountPoint)
  p.all = seriesVideos.length

  // 创建收藏夹，获取新收藏夹id
  let favId = 0
  while (true) {
    const response = await fetch('https://api.bilibili.com/x/v3/fav/folder/add', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `title=${seriesName}&csrf=${csrf}&privacy=0`,
    }).then(r => r.json())

    if (response.code === 0) {
      favId = response.data.id
      break
    } else {
      await delay(2000)
    }
  }

  // 添加每一个视频至收藏夹
  for (let i = 0; i < seriesVideos.length; i++) {
    // 做个延迟，防止太快而遭服务器拒绝
    await delay(500)
    while (true) {
      const response = await fetch('https://api.bilibili.com/x/v3/fav/resource/deal', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `rid=${seriesVideos[i].aid}&add_media_ids=${favId}&type=2&csrf=${csrf}`,
      }).then(r => r.json())

      if (response.code === 0) {
        // 如果请求成功，更新progress组件
        p.handled = i + 1
        break
      } else {
        // 如果请求失败，等待2s后重试
        await delay(2000)
      }
    }
  }

  // 添加收藏夹任务完成，更改按钮为可点击
  p.isDisabled = false
}

const addCollection = async (sid, csrf) => {
  while (true) {
    const response = await fetch('https://api.bilibili.com/x/v3/fav/season/fav', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `platform=web&season_id=${sid}&csrf=${csrf}`,
    }).then(r => r.json())

    if (response.code === 0) {
      Toast.success('成功', '导入合集', 2000)
      break
    } else {
      await delay(2000)
    }
  }
}

const addButton = () => {
  enum PageType {
    Collection,
    Series,
  }

  const url = new URL(window.location.href)
  let pageType: PageType

  // series 或 collection 的 id
  let sid
  if (url.pathname.includes('seriesdetail')) {
    // series id
    sid = url.searchParams.get('sid')
    pageType = PageType.Series
  } else if (url.pathname.includes('collectiondetail')) {
    // collection id
    sid = url.searchParams.get('sid')
    pageType = PageType.Collection
  } else {
    return
  }

  // 合集作者
  const uid = url.pathname.split('/')[1]

  // 当前登录用户 我 的验证信息
  const csrf = getCsrf()

  // add a button
  const pageHead = document.getElementsByClassName('page-head')[0]
  const rel = pageHead.children[1]
  const button = document.createElement('a')
  // 什么离谱class名，play打错了可还行
  button.className = 'paly-all-btn'
  button.textContent = '一键收藏'
  button.style.cssText = `
        right: 6rem;
        display: block;
        text-align: center;
        width: 65px;
  `
  pageHead.insertBefore(button, rel)

  button.onclick = async () => {
    if (pageType === PageType.Series) {
      await addSeries(sid, uid, csrf)
    } else {
      await addCollection(sid, csrf)
    }
  }
}

export const realEntry = async () => {
  urlChange(() => {
    addButton()
  })
}
