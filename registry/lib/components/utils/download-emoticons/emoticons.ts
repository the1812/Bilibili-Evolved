import { monkey } from '@/core/ajax'
import { useScopedConsole } from '@/core/utils/log'

const logger = useScopedConsole('表情包下载')

interface DownloadPromise {
  pkg_name: string // 表情包名称
  emoticons: { emoji: string; blob: Promise<Blob> }[]
}

export class Emoticons {
  private async getEmoticonsByRoomId(roomId: string) {
    const response = await this.apiRequest(
      `https://api.live.bilibili.com/xlive/web-ucenter/v2/emoticon/GetEmoticons?platform=pc&room_id=${roomId}`,
    )
    return response
  }
  async downloadEmoticons(emoticonsArray) {
    const downloadPromises: DownloadPromise[] = emoticonsArray.map(obj => {
      const emoticons = obj.emoticons.map(item => {
        try {
          const blob = this.getImageBlob(item.url)
          return {
            emoji: item.emoji,
            blob,
          }
        } catch (error) {
          logger.error(`下载表情 ${item.emoji} 失败:`, error)
          return null
        }
      })
      return {
        emoticons,
        pkg_name: obj.pkg_name,
      }
    })
    return downloadPromises
  }

  async getEmoticonsArray(roomId: string): Promise<Array<any>> {
    try {
      let response = await this.getEmoticonsByRoomId(roomId)
      if (response.data.data.length === 0) {
        logger.log('获取表情包失败，尝试获取真实roomId')
        const realRoomId = await this.getRealRoomId(roomId)
        response = await this.getEmoticonsByRoomId(realRoomId)
      }
      return response.data.data.filter(
        item => item.pkg_name === 'UP主大表情' || item.pkg_name === '房间专属表情',
      )
    } catch (error) {
      throw new Error('获取表情包失败')
    }
  }

  async batchDownload(tasks: DownloadPromise[]) {
    const results: any[] = []
    for (const task of tasks) {
      const promise = (async () => {
        const blobs: Blob[] = []
        const blobPromises = task.emoticons.map(e => e.blob)
        for (const blobPromise of blobPromises) {
          const blob = await blobPromise
          blobs.push(blob)
        }
        return {
          pkg_name: task.pkg_name,
          emoticons: task.emoticons.map((e, i) => ({ emoji: e.emoji, blob: blobs[i] })),
        }
      })()
      results.push(promise)
    }
    return Promise.all(results)
  }

  // 有的直播间id是超短id，需要获取到原始的roomid才能通过api获取到表情包
  async getRealRoomId(rid: string): Promise<string> {
    try {
      const response = await this.apiRequest(
        `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${rid}`,
      )
      if (Object.keys(response.data).length === 0) {
        throw new Error('获取直播间id失败')
      }
      return response.data.room_id
    } catch (error) {
      throw new Error('获取直播间id失败')
    }
  }

  apiRequest = (url: string): Promise<any> => {
    const details: MonkeyXhrBasicDetails = {
      url,
      method: 'GET',
      responseType: 'json',
    }
    return monkey(details)
  }

  getImageBlob = async (url: string) => {
    const details: MonkeyXhrBasicDetails = {
      url,
      method: 'GET',
      responseType: 'blob',
    }
    return monkey<Blob>(details)
  }
}
