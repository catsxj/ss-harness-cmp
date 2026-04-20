/**
 * Created by Zhang Haijun on 2017/8/25.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

Vue.use(Vuex)
const modulesFiles = require.context('./modules', true, /\.js$/)
const modules = modulesFiles.keys().reduce((arr, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  arr[moduleName] = value.default
  return arr
}, {})

const store = new Vuex.Store({
  modules,
  getters
})

export default store
