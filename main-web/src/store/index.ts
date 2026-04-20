import { createStore } from 'vuex'
import getters from './getters'
import { getModules } from '@/utils/autoImport'

const modulesMap: any = import.meta.globEager('./modules/*.js')
const modules = getModules(modulesMap)
export default createStore({
  modules,
  getters
})
