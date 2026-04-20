import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import { getSystemConfigs, getDictChildren } from 'services/system'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    cmcUrl: null,
    screenConfigs: {}
  },
  mutations: {
    SET_CMC_URL(state, value) {
      state.cmcUrl = value
    },
    SET_SCREEN_CONFIGS(state, value) {
      state.screenConfigs = value
    }
  },
  actions: {
    async GetCmcUrl({ commit }) {
      const data = await getSystemConfigs({ codes: 'CmcAddress' });
      if (data.success) {
        commit('SET_CMC_URL', data.data.CmcAddress)
      }
    },
    async GetScreenConfigs({ commit }) {
      const data = await getDictChildren({ value: 'SYSTEM_SCREEN' });
      if (data.success) {
        const obj = {};
        data.data.forEach(item => {
          const { name, value } = item;
          obj[value] = name
        })
        commit('SET_SCREEN_CONFIGS', obj)
      }
    }
  },
  getters,
  modules: {
  }
})
