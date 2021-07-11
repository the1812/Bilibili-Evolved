import { getMedalList } from './badge'

export const autoMatchMedal = async () => {
  const { getUID } = await import('@/core/utils')
  if (!getUID()) {
    return
  }
  const { getComponentSettings } = await import('@/core/settings')
  const { options } = getComponentSettings('badgeHelper')
  if (!options.autoMatchMedal) {
    return
  }
  const match = document.URL.match(/^https:\/\/live\.bilibili\.com\/(blanc\/)?([\d]+)/)
  if (!match) {
    return
  }
  const roomID = parseInt(match[2])
  if (Number.isNaN(roomID)) {
    console.warn('roomID not found')
    return
  }
  const medalList = await getMedalList()
  if (!options.defaultMedalID) {
    const activeMedal = medalList.find(m => m.isActive)
    if (activeMedal) {
      options.defaultMedalID = activeMedal.id
      console.log(`set defaultMedalID to activeMedal (${activeMedal.id})`)
    }
  }
  const defaultMedal = options.defaultMedalID
    ? medalList.find(m => m.id === options.defaultMedalID)
    : medalList.find(m => m.isActive)

  const matchMedal = medalList.find(m => m.roomID === roomID)
  if (!matchMedal) {
    if (defaultMedal) {
      await defaultMedal.activate()
      console.log(`no matchMedal, fallback to defaultMedal (${defaultMedal.id})`)
    }
  } else {
    await matchMedal.activate()
    console.log(`activated matchMedal (${matchMedal.id})`)
  }
}
