<template>
  <div>
    <line-charts ref="itemData" :height="this.height" width="100%" :id="paramsData.value + 'itemData'" :data="dashboradData" :setting="{ grid: { top: 40 } }" :unit="dashboradData.unit" v-if="dashboradData"></line-charts>
  </div>
</template>
<script>
import { getCharts } from 'services/monitor'
export default {
  props: {
    paramsData: {
      type: Object
    },
    itemData: {
      type: Object
    },
    requestInterval: {
      type: Number,
      default: 60
    },
    height: {
      type: String,
      default: '220px'
    }
  },
  data() {
    return {
      dashboradData: null,
      itemInterval: null
    }
  },
  methods: {
    getData() {
      getCharts({
        step: this.itemData.stepValue,
        start: this.itemData.start,
        end: this.itemData.end,
        expr: this.paramsData.expr,
        name: this.paramsData.name,
        unit: this.paramsData.unit
      }).then((data) => {
        if (data.success) {
          this.dashboradData = Object.assign({}, data.data)
          if (this.itemInterval) {
            clearInterval(this.itemInterval)
            this.itemInterval = ''
          }
          if (this.itemData.step != '0') {
            this.itemInterval = setInterval(() => {
              this.getData()
            }, this.requestInterval * 1000)
          }
        }
      })
    }
  },
  watch: {
    itemData: {
      handler(newVal, oldVal) {
        this.getData()
      },
      deep: true
    },
    'paramsData.expr'() {
      this.getData()
    }
  },
  beforeDestroy() {
    clearInterval(this.itemInterval)
  },
  created() {
    this.getData()
  }
}
</script>
