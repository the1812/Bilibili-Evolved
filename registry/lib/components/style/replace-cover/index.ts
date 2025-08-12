import throttle from 'lodash/throttle'
import { defineComponentMetadata } from '@/components/define'
import { styledComponentEntry } from '@/components/styled-component'
import { ComponentEntry } from '@/components/types'

const previewCache = new Map<string, string>()
const concurrentLimit = 15
let running = 0
const queue: (() => Promise<void>)[] = []

/**
 * Wraps an async function to limit concurrent executions.
 * @param fn The async function to run.
 */
async function runWithLimit(fn: () => Promise<void>) {
  if (running >= concurrentLimit) {
    await new Promise<void>(resolve => {
      queue.push(async () => {
        await fn()
        resolve()
      })
    })
    return
  }
  running += 1
  try {
    await fn()
  } finally {
    running -= 1
    if (queue.length > 0) {
      const next = queue.shift()
      next?.()
    }
  }
}

/**
 * Fetches video preview image data (specific frame from a sprite sheet).
 * Uses createImageBitmap with cropping for efficiency.
 * Caches results.
 * @param bvid The Bilibili video ID (BV...).
 * @returns A data URL of the preview image, or null if unsuccessful.
 */
async function getVideoPreview(bvid: string): Promise<string | null> {
  const cachedUrl = previewCache.get(bvid)
  if (cachedUrl) {
    return cachedUrl
  }
  try {
    const apiUrl = new URL('https://api.bilibili.com/x/player/videoshot')
    apiUrl.searchParams.set('bvid', bvid)
    apiUrl.searchParams.set('index', '1')
    let apiRes = await fetch(apiUrl.toString())
    if (apiRes.status === 412) {
      // 412 error, pause for 30 seconds and retry once.
      await new Promise(r => setTimeout(r, 30000))
      apiRes = await fetch(apiUrl.toString())
      if (apiRes.status === 412) {
        return null
      }
    }
    const json = await apiRes.json()
    if (json.code !== 0 || !json.data?.image) {
      // 404 is a common case for videos without preview data, so we don't log it.
      return null
    }

    const { image, index = [], img_x_len, img_y_len, img_x_size, img_y_size } = json.data
    const totalPerImage = img_x_len * img_y_len

    const mid = Array.isArray(index) && index.length > 0 ? Math.floor((index.length - 1) / 2) : 0

    const pageIndex = Math.floor(mid / totalPerImage)
    if (pageIndex >= image.length) {
      return null
    }
    const indexInPage = mid % totalPerImage
    const xIndex = indexInPage % img_x_len
    const yIndex = Math.floor(indexInPage / img_x_len)
    const sx = xIndex * img_x_size
    const sy = yIndex * img_y_size
    const sw = img_x_size
    const sh = img_y_size
    const fullImageUrl = image[pageIndex].startsWith('//')
      ? `https:${image[pageIndex]}`
      : image[pageIndex]
    const imgRes = await fetch(fullImageUrl, { mode: 'cors' })
    if (!imgRes.ok) {
      return null
    }
    const imgBlob = await imgRes.blob()
    let imageBitmap: ImageBitmap
    try {
      imageBitmap = await createImageBitmap(imgBlob, sx, sy, sw, sh, {})
    } catch (bitmapError) {
      console.error('[replaceCover] createImageBitmap error:', bitmapError)
      // Fallback to canvas method if createImageBitmap fails
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas')
              canvas.width = sw
              canvas.height = sh
              const ctx = canvas.getContext('2d')
              if (!ctx) {
                reject(new Error('Could not get canvas context in fallback.'))
                return
              }
              ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
              const dataUrlResult = canvas.toDataURL('image/jpeg', 0.9)
              resolve(dataUrlResult)
            } catch (e) {
              console.error('[replaceCover] canvas error:', e)
              reject(e)
            }
          }
          img.onerror = e =>
            reject(new Error(`Image load error in fallback for ${fullImageUrl}: ${e}`))
          img.src = fullImageUrl
        })
        previewCache.set(bvid, dataUrl)
        return dataUrl
      } catch (fallbackError) {
        console.error('[replaceCover] fallback error:', fallbackError)
        return null
      }
    }
    const canvas = document.createElement('canvas')
    canvas.width = img_x_size
    canvas.height = img_y_size
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      imageBitmap.close()
      return null
    }
    ctx.drawImage(imageBitmap, 0, 0)
    imageBitmap.close()
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    previewCache.set(bvid, dataUrl)
    return dataUrl
  } catch (error) {
    console.error('[replaceCover] Error fetching video preview:', error)
    return null
  }
}

/**
 * Processes a single video card element to replace its cover.
 * @param card The video card HTMLElement.
 */
