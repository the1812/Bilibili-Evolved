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
  private readInt(buffer: Uint8Array, start: number, length: number) {
    let result = 0
    for (let i = length - 1; i >= 0; i--) {
      result += Math.pow(256, length - i - 1) * buffer[start + i]
    }
    return result
  }
  private writeInt(buffer: number[], start: number, length: number, value: number) {
    let i = 0
    while (i < length) {
      buffer[start + i] = value / Math.pow(256, length - i - 1)
      i++
    }
  }
  encode(text: string, operationCode: keyof typeof liveOperationCodes) {
    const data = this.textEncoder.encode(text)
    const packetLen = 16 + data.byteLength
    const header = [0, 0, 0, 0, 0, 16, 0, 1, 0, 0, 0, liveOperationCodes[operationCode], 0, 0, 0, 1]
    this.writeInt(header, 0, 4, packetLen)
    return (new Uint8Array(header.concat(...data))).buffer
  }
  decode(blob: Blob) {
    const decodeBuffer = async (buffer: Uint8Array) => {
      const result: DecodeResult = {
        packetLength: this.readInt(buffer, 0, 4),
        headerLength: this.readInt(buffer, 4, 2),
        protocolVersion: this.readInt(buffer, 6, 2),
        operation: this.readInt(buffer, 8, 4),
        sequenceID: this.readInt(buffer, 12, 4),
      }
      const results = [result]
      if (result.packetLength < buffer.length) {
        results.push(...await decodeBuffer(buffer.slice(result.packetLength)))
      }
      if (result.operation === liveOperationCodes.message) {
        const bodyBuffer = buffer.slice(result.headerLength, result.packetLength)
        if (result.protocolVersion === protocolVersionCodes.buffer) {
          const { pako } = await import('./pako-inflate')
          result.messages = (await decodeBuffer(pako.inflate(bodyBuffer))).map(it => it.messages![0])
        } else if (result.protocolVersion === protocolVersionCodes.json) {
          result.messages = [JSON.parse(this.textDecoder.decode(bodyBuffer))]
        }
      } else if (result.operation === liveOperationCodes.heartBeatResponse) {
        result.heartBeatResponse = {
          count: this.readInt(buffer, 16, 4)
        }
      }
      return results
    }
    return new Promise<DecodeResult[]>((resolve) => {
      const reader = new FileReader()
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const buffer = new Uint8Array(e.target!.result as ArrayBuffer)
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
      const timeElement = dq('.bilibili-live-player-video-controller-duration-btn span') as HTMLElement
      const observer = Observer.childList(timeElement, records => {
        const isTimeChanged = records.length > 0
          && records.some(r => {
            return r.addedNodes.length > 0
              && [...r.addedNodes].every(it => it.nodeType === Node.TEXT_NODE)
          })
        if (isTimeChanged) {
          observer.stop()
          const time = records[0].addedNodes[0].textContent as string
          const [seconds, minutes, hours = 0] = time.split(':').reverse().map(_.unary(parseInt))
          const now = Number(new Date())
          this.startTime = now - hours * 1000 * 3600 - minutes * 60 * 1000 - seconds * 1000
          resolve(this.startTime)
        }
      })
    })
  }
}
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
export class LiveSocket extends EventTarget {
  heartBeatTimer: number
  webSocket: WebSocket
  retryInterval = 200
  autoRetry = true
  private liveTime = new LiveTimeExtractor()
  private bufferHelper = new SocketBufferHelper()
  private stopRequested = false

  constructor(public roomID: number) {
    super()
    window.addEventListener('unload', () => this.stop())
  }
  heartBeat() {
    this.webSocket.send(this.bufferHelper.encode('', 'heartBeat'))
  }
  restart() {
    this.dispatchEvent(new CustomEvent('restart'))
    if (!this.stopRequested && this.autoRetry) {
      console.log(`Live Socket: unexpected disconnect, retry in ${this.retryInterval}ms`)
      setTimeout(() => this.start(), this.retryInterval)
    }
  }
  async start() {
    const roomConfig = await Ajax.getJson(`https://api.live.bilibili.com/room/v1/Danmu/getConf?room_id=${this.roomID}&platform=pc&player=web`)
    const hostServers: any[] = _.get(roomConfig, 'data.host_server_list', [])
    let server = 'broadcastlv.chat.bilibili.com'
    if (hostServers.length > 0) {
      server = hostServers[0].host
    }
    if (this.webSocket && (this.webSocket.readyState === WebSocket.CONNECTING || this.webSocket.readyState === WebSocket.OPEN)) {
      this.stop()
    }
    this.webSocket = new WebSocket(`wss://${server}/sub`)
    this.dispatchEvent(new CustomEvent('start', {
      detail: this.webSocket
    }))
    this.webSocket.addEventListener('open', () => {
      const enterRoomData = {
        roomid: this.roomID,
        uid: parseInt(getUID()),
        protover: 2,
        platform: 'web',
        clientVer: '1.10.1',
        type: '2',
        key: _.get(roomConfig, 'data.token'),
      }
      this.webSocket.send(this.bufferHelper.encode(JSON.stringify(enterRoomData), 'enterRoom'))
      this.dispatchEvent(new CustomEvent('open', {
        detail: enterRoomData,
      }))
    })
    this.webSocket.addEventListener('message', async e => {
      const [data] = await this.bufferHelper.decode(e.data)
      this.dispatchEvent(new CustomEvent('message', {
        detail: data
      }))
      switch (data.operation) {
        case liveOperationCodes.enterRoomResponse: {
          if (this.heartBeatTimer) {
            clearInterval(this.heartBeatTimer)
          }
          this.heartBeatTimer = setInterval(() => {
            this.heartBeat()
          }, 30 * 1000)
          break
        }
        case liveOperationCodes.heartBeatResponse: {
          this.dispatchEvent(new CustomEvent('heartBeatResponse', {
            detail: data.heartBeatResponse!.count,
          }))
          break
        }
        case liveOperationCodes.message: {
          const startTime = await this.liveTime.getLiveTime()
          data.messages!.forEach((body: any) => {
            if (body.cmd === 'DANMU_MSG') {
              // info 里的东西参考: https://github.com/simon300000/bilibili-live-ws
              const info = body.info
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
              this.dispatchEvent(new CustomEvent('danmaku', {
                detail: danmaku,
              }))
            }
          })
          break
        }
        default: break
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
  stop() {
    this.stopRequested = true
    if (this.heartBeatTimer) {
      clearInterval(this.heartBeatTimer)
    }
    if (this.webSocket) {
      this.webSocket.close()
    }
  }
}

export default {
  export: {
    LiveSocket
  }
}