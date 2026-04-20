<template>
  <div>
    <el-card class="box-card m-t">
      <div slot="header" class="clearfix">
        <span>
          {{ paramsData.title }}
        </span>
        <span class="pull-right">
          <el-button-group>
            <el-button size="mini" :type="item.value == itemData.step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value)">{{ item.name }}</el-button>
            <el-button size="mini" :type="itemData.step === '0' ? 'primary' : ''" @click="userDefind()">自定义</el-button>
          </el-button-group>
        </span>
      </div>
      <div>
        <item-chart :params-data="paramsData" :step="itemData.step" :item-data="itemData"></item-chart>
      </div>
    </el-card>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"> </user-defind>
  </div>
</template>
<script>
import { getCharts } from 'services/monitor'
import itemChart from './itemChart.vue'
import userDefind from 'views/monitor/components/userDefind.vue'
export default {
  components: { itemChart, userDefind },
  props: {
    itemData: {
      type: Object
    },
    paramsData: {
      type: Object
    },
    intervalData: {
      type: Array,
      default: function () {
        return [
          { name: '1H', value: '1H' },
          { name: '6H', value: '6H' },
          { name: '1D', value: '1D' },
          { name: '7D', value: '7D' },
          { name: '14D', value: '14D' }
        ]
      }
    }
  },
  data() {
    return {
      dashboradData: null,
      userDefindVisible: false,
      userDefindTime: []
    }
  },
  methods: {
    changeInterval(value) {
      this.itemData.step = value
      this.itemData.end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.itemData.start = this.itemData.end - 3600
          break
        case '6H':
          this.itemData.start = this.itemData.end - 6 * 3600
          break
        case '1D':
          this.itemData.start = this.itemData.end - 24 * 3600
          break
        case '7D':
          this.itemData.start = this.itemData.end - 7 * 24 * 3600
          break
        case '14D':
          this.itemData.start = this.itemData.end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.itemData.end - this.itemData.start
        this.itemData.stepValue = duration / 180 - ((duration / 180) % 20)
      }
    },
    userDefind() {
      this.userDefindTime = this.itemData.defindTime
      this.userDefindVisible = true
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.itemData.step = '0'
        this.itemData.start = Math.round(value[0] / 1000)
        this.itemData.end = Math.round(value[1] / 1000)
        const duration = this.itemData.end - this.itemData.start
        this.itemData.stepValue = duration / 180 - ((duration / 180) % 20)
        this.itemData.defindTime = value
      }
    }
  },
  created() {
    this.changeInterval('1H')
  }
}
</script>
