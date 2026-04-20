<template>
  <section :style="{ ...style }" class="form-search">
    <el-input v-model="initValue" @input="debounceInput" clearable :placeholder="placeholder"></el-input>
  </section>
</template>
<script>
import { mapState } from 'vuex'
import { eventBus } from '../eventBus'
import { debounce } from 'lodash-es'
import { MinxinStyleOptions } from './minxin-style-options'
export default {
  props: {
    element: {
      type: Object,
      default: () => ({
        data: {},
        style: {},
        uuid: {}
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  mixins: [MinxinStyleOptions],
  data() {
    return {
      initValue: '',
      params: {},
      placeholder: '',
      debounceInput: () => {}
    }
  },
  // watch: {
  //   'element.style': {
  //     handler(val) {
  //       this.style = { ...this.style, ...this.element.style }
  //     },
  //     deep: true
  //   }
  // },
  computed: {
    ...mapState({
      global: state => state.elements.globalOptions
    })
  },
  mounted() {
    if (!this.isEdit) {
      this.getList()
    }
    this.debounceInput = debounce(this.inputChange, 200)
  },
  destroyed() {
    if (!this.isEdit) return
    for (const key in this.params) {
      this.params[key] = ''
    }
    eventBus.$emit('inputChange', { params: [{ param: this.params, sign: 'LK' }], bindUuid: this.element.data?.bindUuid, isEdit: this.isEdit })
  },
  methods: {
    getList() {
      const {
        dropList: [item]
      } = this.element.data
      this.placeholder = item?.alias || item?.name
    },
    inputChange(val) {
      const {
        dropList: [item]
      } = this.element.data
      if (item?.name) {
        this.params[item.name] = val
      }
      this.placeholder = item?.alias || item?.name
      if (item?.name) {
        eventBus.$emit('inputChange', { params: [{ param: this.params, sign: 'LK' }], bindUuid: this.element.data?.bindUuid, isEdit: this.isEdit })
      }
    }
  }
}
</script>
