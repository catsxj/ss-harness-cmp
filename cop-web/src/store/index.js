/**
 * Created by Zhang Haijun on 2017/8/25.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import { getModules } from 'utils/autoImport'

Vue.use(Vuex)
const modulesFiles = require.context('./modules', true, /\.js$/);
const modules = getModules(modulesFiles)

const store = new Vuex.Store({
  modules,
  getters
})
export default store
