import { createApp } from 'vue'
import router from '@/router/index'
import store from '@/store'
import '@/permission'
import App from '@/App.vue'
import 'virtual:svg-icons-register'
import startApp from '@/core/register'

const application = createApp(App)
application.use(store).use(router).mount('#master-container')
startApp()
