(async () => {
    if (!document.URL.startsWith('https://space.bilibili.com')) {
        return;
    }
    class DeadVideoInfoProvider {
    }
    class BiliplusProvider extends DeadVideoInfoProvider {
        convertToDeadVideoInfo(raw) {
            return {
                title: raw.title,
                cover: raw.pic,
            };
        }
        async queryInfo(aids) {
            const results = [];
            if (aids.length <= BiliplusProvider.MaxCountPerRequest) {
                const json = await Ajax.getJson(`${BiliplusProvider.BiliplusHost}/api/aidinfo?aid=${aids.join(',')}`);
                if (json.code === 0) {
                    results.push(...aids.map(aid => {
                        if (aid in json.data) {
                            return this.convertToDeadVideoInfo(json.data[aid]);
                        }
                        else {
                            return {
                                title: '已失效视频',
                                cover: '',
                            };
                        }
                    }));
                }
                else {
                    console.error(`[显示失效视频信息] Biliplus API 未成功. message=${json.message}`);
                }
            }
            else {
                results.push(...(await this.queryInfo(aids.slice(0, BiliplusProvider.MaxCountPerRequest))));
                results.push(...(await this.queryInfo(aids.slice(BiliplusProvider.MaxCountPerRequest))));
            }
            return results;
        }
    }
    BiliplusProvider.BiliplusHost = `https://hd.biliplus.com`;
    BiliplusProvider.MaxCountPerRequest = 30;
    class WatchlaterProvider extends DeadVideoInfoProvider {
        async queryInfo(aids) {
            const results = [];
            await Promise.all(aids.map(aid => Ajax.postTextWithCredentials('https://api.bilibili.com/x/v2/history/toview/add', `aid=${aid}&csrf=${WatchlaterProvider.csrf}`)));
            const json = await Ajax.getJsonWithCredentials('https://api.bilibili.com/x/v2/history/toview/web');
            if (json.code === 0) {
                const watchlaterList = json.data.list.map((it) => {
                    return {
                        aid: it.aid,
                        title: it.title,
                        cover: it.pic,
                    };
                });
                results.push(...aids
                    .map(aid => watchlaterList.find(item => item.aid === parseInt(aid)))
                    .filter(it => it !== undefined));
                await Promise.all(aids.map(aid => Ajax.postTextWithCredentials('https://api.bilibili.com/x/v2/history/toview/del', `aid=${aid}&csrf=${WatchlaterProvider.csrf}`)));
            }
            else {
                console.error(`[显示失效视频信息] 稍后再看 API 未成功. message=${json.message}`);
            }
            return results;
        }
    }
    WatchlaterProvider.csrf = document.cookie.replace(/(?:(?:^|.*;\s*)bili_jct\s*\=\s*([^;]*).*$)|^.*$/, '$1');
    const spaceApp = await SpinQuery.select('#app>.s-space');
    if (!spaceApp) {
        return;
    }
    Observer.childListSubtree(spaceApp, async () => {
        const deadVideos = dqa('.disabled[data-aid]');
        if (deadVideos.length === 0) {
            return;
        }
        const aids = deadVideos.map(it => it.getAttribute('data-aid'));
        const query = settings.deadVideoTitleProvider === 'BiliPlus' ? new BiliplusProvider() : new WatchlaterProvider();
        const infos = await query.queryInfo(aids);
        deadVideos.forEach((it, index) => {
            it.classList.remove('disabled');
            const aid = it.getAttribute('data-aid');
            const link = (() => {
                if (settings.useBiliplusRedirect) {
                    return `https://hd.biliplus.com/video/av${aid}`;
                }
                else {
                    return `//www.bilibili.com/video/av${aid}`;
                }
            })();
            const coverLink = it.querySelector('a.cover');
            coverLink.target = '_blank';
            coverLink.href = link;
            const info = infos[index];
            if (info.cover !== '') {
                coverLink.querySelector('img').src = info.cover.replace('http:', 'https:');
            }
            const titleLink = it.querySelector('a.title');
            titleLink.target = '_blank';
            titleLink.title = info.title;
            titleLink.href = link;
            titleLink.innerText = info.title;
        });
    });
})();
