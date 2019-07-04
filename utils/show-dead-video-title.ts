(async () => {
  if (!document.URL.startsWith('https://space.bilibili.com')) {
    return
  }
  interface DeadVideoInfo {
    aid: string
    title: string
    cover: string
  }
  abstract class DeadVideoInfoProvider {
    abstract async queryInfo(aids: string[]): Promise<DeadVideoInfo[]>
  }
  class BiliplusProvider extends DeadVideoInfoProvider {
    static BiliplusHost = `https://hd.biliplus.com`
    static MaxCountPerRequest = 30
    private convertToDeadVideoInfo(aid: string, raw: { title: string, pic: string }) {
      return {
        aid,
        title: raw.title,
        cover: raw.pic,
      }
    }
    async queryInfo(aids: string[]) {
      const results: DeadVideoInfo[] = []
      if (aids.length <= BiliplusProvider.MaxCountPerRequest) {
        const json = await Ajax.getJson(`${BiliplusProvider.BiliplusHost}/api/aidinfo?aid=${aids.join(',')}`)
        if (json.code === 0) {
          results.push(...aids.map(aid => {
            if (aid in json.data) {
              return this.convertToDeadVideoInfo(aid, json.data[aid])
            } else {
              return {
                aid,
                title: '已失效视频',
                cover: '',
              }
            }
          }))
        } else {
          console.error(`[显示失效视频信息] Biliplus API 未成功. message=${json.message}`)
        }
      } else {
        results.push(...(await this.queryInfo(aids.slice(0, BiliplusProvider.MaxCountPerRequest))))
        results.push(...(await this.queryInfo(aids.slice(BiliplusProvider.MaxCountPerRequest))))
      }
      return results
    }
  }
  class WatchlaterProvider extends DeadVideoInfoProvider {
    static csrf = document.cookie.replace(/(?:(?:^|.*;\s*)bili_jct\s*\=\s*([^;]*).*$)|^.*$/, '$1')
    private async toggleWatchlater(add: boolean, aids: string[]) {
      for (const aid of aids) {
        await Ajax.postTextWithCredentials(`https://api.bilibili.com/x/v2/history/toview/${add ? 'add' : 'del'}`, `aid=${aid}&csrf=${WatchlaterProvider.csrf}`)
      }
    }
    async queryInfo(aids: string[]) {
      const results: DeadVideoInfo[] = []
      await this.toggleWatchlater(true, aids)
      const json = await Ajax.getJsonWithCredentials('https://api.bilibili.com/x/v2/history/toview/web')
      if (json.code === 0) {
        const watchlaterList = json.data.list.map((it: any) => {
          return {
            aid: it.aid.toString(),
            title: it.title,
            cover: it.pic,
          }
        }) as DeadVideoInfo[]
        results.push(...aids
          .map(aid => watchlaterList.find(item => item.aid === aid) as DeadVideoInfo)
          .filter(it => it !== undefined))
        await this.toggleWatchlater(false, aids)
      }
      else {
        console.error(`[显示失效视频信息] 稍后再看 API 未成功. message=${json.message}`)
      }
      return results
    }
  }
  const spaceApp = await SpinQuery.select('#app>.s-space')
  if (!spaceApp) {
    return
  }
  Observer.childListSubtree(spaceApp, async () => {
    const deadVideos = dqa('.disabled[data-aid]')
    if (deadVideos.length === 0) {
      return
    }
    const aids = deadVideos.map(it => it.getAttribute('data-aid')!)
    const query: DeadVideoInfoProvider =
      settings.deadVideoTitleProvider === 'BiliPlus' ? new BiliplusProvider() : new WatchlaterProvider()
    const infos = await query.queryInfo(aids)
    console.log(`[显示失效视频信息]`, `deadVideos:`, deadVideos, `infos:`, infos)
    deadVideos.forEach((it, index) => {
      it.classList.remove('disabled')
      const aid = it.getAttribute('data-aid')!
      const link = (() => {
        if (settings.useBiliplusRedirect) {
          return `https://hd.biliplus.com/video/av${aid}`
        } else {
          return `//www.bilibili.com/video/av${aid}`
        }
      })()

      const info = infos.find(it => it.aid === aid)
      console.log(`[显示失效视频信息]`, '#' + index, info)
      if (info === undefined) {
        console.error(`[显示失效视频信息]信息获取失败, aid=${aid}`)
        return
      }

      const coverLink = it.querySelector('a.cover') as HTMLAnchorElement
      coverLink.target = '_blank'
      coverLink.href = link
      if (info.cover !== '') {
        coverLink.querySelector('img')!.src = info.cover.replace('http:', 'https:')
      }

      const titleLink = it.querySelector('a.title') as HTMLAnchorElement
      titleLink.target = '_blank'
      titleLink.title = info.title
      titleLink.href = link
      titleLink.innerText = info.title
    })
  })
})()
