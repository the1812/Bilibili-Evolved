import { getFriendlyTitle } from '../title';
import { VideoInfo, DanmakuInfo } from '../video-info';
class Video {
    constructor() {
        this.menuClasses = ['quality', 'action', 'progress'];
        [this.currentMenuClass] = this.menuClasses;
    }
    get menuPanel() {
        return document.querySelector('.download-video-panel');
    }
    addMenuClass() {
        this.menuPanel.classList.remove(...this.menuClasses);
        this.menuPanel.classList.add(this.currentMenuClass);
        return this.currentMenuClass;
    }
    resetMenuClass() {
        [this.currentMenuClass] = this.menuClasses;
        this.addMenuClass();
    }
    nextMenuClass() {
        const index = this.menuClasses.indexOf(this.currentMenuClass) + 1;
        const next = this.menuClasses[index >= this.menuClasses.length ? 0 : index];
        this.currentMenuClass = next;
        this.addMenuClass();
        return next;
    }
    closeMenu() {
        this.menuPanel.classList.remove('opened');
        setTimeout(() => this.resetMenuClass(), 200);
    }
    addError() {
        this.menuPanel.classList.add('error');
    }
    removeError() {
        this.menuPanel.classList.remove('error');
        this.resetMenuClass();
    }
    async getUrl(quality) {
        if (quality) {
            return `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${quality}&otype=json`;
        }
        else {
            return `https://api.bilibili.com/x/player/playurl?avid=${pageData.aid}&cid=${pageData.cid}&otype=json`;
        }
    }
}
class Bangumi extends Video {
    async getUrl(quality) {
        if (quality) {
            return `https://api.bilibili.com/pgc/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=${quality}&otype=json`;
        }
        else {
            return `https://api.bilibili.com/pgc/player/web/playurl?avid=${pageData.aid}&cid=${pageData.cid}&qn=&otype=json`;
        }
    }
}
const pageData = {
    entity: new Video(),
    aid: '',
    cid: ''
};
let formats = [];
let selectedFormat = null;
class VideoFormat {
    constructor(quality, internalName, displayName) {
        this.quality = quality;
        this.internalName = internalName;
        this.displayName = displayName;
    }
    async downloadInfo() {
        const videoInfo = new VideoDownloader(this);
        await videoInfo.fetchVideoInfo();
        return videoInfo;
    }
    static get availableFormats() {
        return new Promise((resolve, reject) => {
            pageData.entity.getUrl().then(url => {
                const xhr = new XMLHttpRequest();
                xhr.addEventListener('load', () => {
                    const json = JSON.parse(xhr.responseText);
                    if (json.code !== 0) {
                        reject('获取清晰度信息失败.');
                        return;
                    }
                    const data = json.data || json.result || json;
                    const qualities = data.accept_quality;
                    const internalNames = data.accept_format.split(',');
                    const displayNames = data.accept_description;
                    const formats = [];
                    while (qualities.length > 0) {
                        const format = new VideoFormat(qualities.pop(), internalNames.pop(), displayNames.pop());
                        formats.push(format);
                    }
                    resolve(formats.reverse());
                });
                xhr.addEventListener('error', () => reject(`获取清晰度信息失败.`));
                xhr.withCredentials = true;
                xhr.open('GET', url);
                xhr.send();
            });
        });
    }
}
class VideoDownloaderFragment {
    constructor(length, size, url, backupUrls) {
        this.length = length;
        this.size = size;
        this.url = url;
        this.backupUrls = backupUrls;
    }
}
class VideoDownloader {
    constructor(format, fragments) {
        this.fragmentSplitFactor = 6 * 5;
        this.workingXhr = null;
        this.progressMap = new Map();
        this.format = format;
        this.fragments = fragments || [];
    }
    get totalSize() {
        return this.fragments.map(it => it.size).reduce((acc, it) => acc + it);
    }
    fetchVideoInfo() {
        return new Promise((resolve, reject) => {
            pageData.entity.getUrl(this.format.quality).then(url => {
                const xhr = new XMLHttpRequest();
                xhr.addEventListener('load', () => {
                    const json = JSON.parse(xhr.responseText.replace(/http:/g, 'https:'));
                    const data = json.data || json.result || json;
                    if (data.quality !== this.format.quality) {
                        reject('获取下载链接失败, 请确认当前账号有下载权限后重试.');
                    }
                    const urls = data.durl;
                    this.fragments = urls.map((it) => new VideoDownloaderFragment(it.length, it.size, it.url, it.backup_url));
                    resolve(this.fragments);
                });
                xhr.withCredentials = true;
                xhr.open('GET', url);
                xhr.send();
            });
        });
    }
    updateProgress() {
        const progress = this.progressMap
            ? [...this.progressMap.values()].reduce((a, b) => a + b, 0) / this.totalSize : 0;
        if (progress > 1 || progress < 0) {
            console.error(`[下载视频] 进度异常: ${progress}`, this.progressMap.values());
        }
        this.progress && this.progress(progress);
    }
    cancelDownload() {
        if (this.workingXhr !== null) {
            this.workingXhr.forEach(it => it.abort());
        }
        else {
            logError('Cancel Download Failed: forEach in this.workingXhr not found.');
        }
    }
    downloadFragment(fragment) {
        const promises = [];
        this.workingXhr = [];
        this.progressMap = new Map();
        this.updateProgress();
        const partialLength = Math.round(fragment.size / this.fragmentSplitFactor);
        let startByte = 0;
        const getPartNumber = (xhr) => [...this.progressMap.keys()].indexOf(xhr) + 1;
        while (startByte < fragment.size) {
            const endByte = Math.min(fragment.size - 1, Math.round(startByte + partialLength));
            const range = `bytes=${startByte}-${endByte}`;
            const rangeLength = endByte - startByte + 1;
            promises.push(new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', fragment.url);
                xhr.responseType = 'arraybuffer';
                xhr.withCredentials = false;
                xhr.addEventListener('progress', (e) => {
                    console.log(`[下载视频] 视频片段${getPartNumber(xhr)}下载进度: ${e.loaded}/${rangeLength} bytes loaded, ${range}`);
                    this.progressMap.set(xhr, e.loaded);
                    this.updateProgress();
                });
                xhr.addEventListener('load', () => {
                    if (('' + xhr.status)[0] === '2') {
                        resolve(xhr.response);
                    }
                    else {
                        reject(`请求失败.`);
                    }
                });
                xhr.addEventListener('abort', () => reject('canceled'));
                xhr.addEventListener('error', () => {
                    console.error(`[下载视频] 视频片段${getPartNumber(xhr)}下载失败: ${range}`);
                    this.progressMap.set(xhr, 0);
                    this.updateProgress();
                    xhr.open('GET', fragment.url);
                    xhr.setRequestHeader('Range', range);
                    xhr.send();
                });
                xhr.setRequestHeader('Range', range);
                this.progressMap.set(xhr, 0);
                xhr.send();
                this.workingXhr.push(xhr);
            }));
            startByte = Math.round(startByte + partialLength) + 1;
        }
        return Promise.all(promises);
    }
    copyUrl() {
        const urls = this.fragments.map(it => it.url).reduce((acc, it) => acc + '\r\n' + it);
        GM_setClipboard(urls, 'text');
    }
    static downloadBlob(blob, filename) {
        const a = document.createElement('a');
        let url;
        if (typeof blob === 'string') {
            url = blob;
        }
        else {
            url = URL.createObjectURL(blob);
        }
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }
    async exportData(copy = false) {
        const data = JSON.stringify([{
                fragments: this.fragments,
                title: getFriendlyTitle(),
                totalSize: this.fragments.map(it => it.size).reduce((acc, it) => acc + it),
                referer: document.URL.replace(window.location.search, '')
            }]);
        if (copy) {
            GM_setClipboard(data, 'text');
        }
        else {
            const blob = new Blob([data], { type: 'text/json' });
            const danmaku = await this.downloadDanmaku();
            if (danmaku !== null) {
                const zip = new JSZip();
                zip.file(`${getFriendlyTitle()}.json`, blob);
                zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku);
                VideoDownloader.downloadBlob(await zip.generateAsync({ type: 'blob' }), `${getFriendlyTitle()}.zip`);
            }
            else {
                VideoDownloader.downloadBlob(blob, `${getFriendlyTitle()}.json`);
            }
        }
    }
    async exportAria2(rpc = false) {
        if (rpc) {
        }
        else { // https://aria2.github.io/manual/en/html/aria2c.html#input-file
            const input = `
# Generated by Bilibili Evolved Video Export
# https://github.com/the1812/Bilibili-Evolved/
${this.fragments.map((it, index) => {
                let indexNumber = '';
                if (this.fragments.length > 1) {
                    indexNumber = ' - ' + (index + 1);
                }
                return `
${it.url}
  referer=${document.URL.replace(window.location.search, '')}
  user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0
  out=${getFriendlyTitle()}${indexNumber}.flv
  split=${this.fragmentSplitFactor}
  `.trim();
            }).join('\n')}
      `.trim();
            const blob = new Blob([input], { type: 'text/plain' });
            const danmaku = await this.downloadDanmaku();
            if (danmaku !== null) {
                const zip = new JSZip();
                zip.file(`${getFriendlyTitle()}.txt`, blob);
                zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku);
                VideoDownloader.downloadBlob(await zip.generateAsync({ type: 'blob' }), `${getFriendlyTitle()}.zip`);
            }
            else {
                VideoDownloader.downloadBlob(blob, `${getFriendlyTitle()}.txt`);
            }
        }
    }
    extension(fragment) {
        return (fragment || this.fragments[0]).url
            .indexOf('.flv') !== -1
            ? '.flv'
            : '.mp4';
    }
    makeBlob(data, fragment) {
        return new Blob(Array.isArray(data) ? data : [data], {
            type: this.extension(fragment) === '.flv' ? 'video/x-flv' : 'video/mp4'
        });
    }
    cleanUpOldBlobUrl() {
        const oldBlobUrl = dq('a#video-complete').getAttribute('href');
        if (oldBlobUrl && !dq(`.link[href="${oldBlobUrl}"]`)) {
            URL.revokeObjectURL(oldBlobUrl);
        }
        dqa('.toast-card-header')
            .filter((it) => it.innerText.includes('下载视频'))
            .forEach((it) => it.querySelector('.toast-card-dismiss').click());
    }
    async downloadDanmaku() {
        if (this.danmakuOption !== '无') {
            const danmakuInfo = new DanmakuInfo(parseInt(pageData.cid));
            await danmakuInfo.fetchInfo();
            if (this.danmakuOption === 'XML') {
                return danmakuInfo.rawXML;
            }
            else {
                const { convertToAss } = await import('../download-danmaku');
                return convertToAss(danmakuInfo.rawXML);
            }
        }
        else {
            return null;
        }
    }
    async downloadSingle(downloadedData) {
        const danmaku = await this.downloadDanmaku();
        const [data] = downloadedData;
        if (danmaku === null) {
            const blob = this.makeBlob(data);
            const filename = getFriendlyTitle() + this.extension();
            return { blob, filename };
        }
        else {
            const zip = new JSZip();
            zip.file(getFriendlyTitle() + this.extension(), this.makeBlob(data));
            zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku);
            const blob = await zip.generateAsync({ type: 'blob' });
            const filename = getFriendlyTitle() + '.zip';
            return { blob, filename };
        }
    }
    async downloadMultiple(downloadedData) {
        const zip = new JSZip();
        const title = getFriendlyTitle();
        if (downloadedData.length > 1) {
            downloadedData.forEach((data, index) => {
                const fragment = this.fragments[index];
                zip.file(`${title} - ${index + 1}${this.extension(fragment)}`, this.makeBlob(data, fragment));
            });
        }
        else {
            const [data] = downloadedData;
            zip.file(`${title}${this.extension()}`, this.makeBlob(data));
        }
        const danmaku = await this.downloadDanmaku();
        if (danmaku !== null) {
            zip.file(getFriendlyTitle() + '.' + this.danmakuOption.toLowerCase(), danmaku);
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        const filename = title + '.zip';
        return { blob, filename };
    }
    async download() {
        const downloadedData = [];
        for (const fragment of this.fragments) {
            const data = await this.downloadFragment(fragment);
            downloadedData.push(data);
        }
        if (downloadedData.length < 1) {
            throw new Error('下载失败.');
        }
        let { blob, filename } = await (async () => {
            if (downloadedData.length === 1) {
                return await this.downloadSingle(downloadedData);
            }
            else {
                return await this.downloadMultiple(downloadedData);
            }
        })();
        this.cleanUpOldBlobUrl();
        const blobUrl = URL.createObjectURL(blob);
        this.progress && this.progress(0);
        return {
            url: blobUrl,
            filename: filename
        };
    }
}
async function checkBatch() {
    // document.getElementById('video-action-batch-data')!.addEventListener('click', async () => {
    //   if (!selectedFormat) {
    //     return
    //   }
    //   pageData.entity.closeMenu()
    //   const toast = Toast.info('获取链接中...', '批量下载')
    //   const data = await extractor.collectData(selectedFormat, toast)
    //   if (!data) {
    //     return
    //   }
    //   GM_setClipboard(data, { type: 'text/json' })
    //   Toast.success('已复制批量数据到剪贴板.', '复制批量数据', 3000)
    // })
    // document.getElementById('video-action-batch-download-data')!.addEventListener('click', async () => {
    //   if (!selectedFormat) {
    //     return
    //   }
    //   pageData.entity.closeMenu()
    //   const toast = Toast.info('获取链接中...', '批量下载')
    //   const data = await extractor.collectData(selectedFormat, toast)
    //   if (!data) {
    //     return
    //   }
    //   const blob = new Blob([data], { type: 'text/json' })
    //   VideoDownloader.downloadBlob(blob, 'export.json')
    // })
    // document.getElementById('video-action-aria2-batch')!.addEventListener('click', async () => {
    //   if (!selectedFormat) {
    //     return
    //   }
    //   pageData.entity.closeMenu()
    //   const toast = Toast.info('获取链接中...', '批量下载')
    //   const data = await extractor.collectAria2(selectedFormat, toast)
    //   if (!data) {
    //     return
    //   }
    //   const blob = new Blob([data], { type: 'text/plain' })
    //   VideoDownloader.downloadBlob(blob, `${getFriendlyTitle(false)}.txt`)
    // })
}
async function loadPageData() {
    const aid = await SpinQuery.select(() => (unsafeWindow || window).aid);
    const cid = await SpinQuery.select(() => (unsafeWindow || window).cid);
    if (!(aid && cid)) {
        return false;
    }
    pageData.aid = aid;
    pageData.cid = cid;
    if (document.URL.indexOf('bangumi') !== -1) {
        pageData.entity = new Bangumi();
    }
    else {
        pageData.entity = new Video();
    }
    try {
        formats = await VideoFormat.availableFormats;
    }
    catch (error) {
        return false;
    }
    return true;
}
async function loadWidget() {
    selectedFormat = formats[0];
    // const loadQualities = async () => {
    //   const canDownload = await loadPageData();
    //   (document.querySelector('#download-video') as HTMLElement).style.display = canDownload ? 'flex' : 'none'
    //   if (canDownload === false) {
    //     return
    //   }
    //   // formats = await VideoFormat.availableFormats;
    //   const list = document.querySelector('ol.video-quality') as HTMLOListElement
    //   list.childNodes.forEach(list.removeChild)
    //   formats.forEach(format => {
    //     const item = document.createElement('li')
    //     item.innerHTML = format.displayName
    //     item.addEventListener('click', () => {
    //       selectedFormat = format
    //       pageData.entity.nextMenuClass()
    //     })
    //     list.insertAdjacentElement('afterbegin', item)
    //   })
    // }
    // Observer.videoChange(loadQualities)
    // const getVideoInfo = () => selectedFormat!.downloadInfo().catch(error => {
    //   pageData.entity.addError()
    //   dq('.video-error')!.innerHTML = error
    // })
    // async function download() {
    //   if (!selectedFormat) {
    //     return
    //   }
    //   pageData.entity.nextMenuClass()
    //   const info = await getVideoInfo()
    //   if (!info) {
    //     return
    //   }
    //   info.progress = percent => {
    //     dq('.download-progress-value')!.innerHTML = `${fixed(percent * 100)}`;
    //     (dq('.download-progress-foreground') as HTMLDivElement).style.transform = `scaleX(${percent})`
    //   };
    //   (dq('.download-progress-cancel>span') as HTMLSpanElement).onclick = () => info.cancelDownload()
    //   const result = await info.download()
    //     .catch(error => {
    //       pageData.entity.addError()
    //       dq('.video-error')!.innerHTML = error
    //     })
    //   if (!result) { // canceled or other errors
    //     return
    //   }
    //   const completeLink = document.getElementById('video-complete') as HTMLAnchorElement
    //   completeLink.setAttribute('href', result.url)
    //   completeLink.setAttribute('download', result.filename)
    //   completeLink.click()
    //   const message = `下载完成. <a class="link" href="${result.url}" download="${result.filename.replace(/"/g, '&quot;')}">再次保存</a>`
    //   Toast.success(message, '下载视频')
    //   pageData.entity.closeMenu()
    // }
    // async function copyLink() {
    //   if (!selectedFormat) {
    //     return
    //   }
    //   const info = await getVideoInfo()
    //   if (!info) {
    //     return
    //   }
    //   info.copyUrl()
    //   Toast.success('已复制链接到剪贴板.', '复制链接', 3000)
    //   pageData.entity.closeMenu()
    // }
    // dq('#video-action-download')!.addEventListener('click', download)
    // dq('#video-action-copy')!.addEventListener('click', copyLink)
    // dq('#video-action-copy-data')!.addEventListener('click', async () => {
    //   if (!selectedFormat) {
    //     return
    //   }
    //   const info = await getVideoInfo()
    //   if (!info) {
    //     return
    //   }
    //   info.exportData(true)
    //   Toast.success('已复制数据到剪贴板.', '复制数据', 3000)
    //   pageData.entity.closeMenu()
    // })
    // dq('#video-action-download-data')!.addEventListener('click', async () => {
    //   if (!selectedFormat) {
    //     return
    //   }
    //   const info = await getVideoInfo()
    //   if (!info) {
    //     return
    //   }
    //   info.exportData(false)
    //   pageData.entity.closeMenu()
    // })
    // dq('#video-action-aria2')!.addEventListener('click', async () => {
    //   if (!selectedFormat) {
    //     return
    //   }
    //   const info = await getVideoInfo()
    //   if (!info) {
    //     return
    //   }
    //   info.exportAria2(false)
    //   pageData.entity.closeMenu()
    // })
    resources.applyStyle('downloadVideoStyle');
    dq('#download-video').addEventListener('click', () => {
        dq('.download-video').classList.toggle('opened');
        dq('.gui-settings-mask').click();
    });
    dq('#download-video').addEventListener('mouseover', () => {
        document.body.insertAdjacentHTML('beforeend', resources.import('downloadVideoHtml'));
        loadPanel();
    }, { once: true });
}
async function loadPanel() {
    Vue.component('v-dropdown', {
        template: /*html*/ `
    <div class="v-dropdown" v-on:click="toggleDropdown()">
      <span class="selected">{{value}}</span>
      <ul class="dropdown-menu" v-bind:class="{opened: dropdownOpen}">
        <li v-for="item in model.items" v-bind:key="item" v-bind:data-value="item" v-on:click="select(item)">{{item}}</li>
      </ul>
      <i class="mdi mdi-chevron-down"></i>
    </div>
  `,
        props: [
            'model',
        ],
        data() {
            return {
                dropdownOpen: false,
            };
        },
        computed: {
            value() {
                return this.model.value;
            }
        },
        methods: {
            toggleDropdown() {
                this.dropdownOpen = !this.dropdownOpen;
            },
            select(item) {
                this.model.value = item;
                this.$emit('change');
            },
        },
    });
    Vue.component('v-checkbox', {
        template: /*html*/ `
      <div class="v-checkbox" v-on:click="toggleCheck()" v-bind:class="{checked: model.checked}">
        <i class="mdi mdi-checkbox-blank-circle-outline">
          <i class="mdi mdi-checkbox-marked-circle"></i>
        </i>
        <span class="content">{{model.title}}</span>
      </div>
    `,
        props: ['model'],
        methods: {
            toggleCheck() {
                this.model.checked = !this.model.checked;
            },
        },
    });
    let workingDownloader;
    const sizeCache = new Map();
    const panel = new Vue({
        el: '.download-video',
        data: {
            downloadSingle: true,
            coverUrl: '',
            qualityModel: {
                value: selectedFormat.displayName,
                items: formats.map(f => f.displayName)
            },
            danmakuModel: {
                value: settings.downloadVideoDefaultDanmaku,
                items: ['无', 'XML', 'ASS']
            },
            progressPercent: 0,
            size: 0,
            blobUrl: '',
            episodeList: [],
            downloading: false,
            batch: false,
        },
        mounted() {
            this.formatChange();
        },
        computed: {
            title() {
                if (document.URL.includes('/www.bilibili.com/bangumi/')) {
                    return this.downloadSingle ? getFriendlyTitle(false) : getFriendlyTitle(true);
                }
                else {
                    return this.downloadSingle ? getFriendlyTitle(true) : getFriendlyTitle(false);
                }
            },
            displaySize() {
                if (typeof this.size === 'string') {
                    return this.size;
                }
                const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                let number = this.size;
                let unitIndex = 0;
                while (number >= 1024) {
                    number /= 1024;
                    unitIndex++;
                }
                return `${Math.round(number * 10) / 10}${units[unitIndex]}`;
            },
            sizeWarning() {
                if (typeof this.size === 'string') {
                    return false;
                }
                return this.size > 1073741824; // 1GB
            },
            selectedEpisodeCount() {
                return this.episodeList.filter(item => item.checked).length;
            },
        },
        methods: {
            close() {
                this.$el.classList.remove('opened');
            },
            danmakuOptionChange() {
                settings.downloadVideoDefaultDanmaku = this.danmakuModel.value;
            },
            async formatChange() {
                const format = this.getFormat();
                const cache = sizeCache.get(format);
                if (cache) {
                    this.size = cache;
                    return;
                }
                try {
                    this.size = '获取大小中';
                    const videoDownloader = await format.downloadInfo();
                    this.size = videoDownloader.totalSize;
                    sizeCache.set(format, this.size);
                }
                catch (error) {
                    this.size = '获取大小失败';
                }
            },
            getFormat() {
                const format = formats.find(f => f.displayName === this.qualityModel.value);
                if (!format) {
                    console.error(`No format found. model value = ${this.qualityModel.value}`);
                    return null;
                }
                return format;
            },
            async exportData(type) {
                if (!this.downloadSingle) {
                    this.exportBatchData(type);
                    return;
                }
                const format = this.getFormat();
                const videoDownloader = await format.downloadInfo();
                videoDownloader.danmakuOption = this.danmakuModel.value;
                switch (type) {
                    case 'copyLink':
                        videoDownloader.copyUrl();
                        Toast.success('已复制链接到剪贴板.', '下载视频', 3000);
                        break;
                    case 'aria2':
                        videoDownloader.exportAria2(false);
                        break;
                    case 'copyVLD':
                        videoDownloader.exportData(true);
                        Toast.success('已复制VLD数据到剪贴板.', '下载视频', 3000);
                        break;
                    case 'exportVLD':
                        videoDownloader.exportData(false);
                        break;
                    default:
                        break;
                }
            },
            async exportBatchData(type) {
                if (this.episodeList.every(item => item.checked === false)) {
                    Toast.info('请至少选择1集或以上的数量!', '批量导出', 3000);
                    return;
                }
                const format = this.getFormat();
                // if (this.danmakuModel.value !== '无') {
                //   const danmakuToast = Toast.info('下载弹幕中...', '批量导出')
                // }
                const toast = Toast.info('获取链接中...', '批量导出');
                const episodeFilter = (item) => {
                    const match = this.episodeList.find((it) => it.cid === item.cid);
                    if (match === undefined) {
                        return false;
                    }
                    return match.checked;
                };
                this.batchExtractor.itemFilter = episodeFilter;
                let result;
                switch (type) {
                    case 'aria2':
                        result = await this.batchExtractor.collectAria2(format, toast);
                        VideoDownloader.downloadBlob(result, getFriendlyTitle(false) + '.txt');
                        return;
                    case 'copyVLD':
                        GM_setClipboard(await this.batchExtractor.collectData(format, toast), { mimetype: 'text/plain' });
                        Toast.success('已复制批量vld数据到剪贴板.', '批量导出', 3000);
                        return;
                    case 'exportVLD':
                        result = await this.batchExtractor.collectData(format, toast);
                        VideoDownloader.downloadBlob(result, getFriendlyTitle(false) + '.json');
                        return;
                    default:
                        toast.dismiss();
                        return;
                }
            },
            async checkBatch() {
                const urls = [
                    '/www.bilibili.com/bangumi',
                    '/www.bilibili.com/video/av'
                ];
                if (!urls.some(url => document.URL.includes(url))) {
                    return;
                }
                const { BatchExtractor } = await import('batch-download');
                if (await BatchExtractor.test() !== true) {
                    return;
                }
                this.batchExtractor = new BatchExtractor();
                this.batch = true;
                this.episodeList = (await this.batchExtractor.getItemList()).map((item, index) => {
                    return {
                        aid: item.aid,
                        cid: item.cid,
                        title: item.title,
                        index,
                        checked: true,
                    };
                });
            },
            cancelDownload() {
                if (workingDownloader) {
                    workingDownloader.cancelDownload();
                }
            },
            async startDownload() {
                const format = this.getFormat();
                try {
                    this.downloading = true;
                    const videoDownloader = await format.downloadInfo();
                    videoDownloader.danmakuOption = this.danmakuModel.value;
                    videoDownloader.progress = percent => {
                        this.progressPercent = Math.trunc(percent * 100);
                    };
                    workingDownloader = videoDownloader;
                    const result = await videoDownloader.download();
                    const completeLink = document.getElementById('video-complete');
                    completeLink.setAttribute('href', result.url);
                    completeLink.setAttribute('download', result.filename);
                    completeLink.click();
                    Toast.success(/*html*/ `下载完成: ${result.filename} <a class="link" href="${result.url}" download="${result.filename.replace(/"/g, '&quot;')}">再次保存</a>`, '下载视频');
                }
                catch (error) {
                    if (error !== 'canceled') {
                        logError(error);
                    }
                    this.progressPercent = 0;
                }
                finally {
                    this.downloading = false;
                }
            },
        }
    });
    const videoInfo = new VideoInfo(parseInt(pageData.aid));
    await videoInfo.fetchInfo();
    panel.coverUrl = videoInfo.coverUrl.replace('http:', 'https:');
    await panel.checkBatch();
}
export default {
    widget: {
        content: /*html*/ `
      <button class="gui-settings-flat-button" style="position: relative; z-index: 100;" id="download-video">
        <i class="icon-download"></i>
        <span>下载视频</span>
      </button>`,
        condition: loadPageData,
        success: loadWidget
    }
};
