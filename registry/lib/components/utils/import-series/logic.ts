import Progress from './Progress.vue'
import { mountVueComponent, getCsrf, delay } from '@/core/utils'
import { sq } from '@/core/spin-query'

export const realEntry = async () => {
  const url = new URL(window.location.href)
  // 合集id
  const sid = url.searchParams.get('sid')
  // 合集作者
  const uid = url.pathname.split('/')[1]
  // 合集名
  let seriesName = ''
  seriesName = await sq(
    () => document.getElementsByClassName('item cur')[0].innerHTML,
    t => t !== '',
    {
      queryInterval: 500,
    },
  )

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
    // 获取合集所有视频
    const seriesVideos = (
      await fetch(
        `https://api.bilibili.com/x/series/archives?mid=${uid}&series_id=${sid}&only_normal=true&sort=desc&pn=1&ps=99999`,
      ).then(r => r.json())
    ).data.archives

    let favId = 0
    // 创建收藏夹，获取新收藏夹id
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

    for (let i = 0; i < seriesVideos.length; i++) {
      // 添加每一个视频至收藏夹
      while (true) {
        // 做个延迟，防止太快而遭服务器拒绝
        await delay(500)
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
}
