(() =>
{
    return () =>
    {
        class VideoInfo
        {
            constructor(aid)
            {
                this.aid = aid;
            }
            async fetchInfo()
            {
                const json = JSON.parse(await downloadText(`https://api.bilibili.com/x/web-interface/view?aid=${this.aid}`));
                if (json.code !== 0)
                {
                    throw new Error(json.message);
                }
                const data = json.data;
                this.cid = data.cid;
                this.pageCount = data.videos;
                this.coverUrl = data.pic;
                this.tagId = data.tid;
                this.tagName = data.tname;
                this.title = data.title;
                this.description = data.desc;
                this.up = {
                    uid: data.owner.mid,
                    name: data.owner.name,
                    faceUrl: data.owner.face
                };
                this.pages = data.pages.map(it =>
                {
                    return {
                        cid: it.cid,
                        title: it.part,
                        pageNumber: it.page
                    };
                });
                return this;
            }
        }
        class Danmaku
        {
            constructor(text, p)
            {
                this.text = text;
                this.p = p;
            }
        }
        class DanmakuInfo
        {
            constructor(cid)
            {
                this.cid = cid;
            }
            async fetchInfo()
            {
                const xml = await downloadText(`https://api.bilibili.com/x/v1/dm/list.so?oid=${this.cid}`);
                this.rawXML = xml;

                const dom = new DOMParser().parseFromString(xml, "application/xml").documentElement;
                this.xml = dom;
                this.danmakus = [].map.call(dom.querySelectorAll("d[p]"), it =>
                {
                    return new Danmaku(it.innerHTML, it.getAttribute("p"));
                });
            }
        }
        class BangumiInfo
        {
            constructor(ep)
            {
                this.ep = ep;
                this.videos = [];
            }
            async fetchInfo()
            {
                const data = await downloadText(`https://www.bilibili.com/bangumi/play/ep${this.ep}/`);
                const json = JSON.parse(data.match(/window\.__INITIAL_STATE__=(.*);\(function\(\){/)[1]);
                this.title = json.mediaInfo.title;
                this.cover = json.mediaInfo.cover;
                this.squareCover = json.mediaInfo.square_cover;
                this.aid = json.epInfo.aid;
                this.cid = json.epInfo.cid;
                this.videos = json.epList.map(async (it) =>
                {
                    return {
                        title: it.index_title,
                        aid: it.aid,
                        cid: it.cid,
                        info: await new VideoInfo(it.aid).fetchInfo()
                    };
                });
                return this;
            }
        }
        return {
            export: {
                VideoInfo: VideoInfo,
                BangumiInfo: BangumiInfo,
                Danmaku: Danmaku,
                DanmakuInfo: DanmakuInfo
            }
        };
    };
})();