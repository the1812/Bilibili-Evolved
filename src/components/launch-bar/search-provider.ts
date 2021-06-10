import { getUID } from '@/core/utils'
import { getJson } from '@/core/ajax'
import { LaunchBarActionProvider } from './launch-bar-action'
import { updateHistory } from './history-provider'

export const search = (keyword: string) => {
  if (!keyword) {
    return
  }
  updateHistory(keyword)
  const params = {
    keyword,
    from_source: 'banner_search',
  }
  const paramsString = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
  window.open(`https://search.bilibili.com/all?${paramsString}`, '_blank')
}
export const searchProvider: LaunchBarActionProvider = {
  name: 'search',
  getActions: async input => {
    const api = `https://s.search.bilibili.com/main/suggest?func=suggest&suggest_type=accurate&sub_type=tag&main_ver=v1&highlight=&userid=${getUID()}&bangumi_acc_num=1&special_acc_num=1&topic_acc_num=1&upuser_acc_num=3&tag_num=10&special_num=10&bangumi_num=10&upuser_num=3&term=${input}`
    const json = await getJson(api)
    if (json.code !== 0) {
      return []
    }
    const results: { value: string, name: string }[] = lodash.get(json, 'result.tag')
    if (!results) {
      return []
    }
    return results.map(result => ({
      name: result.value,
      content: async () => Vue.extend({
        template: `<div>${result.name.replace(/suggest_high_light/g, 'suggest-highlight')}</div>`,
      }),
      action: () => search(result.value),
    }))
  },
  getEnterAction: () => input => search(input),
}
