import { registerAndGetData } from '@/plugins/data'

const defaultEmptyContent = '空空如也哦 =￣ω￣=  全新安装的脚本没有任何功能，你可以在设置面板 左下角 点击进入「组件」面板，再点击「在线」，从在线功能库任意安装自己想要的功能~'
export const [emptyContent] = registerAndGetData('vEmpty', {
  content: defaultEmptyContent,
})
