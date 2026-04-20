/**
 * Created by Zhang Haijun on 2018/1/25.
 */
/* global $ */
import Vue from 'vue'
import store from '@/store'
export const permission = Vue.directive('permission', function (el, binding) {
  const buttons = store.state.permission.buttons
  if (!buttons.includes(binding.value)) {
    el.parentNode && el.parentNode.removeChild(el)
  }
})
