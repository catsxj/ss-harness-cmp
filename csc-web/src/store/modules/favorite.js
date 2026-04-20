/**
 * Created by Zhang Haijun on 2018/12/25.
 */
import { getFavorite } from 'services/system/favorite'

const favorite = {
  state: {
    favoriteList: []
  },
  mutations: {
    SET_FAVORITE(state, data) {
      state.favoriteList = data
    }
  },
  actions: {
    GetFavorite({ commit, rootState }) {
      getFavorite(rootState.app.userData.accountCategory).then(data => {
        if (data.success) {
          commit('SET_FAVORITE', data.data)
        }
      })
    }
  }
}
export default favorite
