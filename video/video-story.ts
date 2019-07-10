export interface StoryInfo {
  title: string
  nodeID: number
  cid: number
}
export class StoryChoice implements StoryInfo {
  title: string
  nodeID: number
  cid: number
  default: boolean
  constructor(rawObject: { node_id: number, option: string, cid: number, is_default: number }) {
    this.title = rawObject.option
    this.nodeID = rawObject.node_id
    this.cid = rawObject.cid
    this.default = rawObject.is_default === 1
  }
}
export class StoryNode implements StoryInfo {
  title: string
  nodeID: number
  aid: number
  cid: number
  choices: StoryChoice[]
  choiceTime: number
  constructor(rawObject: { node_id: number, title: string, cid: number }, aid: number) {
    this.title = rawObject.title
    this.nodeID = rawObject.node_id
    this.aid = aid
    this.cid = rawObject.cid
    this.choices = []
    this.choiceTime = -1
  }
  async getChoices() {
    if (this.choices.length > 0) {
      return
    }
    const url = `https://api.bilibili.com/x/stein/nodeinfo?aid=${this.aid}&node_id=${this.nodeID}&graph_version=504`
    const json = await Ajax.getJson(url)
    if (json.code !== 0) {
      console.error(`获取选项失败: ${json.message}`)
      return
    }
    this.choices = json.data.edges.choices.map((it: any) => new StoryChoice(it)) as StoryChoice[]
  }
}
export class Story {
  startingNode: StoryNode
  nodeList: StoryNode[]
  constructor(nodeList: StoryNode[], startingNode?: StoryNode) {
    this.nodeList = nodeList
    if (startingNode) {
      this.startingNode = startingNode
    }
    else {
      [this.startingNode] = nodeList
    }
  }
  async getAllChoices() {
    return await Promise.all(this.nodeList.map(node => node.getChoices()))
  }
}
export const getStoryNodes = async (aid: number) => {
  const url = `https://api.bilibili.com/x/stein/nodeinfo?aid=${aid}&graph_version=504`
  const json = await Ajax.getJson(url)
  if (json.code !== 0) {
    return json.message as string
  }
  const nodeList = json.data.story_list.map((it: any) => new StoryNode(it, aid)) as StoryNode[]
  const startingNode = nodeList.find(it => it.nodeID === json.data.node_id)
  if (!startingNode) {
    return '获取起始结点失败'
  }
  startingNode.choiceTime = json.data.edges.show_time
  const choices = json.data.edges.choices.map((it: any) => new StoryChoice(it)) as StoryChoice[]
  startingNode.choices = choices
  return new Story(nodeList, startingNode)
}
export default {
  export: {
    StoryChoice,
    StoryNode,
    Story,
    getStoryNodes,
  }
}
