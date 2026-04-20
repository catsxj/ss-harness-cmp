/**
 * Created by HaijunZhang on 2019/10/21.
 */
import Vue from 'vue'
import store from './store'
import request from 'utils/request'

const { host, hash } = location
const sendLog = (msg, vm, info, level) => {
  request.post('http://10.20.51.92:7001/log', {
    service: 'CMC',
    level,
    username: store.state.app.userData.username,
    host,
    view: hash,
    msg: `${msg}`,
    info
  })
}
if (process.env.NODE_ENV === 'development') {
  Vue.config.errorHandler = function (err, vm, info) {
    console.error(err, vm, info)
    // sendLog(err, vm, info, 'error')
  }
  Vue.config.warnHandler = function (msg, vm, info) {
    console.warn(msg, vm, info)
    // sendLog(msg, vm, info, 'warning')
  }
}