async function processVideoCard(card: HTMLElement) {
  const videoLink = card.querySelector('a.bili-video-card__image--link')
  if (!videoLink) {
    return
  }

  const href = videoLink.getAttribute('href')
  const bvMatch = href?.match(/\/video\/(BV[\w]+)/)
  if (!bvMatch) {
    return
  }

  const bvid = bvMatch[1]
  const imgContainer = videoLink.querySelector('.bili-video-card__image--wrap')

  if (!imgContainer || imgContainer.querySelector('.custom-preview-img')) {
    return
  }

  const originalImg = imgContainer.querySelector('picture img') as HTMLImageElement | null
  if (!originalImg) {
    return
  }

  const customImg = document.createElement('img')
  customImg.className = 'custom-preview-img'

  if (originalImg.alt) {
    customImg.alt = originalImg.alt
  }

  if (originalImg.style.aspectRatio) {
    customImg.style.aspectRatio = originalImg.style.aspectRatio
  }

  imgContainer.appendChild(customImg)

  await runWithLimit(async () => {
    try {
      const previewUrl = await getVideoPreview(bvid)

      if (!previewUrl) {
        customImg.remove()
        return
      }

      await new Promise<void>(resolve => {
        const tempImg = new Image()
        tempImg.onload = () => {
          customImg.src = previewUrl
          customImg.classList.add('loaded')
          resolve()
        }
        tempImg.onerror = () => {
          customImg.remove()
          resolve() // Resolve anyway to not block other promises
        }
        tempImg.src = previewUrl
      })
    } catch (e) {
      console.error('[replaceCover] Error processing video card:', e)
      customImg.remove()
    }
  })
}

/**
 * Processes a list of potential video card HTMLElements.
 * @param elements Array of HTMLElements to check and process.
 */
async function replaceCover(elements: HTMLElement[]) {
  const videoCardsToProcess = elements.filter(card => card.classList?.contains('bili-video-card'))
  if (videoCardsToProcess.length === 0) {
    return
  }
  await Promise.allSettled(videoCardsToProcess.map(card => processVideoCard(card)))
}

/**
 * MutationObserver callback to filter added nodes and trigger cover replacement.
 * @param mutationsList List of mutation records.
 */
function videoFilter(mutationsList: MutationRecord[]) {
  const filteredElements: HTMLElement[] = []
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement
          if (element.classList?.contains('bili-video-card')) {
            filteredElements.push(element)
          }
          const descendantCards = element.querySelectorAll<HTMLElement>('.bili-video-card')
          descendantCards.forEach(descendantCard => filteredElements.push(descendantCard))
        }
      }
    }
  }
  const uniqueElements = Array.from(new Set(filteredElements))
  if (uniqueElements.length > 0) {
    replaceCover(uniqueElements)
  }
}

/**
 * The main entry point for the component.
 */
const replaceCoverComponent: ComponentEntry = async () => {
  const containerSelectors = [
    'main > .feed2 > .recommended-container_floor-aside > .container',
    'main > .feed2 > .container',
    '.recommended-container_floor-aside > .container',
    '.container.is-adapting',
    '.recommend-page-container .video-card-list',
    '#page-video .tab-list-box .video-card-list',
    '#bili_bangumi_watch .video-card-list',
    '.search-results-video .video-list',
    '.space-video-list', // .bili-video-card is the item itself, we need the parent list
  ]

  const container =
    (containerSelectors
      .map(selector => document.querySelector(selector))
      .find(el => el !== null) as HTMLElement | null) ?? document.body

  const scanAllVideoCards = () => {
    const allCards = document.querySelectorAll<HTMLElement>('.bili-video-card')
    if (allCards.length === 0) {
      return
    }

    const cardsToProcess = Array.from(allCards).filter(card => {
      const imgContainer = card.querySelector('.bili-video-card__image--wrap')
      if (!imgContainer) {
        return false
      }
      const customImg = imgContainer.querySelector('.custom-preview-img') as HTMLImageElement
      return !customImg || !customImg.src
    })

    if (cardsToProcess.length > 0) {
      // Clean up placeholders that failed to load previously
      cardsToProcess.forEach(card => {
        const customImg = card.querySelector('.custom-preview-img')
        if (customImg && !(customImg as HTMLImageElement).src) {
          customImg.remove()
        }
      })
      replaceCover(cardsToProcess)
    }
  }

  // Initial scan
  const existingCards = document.querySelectorAll<HTMLElement>('.bili-video-card')
  replaceCover(Array.from(existingCards))

  // Observe for dynamically added cards
  const observer = new MutationObserver(videoFilter)
  observer.observe(container, { childList: true, subtree: true })

  // Scan on scroll and resize for cards loaded by virtual lists
  const throttledScan = throttle(scanAllVideoCards, 300)
  window.addEventListener('resize', throttledScan)
  window.addEventListener('scroll', throttledScan)

  // Note: The original return function for cleanup is removed as per the plan.
  // The script's lifecycle manager should handle observer disconnection and event listener removal if needed.
}

export const component = defineComponentMetadata({
  name: 'replaceCover',
  author: {
    name: 'UcnacDx2',
    link: 'https://github.com/UcnacDx2',
  },
  tags: [componentsTags.style],
  displayName: '替换标题党封面',
  description: '将视频卡片的封面替换为视频预览帧，杜绝图文不符。致敬DeArrow。',
  urlInclude: ['www.bilibili.com'],
  // 将样式和逻辑入口合并到 entry 属性中
  entry: styledComponentEntry(
    () => import('./index.scss'), // 第一个参数：样式
    replaceCoverComponent, // 第二个参数：组件逻辑
  ),
  // 不再有独立的 style 属性
})
