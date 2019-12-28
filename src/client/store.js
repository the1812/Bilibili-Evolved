export const store = (() => {
  const toggleWatchlater = async (aid, add) => {
    const api = add ? 'https://api.bilibili.com/x/v2/history/toview/add' : 'https://api.bilibili.com/x/v2/history/toview/del'
    const csrf = getCsrf()
    const responseText = await Ajax.postTextWithCredentials(api, `aid=${aid}&csrf=${csrf}`)
    const response = JSON.parse(responseText)
    if (response.code !== 0) {
      throw new Error(`稍后再看操作失败: ${response.message}`)
    }
  }
  const getWatchlaterList = async (raw = false) => {
    const api = `https://api.bilibili.com/x/v2/history/toview/web`
    const response = await Ajax.getJsonWithCredentials(api)
    if (response.code !== 0) {
      throw new Error(`获取稍后再看列表失败: ${response.message}`)
    }
    if (!response.data.list) {
      return []
    }
    if (raw) {
      return response.data.list
    }
    return response.data.list.map((item) => item.aid)
  }
  return new Vuex.Store({
    state: {
      watchlaterList: [],
      watchlaterListCached: false,
    },
    mutations: {
      addToWatchlater (state, aid) {
        if (!state.watchlaterList.includes(aid)) {
          state.watchlaterList.push(aid)
        }
      },
      removeFromWatchlater (state, aid) {
        const index = state.watchlaterList.indexOf(aid)
        if (index !== -1) {
          state.watchlaterList.splice(index, 1)
        }
      },
      updateWatchlaterList (state, list) {
        state.watchlaterList = list
        state.watchlaterListCached = true
      }
    },
    actions: {
      async fetchWatchlaterList ({ commit }) {
        const list = await getWatchlaterList()
        commit('updateWatchlaterList', list)
      },
      async addToWatchlater ({ commit, dispatch, watchlaterListCached }, aid) {
        if (!watchlaterListCached) {
          await dispatch('fetchWatchlaterList')
        }
        commit('addToWatchlater', aid)
        try {
          await toggleWatchlater(aid, true)
        } catch (error) {
          logError(error)
          commit('removeFromWatchlater', aid)
        }
      },
      async removeFromWatchlater ({ commit, dispatch, watchlaterListCached }, aid) {
        if (!watchlaterListCached) {
          await dispatch('fetchWatchlaterList')
        }
        commit('removeFromWatchlater', aid)
        try {
          await toggleWatchlater(aid, false)
        } catch (error) {
          logError(error)
          commit('addToWatchlater', aid)
        }
      }
    }
  })
})()
