<template>
  <section :style="{ ...style }" class="form-search">
    <el-date-picker
      type="datetimerange"
      range-separator="至"
      v-model="initValue"
      @change="dateChange"
      value-format="yyyy-MM-dd hh:mm:ss"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      style="width: 100%"
    ></el-date-picker>
  </section>
</template>
<script>
import { mapState } from 'vuex'
import { eventBus } from '../eventBus'
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
      params: {}
    }
  },
  computed: {
    ...mapState({
      global: state => state.elements.globalOptions
    })
  },
  // watch: {
  //   'element.style': {
  //     handler(val) {
  //       this.style = { ...this.style, ...this.element.style }
  //     },
  //     deep: true
  //   }
  // },
  // mounted() {
  //   if (!this.isEdit) {
  //     this.style = { ...this.style, ...this.element.style }
  //   }
  // },
  destroyed() {
    const {
      dropList: [item]
    } = this.element.data
    const keyName = item?.name
    if (keyName) {
      eventBus.$emit('calendarChange', {
        params: [
          { param: { [keyName]: '' }, sign: 'GET' },
          { param: { [keyName]: '' }, sign: 'LET' }
        ],
        bindUuid: this.element.data?.bindUuid,
        isEdit: this.isEdit
      })
    }
  },
  methods: {
    dateChange(date) {
      const [startDate, endDate] = date ?? []
      const {
        dropList: [item]
      } = this.element.data
      const keyName = item?.name
      if (keyName) {
        eventBus.$emit('calendarChange', {
          params: [
            { param: { [keyName]: startDate }, sign: 'GET' },
            { param: { [keyName]: endDate }, sign: 'LET' }
          ],
          bindUuid: this.element.data?.bindUuid,
          isEdit: this.isEdit
        })
      }
    }
  }
}
</script>
