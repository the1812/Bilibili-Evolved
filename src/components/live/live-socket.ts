import { childList } from '@/core/observer'
import { dq, getUID } from '@/core/utils'
import { getJson } from '@/core/ajax'

// https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md
const protocolVersionCodes = {
  json: 0,
  heartBeatResponse: 1,
  buffer: 2,
}
const liveOperationCodes = {
  heartBeat: 2,
  heartBeatResponse: 3,
  message: 5,
  enterRoom: 7,
  enterRoomResponse: 8,
}
type DecodeResult = {
  packetLength: number
  headerLength: number
  protocolVersion: number
  operation: number
  sequenceID: number
  heartBeatResponse?: { count: number }
  messages?: DecodeResult[]
}
class SocketBufferHelper {
  private textEncoder = new TextEncoder()
  private textDecoder = new TextDecoder()
  private static readInt(buffer: Uint8Array, start: number, length: number) {
    let result = 0
    for (let i = length - 1; i >= 0; i--) {
      result += 256 ** (length - i - 1) * buffer[start + i]
    }
    return result
  }
  private static writeInt(buffer: number[], start: number, length: number, value: number) {
    let i = 0
    while (i < length) {
      buffer[start + i] = value / 256 ** (length - i - 1)
      i++
    }
  }
  encode(text: string, operationCode: keyof typeof liveOperationCodes) {
    const data = this.textEncoder.encode(text)
    const packetLen = 16 + data.byteLength
    const header = [0, 0, 0, 0, 0, 16, 0, 1, 0, 0, 0, liveOperationCodes[operationCode], 0, 0, 0, 1]
    SocketBufferHelper.writeInt(header, 0, 4, packetLen)
    return new Uint8Array(header.concat(...data)).buffer
  }
  decode(blob: Blob) {
    const decodeBuffer = async (buffer: Uint8Array) => {
      const result: DecodeResult = {
        packetLength: SocketBufferHelper.readInt(buffer, 0, 4),
        headerLength: SocketBufferHelper.readInt(buffer, 4, 2),
        protocolVersion: SocketBufferHelper.readInt(buffer, 6, 2),
        operation: SocketBufferHelper.readInt(buffer, 8, 4),
        sequenceID: SocketBufferHelper.readInt(buffer, 12, 4),
      }
      const results = [result]
      if (result.packetLength < buffer.length) {
        results.push(...(await decodeBuffer(buffer.slice(result.packetLength))))
      }
      if (result.operation === liveOperationCodes.message) {
        const bodyBuffer = buffer.slice(result.headerLength, result.packetLength)
        if (result.protocolVersion === protocolVersionCodes.buffer) {
          const { pako } = await import('@/third-party/pako-inflate')
          const decodeResult = await decodeBuffer(pako.inflate(bodyBuffer))
          if (decodeResult) {
            result.messages = decodeResult.map(it => it.messages[0])
          }
        } else if (result.protocolVersion === protocolVersionCodes.json) {
          result.messages = [JSON.parse(this.textDecoder.decode(bodyBuffer))]
        }
      } else if (result.operation === liveOperationCodes.heartBeatResponse) {
        result.heartBeatResponse = {
          count: SocketBufferHelper.readInt(buffer, 16, 4),
        }
      }
      return results
    }
    return new Promise<DecodeResult[]>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (!e.target) {
          reject(e)
          return
        }
        const buffer = new Uint8Array(e.target.result as ArrayBuffer)
        resolve(await decodeBuffer(buffer))
      }
      reader.readAsArrayBuffer(blob)
    })
  }
}
class LiveTimeExtractor {
  private startTime = 0
  getLiveTime() {
    return new Promise<number>(resolve => {
      if (this.startTime) {
        resolve(this.startTime)
        return
      }
      const timeElement = dq(
        '.bilibili-live-player-video-controller-duration-btn span',
      ) as HTMLElement
      const [observer] = childList(timeElement, records => {
        const isTimeChanged =
          records.length > 0 &&
          records.some(
            r =>
              r.addedNodes.length > 0 &&
              [...r.addedNodes].every(it => it.nodeType === Node.TEXT_NODE),
          )
        if (isTimeChanged) {
          observer.disconnect()
          const time = records[0].addedNodes[0].textContent as string
          const [seconds, minutes, hours = 0] = time
            .split(':')
            .reverse()
            .map(lodash.unary(parseInt))
          const now = Number(new Date())
          this.startTime = now - hours * 1000 * 3600 - minutes * 60 * 1000 - seconds * 1000
          resolve(this.startTime)
        }
      })
    })
  }
}
/** 表示一条直播弹幕 */
export interface LiveDanmaku {
  /** 内容 */
  content: string
  /** 发送的时间点 */
  sendTime: number
  /** 直播的开始时间点 */
  startTime: number
  /** 相对直播开始时间的弹幕发送时间 */
  time: number
  /** 字体大小(25为标准) */
  fontSize: number
  /** 颜色(そうなのか？) */
  color: number
  userHash: string
  userName: string
  userID: number
  /** 弹幕类型
   * (我猜跟视频的弹幕类型含义一样)
   * 1 - 滚动
   * 4 - 底端
   * 5 - 顶端
   */
  type: number
}
/** 直播间WebSocket处理
 *
 * 可监听的事件:
 * - `restart` 重启
 * - `start` 开始
 * - `open` 进入房间
 * - `message` 收到WebSocket消息
 * - `heartBeatResponse` 收到心跳回应
 * - `danmaku` 收到弹幕
 */
