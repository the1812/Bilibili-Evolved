import { getVue2Data, mountVueComponent } from '@/core/utils'

type ManagerInstance = Vue & {
  open: boolean
  close: () => void
  importTitle: (title: string) => void
}
let instance: ManagerInstance | undefined
let loading: Promise<ManagerInstance | undefined> | undefined
let generation = 0

export const openManager = async (title?: string) => {
  const container = document.querySelector('.be-settings')
  if (container) {
    const settings = getVue2Data(container)
    if (settings) {
      settings.widgetsOpened = false
    }
  }
  if (!instance) {
    if (!loading) {
      const token = generation
      loading = import('./Manager.vue')
        .then(module => {
          if (token !== generation) {
            return undefined
          }
          instance = mountVueComponent<ManagerInstance>(module)
          document.body.append(instance.$el)
          return instance
        })
        .finally(() => {
          if (token === generation) {
            loading = undefined
          }
        })
    }
    await loading
  }
  if (instance) {
    const manager = instance
    manager.open = true
    if (title) {
      await manager.$nextTick()
      if (instance === manager && manager.open) {
        manager.importTitle(title)
      }
    }
  }
}

export const disposeManager = () => {
  generation++
  loading = undefined
  if (instance) {
    instance.close()
    instance.$destroy()
    instance.$el.remove()
    instance = undefined
  }
}
