// 用于提取弹幕文本中的数字片段，默认匹配所有连续数字（每次使用时新建，避免 g 标志的 lastIndex 状态问题）
const getAirborneRegex = () => /\d+/g

/**
 * 解析单条弹幕内容中的时间
 *
 * 解析规则（纯数字位置，不依赖分隔符或中文单位）：
 * - 基础格式 hh:mm:ss，有小时时分秒必须 2 位，无小时时分秒可 1~2 位
 * - 分、秒取值 0-59，时无限制
 * - 单数字串长度必须 > 2，否则无效
 * - 数字列表长度为 2 或单数字长度为 3 时存在歧义，返回所有可能的解析结果
 *
 * @returns 所有可能的秒数，无有效解析时返回空数组
 */
export const parseAirborneTime = (text: string | null): number[] => {
  if (!text) {
    return []
  }
  // 包含“数字 + 年”的日期文本直接忽略
  if (/\d+年/.test(text.replace(/\s/g, ''))) {
    return []
  }
  const nums = text.match(getAirborneRegex())
  if (!nums || nums.length === 0) {
    return []
  }

  const results: number[] = []

  if (nums.length === 1) {
    // 单数字串，长度必须 > 2
    const s = nums[0]
    if (s.length <= 2) {
      return []
    }
    const len = s.length

    // 时分秒：时占剩余位，分2位，秒2位
    if (len >= 5) {
      const sec = parseInt(s.slice(len - 2))
      const min = parseInt(s.slice(len - 4, len - 2))
      const hour = parseInt(s.slice(0, len - 4)) || 0
      if (sec <= 59 && min <= 59) {
        results.push(hour * 3600 + min * 60 + sec)
      }
    }

    // 时分：时占剩余位，分2位
    if (len >= 3) {
      const min = parseInt(s.slice(len - 2))
      const hour = parseInt(s.slice(0, len - 2)) || 0
      if (min <= 59) {
        results.push(hour * 3600 + min * 60)
      }
    }

    // 分秒（无小时）：分1-2位，秒1-2位
    if (len === 3) {
      const min = parseInt(s[0])
      const sec = parseInt(s.slice(1))
      if (min <= 59 && sec <= 59) {
        results.push(min * 60 + sec)
      }
      const min2 = parseInt(s.slice(0, 2))
      const sec2 = parseInt(s[2])
      if (min2 <= 59 && sec2 <= 59) {
        results.push(min2 * 60 + sec2)
      }
    } else if (len === 4) {
      const min = parseInt(s.slice(0, 2))
      const sec = parseInt(s.slice(2))
      if (min <= 59 && sec <= 59) {
        results.push(min * 60 + sec)
      }
    }
  } else if (nums.length === 2) {
    // 歧义：尝试 时分 和 分秒 两种解析
    const [a, b] = nums.map(n => parseInt(n))
    // 时分：a时b分，分必须2位且 <= 59
    if (nums[1].length === 2 && b <= 59) {
      results.push(a * 3600 + b * 60)
    }
    // 分秒：a分b秒，分秒 <= 59
    if (a <= 59 && b <= 59) {
      results.push(a * 60 + b)
    }
  } else {
    // 长度 >= 3，取最后三个：时分秒
    const lastThree = nums.slice(-3)
    const [h, m, sec] = lastThree.map(n => parseInt(n))
    // 有小时时，分和秒必须2位且 <= 59
    if (lastThree[1].length === 2 && lastThree[2].length === 2 && m <= 59 && sec <= 59) {
      results.push(h * 3600 + m * 60 + sec)
    }
  }

  return results
}
