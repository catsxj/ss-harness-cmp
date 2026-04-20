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
import 'element-ui/lib/theme-chalk/index.css'
// @ts-ignore
import App from './App.vue'
import 'vue2-animate/dist/vue2-animate.min.css'
import CmpEcharts from 'cmp-echarts'
import 'cmp-echarts/lib/cmp-echarts.css'
import './filters/common'
import './common/directive'
import i18n from './lang' // internationalization
import CmpElement from 'cmp-element'
import 'cmp-element/lib/cmp-element.css'
import 'vite-plugin-svg-icons/register'
import actions from './shared/action'
import VueCompositionAPI from '@vue/composition-api'

Vue.use(ElementUI, { size: 'small', i18n: (key: any, value: any) => i18n.t(key, value) })
Vue.use(VueCompositionAPI)
Vue.use(CmpElement)
Vue.use(CmpEcharts)
Vue.config.productionTip = false
Vue.config.devtools = true
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
  console.log('cmp app bootstraped')
}

export async function mount(props: any) {
  console.log('cmp app mounted')
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
