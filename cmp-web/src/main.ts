// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import './public-path'
import Vue from 'vue'
import router from './router/index'
import store from './store'
import startPermission from './permission'
import './errorLog'
import './common/components/index'
import ElementUI from 'element-ui'
import '@/common/css/element-variables.scss'
// @ts-ignore
import App from './App.vue'
import CmpEcharts from 'cmp-echarts'
import 'cmp-echarts/lib/cmp-echarts.css'
import './common/directive'
import i18n from './lang' // internationalization
import CmpElement from 'cmp-element'
import 'cmp-element/lib/cmp-element.css'
import './icons'
import VueCompositionAPI from '@vue/composition-api'
import rules from '@/validate/index'
import actions from './shared/action'

Vue.use(ElementUI, { size: 'small', i18n: (key: any, value: any) => i18n.t(key, value) })
Vue.use(VueCompositionAPI)
Vue.use(CmpElement, { rules })
Vue.use(CmpEcharts)
Vue.config.productionTip = false

let instance: any = null
function render(props: any = {}) {
  const { appPath = '', container } = props
  instance = new Vue({
    router,
    store,
    render: (h) => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
  store.commit('SET_APP_PATH', appPath)
}
if (!(window as any).__POWERED_BY_QIANKUN__) {
  console.log('独立运行子应用')
  startPermission()
  render()
}
export async function bootstrap() {
  console.log('cms app bootstraped')
}

export async function mount(props: any) {
  console.log('cms app mounted')
  render(props)
  actions.init(props, (state: any) => {
    const { permissions, userData } = state
    userData && store.commit('SET_USERDATA', userData)
    if (!store.getters.addRoutes && permissions) {
      store.dispatch('permission/GenerateRoutes')
    }
  })
}

export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}
