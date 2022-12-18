import progress from './progress.vue'
import { mountVueComponent } from '@/core/utils'

export const realEntry = async () => {
  // 模仿python中的time.sleep
  const sleep = timeout =>
    new Promise(resolve => {
      setTimeout(resolve, timeout)
    })

  const url = new URL(window.location.href)
  // 合集id
  const sid = url.searchParams.get('sid')
  // 合集作者
  const uid = url.pathname.split('/')[1]
  // 合集名
  let series_name = ''
  while (true) {
    series_name = document.getElementsByClassName('item cur')[0].innerHTML
    if (series_name !== '') {
      break
    } else {
      await sleep(500)
    }
  }

  const get_cookie = name => {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].split('=')
      cookie[0] = cookie[0].trim()
      if (cookie[0] === name) {
        return cookie[1]
      }
    }
    return ''
  }
  // 当前登录用户 我 的验证信息
  const csrf = get_cookie('bili_jct')

  // add a button
  const page_head = document.getElementsByClassName('page-head')[0]
  const rel = page_head.children[1]
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
  page_head.insertBefore(button, rel)

  button.onclick = async () => {
    // 获取合集所有视频
    const series_videos = (
      await fetch(
        `https://api.bilibili.com/x/series/archives?mid=${uid}&series_id=${sid}&only_normal=true&sort=desc&pn=1&ps=99999`,
      ).then(r => r.json())
    ).data.archives

    let fav_id = 0
    // 创建收藏夹，获取新收藏夹id
    while (true) {
      const response = await fetch('https://api.bilibili.com/x/v3/fav/folder/add', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `title=${series_name}&csrf=${csrf}&privacy=0`,
      }).then(r => r.json())

      if (response.code === 0) {
        fav_id = response.data.id
        break
      } else {
        await sleep(2000)
      }
    }

    // 挂载弹出框
    const mount_point = document.createElement('div')
    document.getElementsByTagName('body')[0].appendChild(mount_point)
    type progressSetting = Vue & {
      isDisabled: boolean
      all: number
      handled: number
    }
    const p: progressSetting = mountVueComponent(progress, mount_point)
    p.all = series_videos.length

    for (let i = 0; i < series_videos.length; i++) {
      // 添加每一个视频至收藏夹
      while (true) {
        // 做个延迟，防止太快而遭服务器拒绝
        await sleep(500)
        const response = await fetch('https://api.bilibili.com/x/v3/fav/resource/deal', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `rid=${series_videos[i].aid}&add_media_ids=${fav_id}&type=2&csrf=${csrf}`,
        }).then(r => r.json())

        if (response.code === 0) {
          // 如果请求成功，更新progress组件
          p.handled = i + 1
          break
        } else {
          // 如果请求失败，等待2s后重试
          await sleep(2000)
        }
      }
    }
    // 添加收藏夹任务完成，更改按钮为可点击
    p.isDisabled = false
  }
}
