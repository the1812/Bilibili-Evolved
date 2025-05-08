import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
const preventOriginalLoadingStyle = `
  .bili-video-card .bili-video-card__image--wrap {
    position: relative;
  }

  .bili-video-card .bili-video-card__image--wrap picture {
    visibility: hidden !important;
  }
  
  .bili-video-card .bili-video-card__image--wrap .custom-preview-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: inherit; /* 继承父元素的圆角 */
  }
  
  .bili-video-card .bili-video-card__image--wrap .custom-preview-img.loaded {
    opacity: 1;
  }
  
  /* 鼠标悬停时隐藏自定义预览图，显示原始图片 */
  .bili-video-card .bili-video-card__image--wrap:hover .custom-preview-img.loaded {
    opacity: 0;
  }
  
  .bili-video-card .bili-video-card__image--wrap:hover picture {
    visibility: visible !important;
  }
  
  /* 可选: 添加占位符背景色或加载动画 */
  .bili-video-card .bili-video-card__image--wrap .custom-preview-img:not(.loaded) {
    background-color: #f0f0f0;
  }
`
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
          await fn();
          resolve();
        })
      })
      return;
    }
    running++;
    try {
      await fn();
    } finally {
      running--;
      if (queue.length > 0) {
        const next = queue.shift();
        next?.();
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
    if (previewCache.has(bvid)) {
      return previewCache.get(bvid)!
    }
    try {
      const apiUrl = new URL("https://api.bilibili.com/x/player/videoshot")
      apiUrl.searchParams.set("bvid", bvid)
      apiUrl.searchParams.set("index", "1")
      const apiRes = await fetch(apiUrl.toString())
      const json = await apiRes.json()
      if (json.code !== 0 || !json.data?.image) {
        if (json.code === 404) {
        }
        return null;
      }
      
      const { image, index = [], img_x_len, img_y_len, img_x_size, img_y_size } = json.data
      const totalPerImage = img_x_len * img_y_len;
      
      const mid = Array.isArray(index) && index.length > 0 ? 
        Math.floor((index.length - 1) / 2) : 0;
      
      const pageIndex = Math.floor(mid / totalPerImage);
            if (pageIndex >= image.length) {
          return null;
      }
      const indexInPage = mid % totalPerImage;
      const xIndex = indexInPage % img_x_len;
      const yIndex = Math.floor(indexInPage / img_x_len);
      const sx = xIndex * img_x_size;
      const sy = yIndex * img_y_size;
      const sw = img_x_size;
      const sh = img_y_size;
      const fullImageUrl = image[pageIndex].startsWith("//")
        ? "https:" + image[pageIndex]
        : image[pageIndex];
      const imgRes = await fetch(fullImageUrl, { mode: 'cors' });
      if (!imgRes.ok) {
          return null;
      }
      const imgBlob = await imgRes.blob();
      let imageBitmap: ImageBitmap;
      try {
           imageBitmap = await createImageBitmap(imgBlob, sx, sy, sw, sh, {
           });
      } catch (bitmapError) {
          console.error("[replace-cover] createImageBitmap error:", bitmapError);
           try {
               const dataUrl = await new Promise<string>((resolve, reject) => {
                   const img = new Image();
                   img.crossOrigin = "anonymous";
                   img.onload = () => {
                       try {
                           const canvas = document.createElement('canvas');
                           canvas.width = sw;
                           canvas.height = sh;
                           const ctx = canvas.getContext('2d');
                           if (!ctx) {
                               reject(new Error("Could not get canvas context in fallback."));
                               return;
                           }
                           ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
                           const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                           resolve(dataUrl);
                       } catch (e) {
                          console.error("[replace-cover] canvas error:", e);
                          reject(e);
                       }
                   };
                   img.onerror = (e) => reject(new Error(`Image load error in fallback for ${fullImageUrl}: ${e}`));
                   img.src = fullImageUrl;
               });
               previewCache.set(bvid, dataUrl);
               return dataUrl;
           } catch (fallbackError) {
              console.error("[replace-cover] fallback error:", fallbackError);
              return null;
           }
      }
      const canvas = document.createElement('canvas')
      canvas.width = img_x_size
      canvas.height = img_y_size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
           imageBitmap.close();
           return null;
      }
      ctx.drawImage(imageBitmap, 0, 0);
      imageBitmap.close();
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      previewCache.set(bvid, dataUrl);
      return dataUrl;
    } catch (error) {
      console.error("[replace-cover] Error fetching video preview:", error);
      return null;
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
    
    if (!imgContainer) {
      return
    }
    
    if (imgContainer.querySelector('.custom-preview-img')) {
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
        
        await new Promise<void>((resolve, reject) => {
          const tempImg = new Image()
          tempImg.onload = () => {
            customImg.src = previewUrl
            customImg.classList.add('loaded')
            resolve()
          }
          tempImg.onerror = () => {
            customImg.remove()
            resolve()
          }
          tempImg.src = previewUrl
        })
      } catch (e) {
        console.error("[replace-cover] Error processing video card:", e)
        customImg.remove()
      }
    })
  }

  /**
   * Processes a list of potential video card HTMLElements.
   * @param elements Array of HTMLElements to check and process.
   */
  async function replaceCover(elements: HTMLElement[]) {
    const videoCardsToProcess = elements.filter(card => card.classList?.contains('bili-video-card'));
    if (videoCardsToProcess.length === 0) {
        return;
    }
    await Promise.allSettled(
      videoCardsToProcess.map(card => processVideoCard(card))
    );
  }

  /**
   * MutationObserver callback to filter added nodes and trigger cover replacement.
   * @param mutationsList List of mutation records.
   */
  function videoFilter(mutationsList: MutationRecord[]) {
    const filteredElements: HTMLElement[] = [];
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.classList?.contains('bili-video-card')) {
                   filteredElements.push(element);
              }
              const descendantCards = element.querySelectorAll('.bili-video-card') as NodeListOf<HTMLElement>;
              descendantCards.forEach(descendantCard => filteredElements.push(descendantCard));
          }
        }
      }
    }
    const uniqueElements = Array.from(new Set(filteredElements));
    if (uniqueElements.length > 0) {
      replaceCover(uniqueElements);
    }
  }

  /**
   * The main entry point for the component.
   */
  const replaceCoverComponent: ComponentEntry = async () => {
    const style = document.createElement('style')
    style.textContent = preventOriginalLoadingStyle
    document.head.appendChild(style)
    
    const containerSelectors = [
      'main > .feed2 > .recommended-container_floor-aside > .container',
      'main > .feed2 > .container',
      '.recommended-container_floor-aside > .container',
      '.container.is-adapting',
      '.recommend-page-container .video-card-list',
      '#page-video .tab-list-box .video-card-list',
      '#bili_bangumi_watch .video-card-list',
      '.search-results-video .video-list',
      '.space-video-list .bili-video-card',
    ];
  
    let container: HTMLElement | null = null;
    for(const selector of containerSelectors) {
      container = document.querySelector(selector);
      if (container) {
        break;
      }
    }
  
    if (!container) {
      container = document.body;
    }
  
    const scanAllVideoCards = () => {
      const allCards = document.querySelectorAll('.bili-video-card') as NodeListOf<HTMLElement>;
      
      if (allCards.length === 0) return;
      
      const cardsToProcess = Array.from(allCards).filter(card => {
        const imgContainer = card.querySelector('.bili-video-card__image--wrap');
        if (!imgContainer) return false;
        
        const customImg = imgContainer.querySelector('.custom-preview-img') as HTMLImageElement;
        return !customImg || !customImg.src || customImg.src === '';
      });
      
      if (cardsToProcess.length > 0) {
        cardsToProcess.forEach(card => {
          const imgContainer = card.querySelector('.bili-video-card__image--wrap');
          const customImg = imgContainer?.querySelector('.custom-preview-img');
          if (customImg && (!customImg.hasAttribute('src') || (customImg as HTMLImageElement).src === '')) {
            customImg.remove();
          }
        });
        
        replaceCover(cardsToProcess);
      }
    };
  
    const existingCards = document.querySelectorAll('.bili-video-card') as NodeListOf<HTMLElement>;

    replaceCover(Array.from(existingCards));
  
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver(videoFilter);
    observer.observe(container, config);
  
    const throttle = (fn: Function, delay: number) => {
      let timer: number | null = null;
      let lastExecTime = 0;
      
      return function(this: any, ...args: any[]) {
        const context = this;
        const now = Date.now();
        
        if (now - lastExecTime > delay) {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          fn.apply(context, args);
          lastExecTime = now;
        } else if (!timer) {
          timer = window.setTimeout(() => {
            fn.apply(context, args);
            lastExecTime = Date.now();
            timer = null;
          }, delay);
        }
      };
    };
  
    const throttledScan = throttle(scanAllVideoCards, 300);
    window.addEventListener('resize', throttledScan);
    window.addEventListener('scroll', throttledScan);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', throttledScan);
      window.removeEventListener('scroll', throttledScan);
    };
  };
  
  export const component = defineComponentMetadata({
    name: 'replace-cover',
    author: {
      name: 'UcnacDx2',
      link: 'https://github.com/UcnacDx2',
    },
    tags: [componentsTags.style],
    displayName: '替换标题党封面',
    description: '将视频卡片的封面替换为视频预览帧，杜绝图文不符。致敬DeArrow。',
    urlInclude: ['www.bilibili.com'],
    entry: replaceCoverComponent,
  })