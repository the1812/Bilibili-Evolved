import { NavbarComponent } from '../custom-navbar-component'
interface SuggestItem {
  value: string
  html: string
}
const originalHistory = new class {
  getAll(): SearchHistoryItem[] {
    const history = localStorage.getItem('search_history')
    if (!history) {
      return []
    }
    return (JSON.parse(history) as any[]).map(it => {
      return {
        keyword: it.value,
        date: new Date(it.timestamp).toJSON(),
        count: 1,
      }
    })
  }
  saveAll(items: SearchHistoryItem[]) {
    localStorage.setItem('search_history', JSON.stringify(items))
  }
  clear() {
    localStorage.setItem('search_history', '[]')
  }
  merge(items: SearchHistoryItem[]) {
    const originalItems = this.getAll()
    return _.uniqBy(items.concat(originalItems), it => it.keyword).slice(0, 10)
  }
  add(item: SearchHistoryItem) {
    const items = this.getAll()
    const existingItem = items.find(it => it.keyword === item.keyword)
    if (existingItem) {
      Object.assign(existingItem, item)
    } else {
      items.push(item)
    }
    this.saveAll(items)
  }
  remove(item: SearchHistoryItem) {
    const items = this.getAll()
    const index = items.findIndex(it => it.keyword === item.keyword)
    if (index > -1) {
      items.splice(index, 1)
      this.saveAll(items)
    }
  }
}
export class SearchBox extends NavbarComponent {
  constructor() {
    super()
    this.disabled = true
    this.html = /*html*/`
      <form id="custom-navbar-search" autocomplete="off" target="_blank" method="get" action="https://search.bilibili.com/all">
        <input type="text" placeholder="搜索" name="keyword">
        <input type="hidden" name="from_source" value="banner_search">
        <a style="display: none" target="_blank" class="recommended-target"></a>
        <button type="submit" title="搜索" tabindex="-1">
          <svg style="width:22px;height:22px" viewBox="0 0 24 24">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
        </button>
      </form>
      <div class="popup search-list" :class="{empty: items.length === 0}">
        <div
          class="search-list-item"
          tabindex="0"
          v-for="(item, index) of items"
          :title="isHistory ? item.html : ''"
          @keydown.enter="submit(item.value)"
          @click.self="submit(item.value)"
          @keydown.shift.delete="deleteItem(item, index)"
          @keydown.down.prevent="nextItem(index)"
          @keydown.up.prevent="previousItem(index)">
          <div
            class="search-list-item-text"
            :title="item.value"
            v-html="item.html"></div>
          <div
            class="delete-history"
            v-if="isHistory"
            title="删除此项"
            @click="deleteItem(item, index)">
            <i class="mdi mdi-18px mdi-close"></i>
          </div>
        </div>
        <div
          class="search-list-item clear-history"
          tabindex="0"
          v-if="items.length > 0 && isHistory"
          @click="clearSearchHistory()"
          @keydown.enter="clearSearchHistory()"
          @keydown.down.prevent="nextItem(items.length)"
          @keydown.up.prevent="previousItem(items.length)">
            <i class="mdi mdi-18px mdi-delete-sweep"></i>
            清除搜索历史
          </div>
      </div>
    `
    this.init()
  }
  async init() {
    const form = await SpinQuery.select('#custom-navbar-search') as HTMLFormElement
    const keywordInput = form.querySelector("input[name='keyword']") as HTMLInputElement
    form.addEventListener('submit', e => {
      if (keywordInput.value === '') {
        if (!settings.hideTopSearch) {
          (form.querySelector('.recommended-target') as HTMLElement).click()
        }
        e.preventDefault()
        return false
      }
      if (/^av[\d]+$/i.test(keywordInput.value)) {
        window.open(`https://www.bilibili.com/${keywordInput.value}`, '_blank')
        e.preventDefault()
        return false
      }
      // const now = Number(new Date())
      // if (keywordInput.value === '拜年祭' && Number(new Date('2020-01-17')) < now && now < Number(new Date('2020-02-01'))) {
      //   window.open(`https://www.bilibili.com/blackboard/xianxing2020bnj.html`)
      //   e.preventDefault()
      //   return false
      // }
      const historyItem = settings.searchHistory.find(item => item.keyword === keywordInput.value)
      if (historyItem) {
        historyItem.count++
        historyItem.date = new Date().toJSON()
        originalHistory.add(historyItem)
      } else {
        const newItem = {
          count: 1,
          keyword: keywordInput.value,
          date: new Date().toJSON(),
        }
        settings.searchHistory.unshift(newItem)
        originalHistory.add(newItem)
      }
      settings.searchHistory = settings.searchHistory.slice(0, 10) // save history
      return true
    })
    if (!settings.hideTopSearch) {
      const json = await Ajax.getJson('https://api.bilibili.com/x/web-interface/search/default')
      if (json.code === 0) {
        keywordInput.setAttribute('placeholder', json.data.show_name)
        let href
        if (json.data.url !== '') {
          href = json.data.url
        }
        else if (json.data.name.startsWith('av')) {
          href = `https://www.bilibili.com/${json.data.name}`
        }
        else {
          href = `https://search.bilibili.com/all?keyword=${json.data.name}`
        }
        (form.querySelector('.recommended-target') as HTMLElement).setAttribute('href', href)
      }
      else {
        console.error('[自定义顶栏] 获取搜索推荐词失败')
      }
    }
    const searchList = new Vue({
      el: dq('.popup.search-list') as HTMLElement,
      data: {
        items: [] as SuggestItem[],
        isHistory: true,
      },
      methods: {
        submit(value: string) {
          keywordInput.value = value
          form.submit()
          // submit method will not trigger submit event
          // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit
          raiseEvent(form, 'submit')
        },
        nextItem(index: number) {
          const item = dq(`.custom-navbar .search-list-item:nth-child(${index + 2})`) as HTMLElement
          if (item) {
            item.focus()
          }
        },
        previousItem(index: number) {
          const item = dq(`.custom-navbar .search-list-item:nth-child(${index})`) as HTMLElement
          if (item) {
            item.focus()
          } else {
            keywordInput.focus()
            return
          }
        },
        deleteItem(item: SuggestItem, index: number) {
          const historyIndex = settings.searchHistory.findIndex(it => it.keyword === item.value)
          const [historyItem] = settings.searchHistory.splice(historyIndex, 1)
          originalHistory.remove(historyItem)
          settings.searchHistory = settings.searchHistory
          this.items.splice(index, 1)
        },
        clearSearchHistory() {
          originalHistory.clear()
          settings.searchHistory = []
          this.items = []
        }
      },
    })
    let lastQueuedRequest = ''
    const updateSuggest = async () => {
      const text = keywordInput.value
      searchList.isHistory = text === ''
      if (searchList.isHistory) {
        searchList.items = originalHistory.merge(settings.searchHistory)
          .sort((a, b) => {
            const aDate = a.date ? new Date(a.date) : new Date(0)
            const bDate = b.date ? new Date(b.date) : new Date(0)
            return Number(bDate) - Number(aDate)
          })
          .map(item => {
            return {
              value: item.keyword,
              html: item.keyword,
            }
          }).slice(0, 10)
      } else {
        const url = `https://s.search.bilibili.com/main/suggest?func=suggest&suggest_type=accurate&sub_type=tag&main_ver=v1&highlight=&userid=${getUID()}&bangumi_acc_num=1&special_acc_num=1&topic_acc_num=1&upuser_acc_num=3&tag_num=10&special_num=10&bangumi_num=10&upuser_num=3&term=${text}`
        lastQueuedRequest = url
        const json = await Ajax.getJson(url)
        if (json.code !== 0 || lastQueuedRequest !== url) {
          return
        }
        const results = json.result.tag
        if (results === undefined) {
          searchList.items = []
          return
        }
        searchList.items = results.map((item: any) => {
          return {
            value: item.value,
            html: item.name.replace(/suggest_high_light/g, 'suggest-highlight')
          }
        })
      }
    }
    updateSuggest()
    const debouncedSuggest = _.debounce(updateSuggest, 200)
    let composing = false
    keywordInput.addEventListener('compositionstart', () => composing = true)
    keywordInput.addEventListener('compositionend', () => {
      composing = false
      raiseEvent(keywordInput, 'input')
    })
    keywordInput.addEventListener('input', () => {
      if (!composing) {
        debouncedSuggest()
      }
    })
    keywordInput.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' && searchList.items.length > 0) {
        e.preventDefault();
        (dq('.custom-navbar .search-list-item:first-child') as HTMLElement).focus()
      }
    })
  }
  get name(): keyof CustomNavbarOrders {
    return 'search'
  }
}
export default {
  export: {
    SearchBox,
  },
}