import { cloneDeep } from 'lodash'
import { setStyleWithPixel } from './widgets.utils'
export const MinxinStyleOptions = {
  props: {
    element: {
      type: Object,
      default: () => ({
        data: {},
        style: {},
        options: {},
        uuid: ''
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    // 列表预览时接收global的属性
    globalOptions: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    global() {
      return this.$store.state.elements.globalOptions
    },
    style() {
      const s = setStyleWithPixel(this.element.style)
      return {
        ...s,
        borderRadius: this.global.radius || this.globalOptions.radius,
        backgroundColor: this.global.elementBackgroundColor || this.globalOptions.elementBackgroundColor,
        padding: (this.global.elementPadding || this.globalOptions.elementPadding) + 'px'
      }
    },
    options() {
      return cloneDeep(this.element.options)
    }
  }
}
