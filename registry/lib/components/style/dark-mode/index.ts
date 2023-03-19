import { defineComponentMetadata } from '@/components/define'
import { darkExcludes } from './dark-urls'

const changeDelay = 200
const darkMetaColor = '#111'
const add = async () => {
  document.body.classList.add('dark')
  localStorage.setItem('pbp_theme_v4', 'b')
  const meta = dq('meta[name="theme-color"]') as HTMLMetaElement
  if (!meta) {
    document.head.insertAdjacentHTML(
      'beforeend',
      `<meta name="theme-color" content="${darkMetaColor}">`,
    )
  } else {
    meta.dataset.light = meta.content
    meta.content = darkMetaColor
  }
}
const remove = async () => {
  document.body.classList.remove('dark')
  const meta = dq('meta[name="theme-color"]') as HTMLMetaElement
  if (!meta) {
    return
  }
  if (meta.dataset.light) {
    meta.content = meta.dataset.light
  } else {
    meta.remove()
  }
}

export const component = defineComponentMetadata({
  name: 'darkMode',
  displayName: '夜间模式',
  entry: () => {
    setTimeout(add, changeDelay)
  },
  reload: () => {
    setTimeout(add, changeDelay)
  },
  unload: () => {
    setTimeout(remove, changeDelay)
  },
  description: '启用夜间模式能更好地适应光线暗的环境, 并会大量应用主题颜色.',
  tags: [componentsTags.style, componentsTags.general],
  instantStyles: [
    {
      name: 'dark-mode',
      style: () => import('./dark-mode.scss'),
      important: false,
    },
    {
      name: 'dark-mode-important',
      style: () => import('./dark-mode.important.scss'),
      important: true,
    },
  ],
  plugin: {
    displayName: '夜间模式 - 提前注入',
    description: {
      'zh-CN': '提前注入夜间模式的 .dark class 以减少一些组件首屏仍然是白色的问题.',
    },
    async setup() {
      const { contentLoaded } = await import('@/core/life-cycle')
      const { isComponentEnabled } = await import('@/core/settings')
      contentLoaded(() => {
        // 提前添加dark的class, 防止颜色抖动
        if (isComponentEnabled('darkMode')) {
          document.body.classList.add('dark')
        }
      })
      //修复一些番剧的样式class
      contentLoaded(() => {
        //查找id为danmukuBox的div
        const danmukuBox = document.querySelector('[id*="danmukuBox"]')
        if (danmukuBox) {
          //设置class为danmaku-box
          danmukuBox.className = 'danmaku-box';
        }
        //查找id为eplist_module的div 并添加class media-info-card
        const eplist_module = document.querySelector('[id*="list_module"]')
        if (eplist_module) {
          eplist_module.classList.add('media-info-card');
        }
        //查找clss为section_ep_section_module__GnauA的div 并添加class media-info-card
        const section_ep_section_module =  document.querySelector('[class*="section_ep_section_module"]')
        if (section_ep_section_module) {
          section_ep_section_module.classList.add('media-info-card');
        }

        //查找class为review_review_item_fill__Mn7Oi的divs 都添加class media-info-card
        const review_review_item_fills = document.querySelectorAll('[class*="review_review_item_fill"]')
        if (review_review_item_fills) {
          for (let i = 0; i < review_review_item_fills.length; i++) {
            review_review_item_fills[i].classList.add('media-info-card');
          }
        }

        //查找id为mogv-weslie-media-info-review的div 并添加class media-info-card
        const weslie_media_info_review = document.querySelector('[id*="weslie-media-info-review"]')
        if (weslie_media_info_review) {
          weslie_media_info_review.classList.add('media-info-card');
        }

        //查找id为paybar_moduled的div并删除
        const paybar_module = document.querySelector('[id*="paybar_module"]')
        if (paybar_module) {
          paybar_module.remove();
        }
      })
    },
  },
  urlExclude: darkExcludes,
})
