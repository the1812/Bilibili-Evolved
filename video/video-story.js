export class StoryChoice {
    constructor(rawObject) {
        this.title = rawObject.option;
        this.nodeID = rawObject.node_id;
        this.cid = rawObject.cid;
        this.default = rawObject.is_default === 1;
    }
}
export class StoryNode {
    constructor(rawObject, aid, graphVersion) {
        this.title = rawObject.title;
        this.nodeID = rawObject.node_id;
        this.aid = aid;
        this.cid = rawObject.cid;
        this.graphVersion = graphVersion;
        this.choices = [];
        this.choiceTime = -1;
    }
    async getChoices() {
        if (this.choices.length > 0) {
            return;
        }
        const url = `https://api.bilibili.com/x/stein/nodeinfo?aid=${this.aid}&node_id=${this.nodeID}&graph_version=504`;
        const json = await Ajax.getJsonWithCredentials(url);
        if (json.code !== 0) {
            console.error(`获取选项失败: ${json.message}`);
            return;
        }
        this.choices = json.data.edges.choices.map((it) => new StoryChoice(it));
    }
}
export class Story {
    constructor(nodeList, startingNode) {
        this.nodeList = nodeList;
        if (startingNode) {
            this.startingNode = startingNode;
        }
        else {
            [this.startingNode] = nodeList;
        }
    }
    async getAllChoices() {
        return await Promise.all(this.nodeList.map(node => node.getChoices()));
    }
}
export const getStoryNodes = async (aid, graphVersion) => {
    const url = `https://api.bilibili.com/x/stein/nodeinfo?aid=${aid}&graph_version=${graphVersion}`;
    const json = await Ajax.getJsonWithCredentials(url);
    if (json.code !== 0) {
        return json.message;
    }
    const nodeList = json.data.story_list.map((it) => new StoryNode(it, aid, graphVersion));
    const startingNode = nodeList.find(it => it.nodeID === json.data.node_id);
    if (!startingNode) {
        return '获取起始结点失败';
    }
    startingNode.choiceTime = json.data.edges.show_time;
    const choices = json.data.edges.choices.map((it) => new StoryChoice(it));
    startingNode.choices = choices;
    return new Story(nodeList, startingNode);
};
export default {
    export: {
        StoryChoice,
        StoryNode,
        Story,
        getStoryNodes,
    }
};