export class LiveSocket extends EventTarget {
  heartBeatTimer: number
  webSocket: WebSocket
  retryInterval = 200
  autoRetry = true
  servers: string[] = ['broadcastlv.chat.bilibili.com']
  selectedServer = ''
  private liveTime = new LiveTimeExtractor()
  private bufferHelper = new SocketBufferHelper()
  private stopRequested = false

  /** 创建直播间的WebSocket处理
   * @param roomID 直播间房间号
   */
  constructor(public roomID: number) {
    super()
    window.addEventListener('unload', () => this.stop())
  }
  /** 发送心跳 */
  heartBeat() {
    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(this.bufferHelper.encode('', 'heartBeat'))
    } else {
      this.stop()
      this.restart()
    }
  }
  /** 重启WebSocket */
  restart() {
    this.dispatchEvent(new CustomEvent('restart'))
    if (!this.stopRequested && this.autoRetry) {
      console.log(`Live Socket: unexpected disconnect, retry in ${this.retryInterval}ms`)
      const index = this.servers.indexOf(this.selectedServer)
      if (index < this.servers.length - 1) {
        // 尝试下一个服务器
        this.selectedServer = this.servers[index + 1]
      } else {
        // 所有服务器用尽, 从头再来
        ;[this.selectedServer] = this.servers
      }
      console.log('Live Socket: server changed to', this.selectedServer)
      setTimeout(() => this.start(), this.retryInterval)
    }
  }
  /** 启动WebSocket */
  async start() {
    const roomConfig = await getJson(
      `https://api.live.bilibili.com/room/v1/Danmu/getConf?room_id=${this.roomID}&platform=pc&player=web`,
    )
    const hostServers: { host: string }[] = lodash.get(roomConfig, 'data.host_server_list', [])
    // let server = 'broadcastlv.chat.bilibili.com'
    // if (hostServers.length > 0) {
    //   server = hostServers[0].host
    // }
    this.servers = [...new Set([...this.servers, ...hostServers.map(it => it.host)])]
    if (this.selectedServer === '') {
      // 首次启动
      ;[this.selectedServer] = this.servers
      console.log('Initial server:', this.selectedServer)
    }

    if (
      this.webSocket &&
      [WebSocket.CONNECTING, WebSocket.OPEN].includes(this.webSocket.readyState)
    ) {
      this.stop()
    }
    this.webSocket = new WebSocket(`wss://${this.selectedServer}/sub`)
    this.stopRequested = false
    this.dispatchEvent(
      new CustomEvent('start', {
        detail: this.webSocket,
      }),
    )
    this.webSocket.addEventListener('open', () => {
      const enterRoomData = {
        roomid: this.roomID,
        uid: parseInt(getUID()),
        protover: 2,
        platform: 'web',
        clientVer: '1.10.1',
        type: '2',
        key: lodash.get(roomConfig, 'data.token'),
      }
      this.webSocket.send(this.bufferHelper.encode(JSON.stringify(enterRoomData), 'enterRoom'))
      this.dispatchEvent(
        new CustomEvent('open', {
          detail: enterRoomData,
        }),
      )
    })
    this.webSocket.addEventListener('message', async e => {
      const [data] = await this.bufferHelper.decode(e.data)
      this.dispatchEvent(
        new CustomEvent('message', {
          detail: data,
        }),
      )
      switch (data.operation) {
        case liveOperationCodes.enterRoomResponse: {
          if (this.heartBeatTimer) {
            clearInterval(this.heartBeatTimer)
          }
          this.heartBeatTimer = window.setInterval(() => {
            this.heartBeat()
          }, 30 * 1000)
          break
        }
        case liveOperationCodes.heartBeatResponse: {
          if (!data.heartBeatResponse) {
            break
          }
          this.dispatchEvent(
            new CustomEvent('heartBeatResponse', {
              detail: data.heartBeatResponse.count,
            }),
          )
          break
        }
        case liveOperationCodes.message: {
          if (!data.messages) {
            break
          }
          const startTime = await this.liveTime.getLiveTime()
          data.messages.forEach((body: any) => {
            if (body.cmd === 'DANMU_MSG') {
              // info 里的东西参考: https://github.com/simon300000/bilibili-live-ws
              const { info } = body
              const danmaku: LiveDanmaku = {
                content: info[1],
                type: info[0][1],
                fontSize: info[0][2],
                color: info[0][3],
                sendTime: info[0][4],
                userHash: info[0][7],
                userID: info[2][0],
                userName: info[2][1],
                startTime,
                get time() {
                  return this.sendTime - this.startTime
                },
              }
              this.dispatchEvent(
                new CustomEvent('danmaku', {
                  detail: danmaku,
                }),
              )
            }
          })
          break
        }
        default:
          break
      }
    })
    this.webSocket.addEventListener('close', e => {
      if (!this.stopRequested) {
        console.error('Live Socket: close', e)
        this.restart()
      }
    })
    this.webSocket.addEventListener('error', e => {
      console.error('Live Socket: error', e)
      this.restart()
    })
  }
  /** 关闭WebSocket */
  stop() {
    this.stopRequested = true
    if (this.heartBeatTimer) {
      clearInterval(this.heartBeatTimer)
    }
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.close()
    }
  }
}
