import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import {
  CommentAreaV3,
  CommentReplyItem,
  forEachCommentItem,
} from '@/components/utils/comment-apis'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import translateIcon from './translate.svg'

const name = 'commentsOfficialTranslate'
const buttonClass = 'be-comment-translate'
const resultClass = 'be-comment-translation'

enum TargetLanguage {
  SimplifiedChinese = '简体中文',
  TraditionalChinese = '繁体中文',
  English = '英语',
  Japanese = '日语',
  Thai = '泰语',
  Vietnamese = '越南语',
  Indonesian = '印尼语',
  Malay = '马来语',
  Arabic = '阿拉伯语',
  Portuguese = '葡萄牙语',
  Spanish = '西班牙语',
  Turkish = '土耳其语',
  Russian = '俄语',
}
/** 各目标语言对应的 `c_locale` 参数, 语言范围同 b 站国际化支持的语言 */
const locales: Record<TargetLanguage, { language: string; script?: string }> = {
  [TargetLanguage.SimplifiedChinese]: { language: 'zh', script: 'Hans' },
  [TargetLanguage.TraditionalChinese]: { language: 'zh', script: 'Hant' },
  [TargetLanguage.English]: { language: 'en' },
  [TargetLanguage.Japanese]: { language: 'ja' },
  [TargetLanguage.Thai]: { language: 'th' },
  [TargetLanguage.Vietnamese]: { language: 'vi' },
  [TargetLanguage.Indonesian]: { language: 'id' },
  [TargetLanguage.Malay]: { language: 'ms' },
  [TargetLanguage.Arabic]: { language: 'ar' },
  [TargetLanguage.Portuguese]: { language: 'pt' },
  [TargetLanguage.Spanish]: { language: 'es' },
  [TargetLanguage.Turkish]: { language: 'tr' },
  [TargetLanguage.Russian]: { language: 'ru' },
}

const options = defineOptionsMetadata({
  targetLanguage: {
    defaultValue: TargetLanguage.SimplifiedChinese,
    displayName: '目标语言',
    dropdownEnum: TargetLanguage,
  },
})
type Options = OptionsOfMetadata<typeof options>

/** 评论的 Lit 数据 / API 数据中用到的部分 */
interface ReplyData {
  rpid_str: string
  oid_str: string
  type: number
  content?: { emote?: Record<string, { url: string }> }
  translated_content?: { message?: string }
  replies?: ReplyData[]
}

/** `目标语言:评论 ID` -> 译文 */
const translations = new Map<string, string>()
const fetchTranslation = async (reply: ReplyData, language: TargetLanguage) => {
  const getKey = (id: string) => `${language}:${id}`
  const key = getKey(reply.rpid_str)
  if (!translations.has(key)) {
    const params = new URLSearchParams({
      type: reply.type.toString(),
      oid: reply.oid_str,
      mode: '3',
      ps: '1',
      seek_rpid: reply.rpid_str,
      // 带上此参数后, b 站的评论 API 会附带对应语言的译文
      'x-bili-locale-json': JSON.stringify({
        c_locale: locales[language],
        always_translate: true,
      }),
    })
    const data = await bilibiliApi<{ replies?: ReplyData[] }>(
      getJsonWithCredentials(`https://api.bilibili.com/x/v2/reply/main?${params.toString()}`),
      '获取评论翻译失败',
      false,
    )
    // 返回的是整楼, 顺便缓存同楼其他评论的译文
    data.replies
      ?.flatMap(root => [root, ...(root.replies ?? [])])
      .forEach(it => {
        const text = it.translated_content?.message
        if (text) {
          translations.set(getKey(it.rpid_str), text)
        }
      })
  }
  return translations.get(key)
}

/** 将译文渲染到容器中, 其中的 [表情] 用原评论自带的表情图还原 */
const renderTranslation = (container: HTMLElement, text: string, reply: ReplyData) => {
  const emotes = reply.content?.emote ?? {}
  const nodes = text.split(/(\[[^[\]]+\])/).map(part => {
    const url = emotes[part]?.url
    if (!url) {
      return part
    }
    const image = document.createElement('img')
    image.src = url
    image.alt = part
    return image
  })
  container.innerHTML = ''
  container.append(...nodes)
}

/** 获取评论操作栏中的"回复"按钮, 评论尚未渲染完成时返回 `null` */
const getReplyButton = (item: CommentReplyItem) => {
  const root = item.element.shadowRoot
  // 一级评论的内容在内层的 bili-comment-renderer 里, 楼中楼回复则直接在自身的 Shadow DOM 里
  const renderer = root?.querySelector('bili-comment-renderer')?.shadowRoot ?? root
  return (
    renderer
      ?.querySelector('bili-comment-action-buttons-renderer')
      ?.shadowRoot?.querySelector('#reply') ?? null
  )
}

const injectButton = async (item: CommentReplyItem) => {
  if (!(item.parent instanceof CommentAreaV3)) {
    return
  }
  const replyButton = await select(() => getReplyButton(item))
  if (!replyButton) {
    return
  }
  const actions = replyButton.getRootNode() as ShadowRoot
  const footer = actions.host.parentElement
  if (!footer || actions.querySelector(`.${buttonClass}`)) {
    return
  }
  const reply: ReplyData = item.frameworkSpecificProps

  const button = document.createElement('button')
  button.title = '翻译'
  button.innerHTML = translateIcon
  const wrapper = document.createElement('div')
  wrapper.className = buttonClass
  wrapper.append(button)
  const result = document.createElement('div')
  result.className = resultClass
  // 两者默认隐藏, 由 translate-shadow.scss 显示; 组件关闭后样式被移除, 它们也就随之隐藏
  wrapper.hidden = true
  result.hidden = true

  // 记录已显示译文的语言, 在设置中更换目标语言后, 重新展开时会重新获取
  let loadedLanguage: TargetLanguage | null = null
  button.addEventListener('click', async () => {
    const open = result.classList.toggle('open')
    wrapper.classList.toggle('active', open)
    const language = getComponentSettings<Options>(name).options.targetLanguage
    if (!open || loadedLanguage === language) {
      return
    }
    loadedLanguage = null
    result.textContent = '翻译中...'
    try {
      const text = await fetchTranslation(reply, language)
      if (text) {
        renderTranslation(result, text, reply)
        loadedLanguage = language
      } else {
        result.textContent = '暂无翻译 (已是目标语言, 或 b 站尚未生成译文)'
      }
    } catch (error) {
      result.textContent = error instanceof Error ? error.message : '获取评论翻译失败'
    }
  })

  replyButton.after(wrapper)
  // 译文显示在评论正文和操作栏之间
  footer.before(result)
}

const entry = () => {
  const processItems = (items: CommentReplyItem[]) => {
    items.forEach(item => injectButton(item))
  }
  forEachCommentItem({
    added: item => {
      processItems([item, ...item.replies])
      item.addEventListener('repliesUpdate', e => processItems(e.detail))
    },
  })
}

export const component = defineComponentMetadata({
  name,
  displayName: '评论区翻译',
  author: {
    name: 'Nytsai1029',
    link: 'https://github.com/Nytsai1029',
  },
  tags: [componentsTags.utils],
  options,
  instantStyles: [
    {
      name,
      style: () => import('./translate-shadow.scss'),
      shadowDom: true,
    },
  ],
  entry,
})
