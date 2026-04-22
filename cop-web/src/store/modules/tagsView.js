import { nth } from 'lodash-es'
const state = {
  visitedViews: [],
  cachedViews: []
}

const mutations = {
  ADD_VISITED_VIEW: (state, view) => {
    const { meta: { noTag, title } } = view;
    if (noTag || !title) return;
    if (state.visitedViews.some(v => v.path === view.path)) return;
    state.visitedViews.push(
      Object.assign({}, view, {
        title
      })
    )
  },
  ADD_CACHED_VIEW: (state, view) => {
    if (state.cachedViews.includes(view.name)) return
    if (view.name && !view.meta.noCache) {
      state.cachedViews.push(view.name)
    }
  },

  DEL_VISITED_VIEW: (state, view) => {
    for (const [i, v] of state.visitedViews.entries()) {
      if (v.path === view.path) {
        state.visitedViews.splice(i, 1)
        break
      }
    }
  },
  DEL_CACHED_VIEW: (state, view) => {
    const index = state.cachedViews.indexOf(view.name)
    index > -1 && state.cachedViews.splice(index, 1)
  },

  DEL_OTHERS_VISITED_VIEWS: (state, view) => {
    state.visitedViews = state.visitedViews.filter(v => {
      return v.meta.fix || v.path === view.path
    })
  },
  DEL_OTHERS_CACHED_VIEWS: (state, view) => {
    const index = state.cachedViews.indexOf(view.name)
    if (index > -1) {
      state.cachedViews = [view.name]
    } else {
      // if index = -1, there is no cached tags
      state.cachedViews = []
    }
  },
  DEL_LEFT_VISITED_VIEWS: (state, index) => {
    const left = state.visitedViews.slice(0, index).filter(v => v.meta.fix);
    const right = state.visitedViews.slice(index);
    state.visitedViews = [...left, ...right]
  },
  DEL_RIGHT_VISITED_VIEWS: (state, index) => {
    const left = state.visitedViews.slice(0, index + 1)
    const right = state.visitedViews.slice(index + 1).filter(v => v.meta.fix);
    state.visitedViews = [...left, ...right]
  },
  UPDATE_CACHE_VIEWS: (state) => {
    state.cachedViews = state.visitedViews.filter(v => !v.meta.noCache && v.name).map(v => v.name);
  },
  DEL_ALL_VISITED_VIEWS: state => {
    // keep fix tags
    const fixTags = state.visitedViews.filter(tag => tag.meta.fix)
    state.visitedViews = fixTags
  },
  DEL_ALL_CACHED_VIEWS: state => {
    state.cachedViews = []
  }
}

const actions = {
  addView({ commit }, view) {
    commit('ADD_VISITED_VIEW', view)
    commit('ADD_CACHED_VIEW', view)
  },
  delView({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_VISITED_VIEW', view)
      commit('DEL_CACHED_VIEW', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  delOthersViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_OTHERS_VISITED_VIEWS', view)
      commit('DEL_OTHERS_CACHED_VIEWS', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  delLeftViews({ commit, state }, { view, index }) {
    return new Promise(resolve => {
      commit('DEL_LEFT_VISITED_VIEWS', index)
      commit('UPDATE_CACHE_VIEWS')
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  delRightViews({ commit, state }, { view, index }) {
    return new Promise(resolve => {
      commit('DEL_RIGHT_VISITED_VIEWS', index)
      commit('UPDATE_CACHE_VIEWS')
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  delAllViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_ALL_VISITED_VIEWS')
      commit('DEL_ALL_CACHED_VIEWS')
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
