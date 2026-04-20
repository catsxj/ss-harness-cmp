// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// /* global $ */
import Vue from 'vue'
// @ts-ignore
import App from './App.vue'
import router from './router/index'
import store from './store'
import './permission'
import './common/components/index'
import './components/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'vue2-animate/dist/vue2-animate.min.css'
import CmpEcharts from 'cmp-echarts'
import 'cmp-echarts/lib/cmp-echarts.css'
import './common/filters'
import './common/directive'
import VueCompositionAPI from '@vue/composition-api'
import CmpElement from 'cmp-element'
import 'cmp-element/lib/cmp-element.css'
import rules from './common/validate/index'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import 'vite-plugin-svg-icons/register'

Vue.use(mavonEditor)
Vue.use(ElementUI, { size: 'small' })
Vue.use(CmpEcharts)
Vue.use(VueCompositionAPI)
Vue.use(CmpElement, { rules })

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
}).$mount('#app')
