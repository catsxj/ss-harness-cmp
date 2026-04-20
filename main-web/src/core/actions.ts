import { initGlobalState } from 'qiankun'
import type { MicroAppStateActions } from 'qiankun'
import store from '@/store'

const initialState = {
  name: 'main-web',
  onmessage: (data: any) => console.log(data),
  userData: null,
  permissions: null
}
const actions: MicroAppStateActions = initGlobalState(initialState)

actions.onGlobalStateChange((state, prev) => {
  // state: 变更后的状态; prev 变更前的状态
  // console.log('from:', state.name, 'current:', state, 'pre:', prev)
  store.commit('SET_ONMESSAGE', state.onmessage)
})

export default actions
