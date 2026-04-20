<template>
  <section :style="{ ...style }" class="form-search">
    <el-select v-model="value" @change="selectChange" clearable :placeholder="placeholder">
      <el-option v-for="(item, index) in initValues" :key="index" :label="item" :value="item"></el-option>
    </el-select>
  </section>
</template>
<script>
import { getSelectFilter } from '@/services/reportform/dataset'
import { eventBus } from '../eventBus'
import { mapState } from 'vuex'
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
      // 是否在设计器页面
      type: Boolean,
      default: false
    }
  },
  mixins: [MinxinStyleOptions],
  data() {
    return {
      value: '',
      initValues: [],
      params: {},
      placeholder: ''
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
  mounted() {
    if (!this.isEdit) {
      this.getList()
    }
  },
  destroyed() {
    for (const key in this.params) {
      this.params[key] = ''
    }
    eventBus.$emit('selectChange', { params: [{ param: this.params, sign: 'EQ' }], bindUuid: this.element.data?.bindUuid, isEdit: this.isEdit })
  },
  methods: {
    async getList() {
      const {
        datasetId,
        dropList: [item]
      } = this.element.data
      if (item?.name) {
        this.params[item.name] = ''
      }
      this.placeholder = item?.alias
      const { data, success } = await getSelectFilter(datasetId, item.alias || item.name)
      if (success) {
        this.initValues = data
      }
    },
    selectChange(val) {
      for (const key in this.params) {
        this.params[key] = val
      }
      eventBus.$emit('selectChange', { params: [{ param: this.params, sign: 'EQ' }], bindUuid: this.element.data?.bindUuid, isEdit: this.isEdit })
    }
  }
}
</script>
