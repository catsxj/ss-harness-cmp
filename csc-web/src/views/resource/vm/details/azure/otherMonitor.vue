<template>
  <el-dialog title="查看更多监控图表" :visible.sync="addData.dialog" width="80%" v-if="addData.dialog" append-to-body>
    <el-form inline>
      <el-form-item label="时间：">
        <TimeSelect :get-data="getAllData" :costom="false"></TimeSelect>
      </el-form-item>
      <el-form-item label="粒度：">
        <el-radio-group v-model="particleSize" @change="getAllData({ time: params.time })">
          <el-radio-button v-for="(item, index) in particleSizeList" :key="index" :label="item.value">{{ item.name }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="指标：">
        <el-select v-model="metricnames" filterable @change="getList">
          <el-option v-for="(item, index) in definitions" :label="item.value" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="聚合类型：">
        <el-select v-model="aggregation" @change="getList">
          <el-option label="平均值" value="Average"></el-option>
          <el-option label="最大值" value="Maximum"></el-option>
          <el-option label="最小值" value="Minimum"></el-option>
          <el-option label="总计" value="Total"></el-option>
          <el-option label="计数" value="Count"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <rich-charts defaultChart="line-charts" :data="PercentageCPU" v-if="PercentageCPU.keys" class="m-t"> </rich-charts>
  </el-dialog>
</template>
<script>
import { getMonitor, getMonitorDefinitions } from 'services/platform/azure'

export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      params: {
        time: 'Months'
      },
      PercentageCPU: {},
      particleSize: 'PT1H',
      metricnames: 'Percentage CPU',
      aggregation: 'Average',
      particleSizeList: [
        { name: '1分钟', value: 'PT1M' },
        { name: '5分钟', value: 'PT5M' },
        { name: '30分钟', value: 'PT30M' },
        { name: '1小时', value: 'PT1H' },
        { name: '6小时', value: 'PT6H' },
        { name: '12小时', value: 'PT12H' }
      ],
      definitions: []
    }
  },
  created() {
    this.getMonitorDefinitionsList()
  },
  methods: {
    getAllData(data) {
      this.params = data
      this.getList()
    },
    getList() {
      getMonitor({
        vendorId: this.addData.data.vendorId,
        resourceUri: this.addData.data.resourceUri,
        metricNamespace: 'Microsoft.Compute/virtualMachines',
        time: this.params.time,
        interval: this.particleSize,
        metricnames: this.metricnames,
        aggregation: this.aggregation
      }).then(data => {
        if (data.success) {
          this.PercentageCPU = data.data
        }
      })
    },
    getMonitorDefinitionsList() {
      getMonitorDefinitions({
        resourceUri: this.addData.data.resourceUri,
        metricNamespace: 'Microsoft.Compute/virtualMachines',
        vendorId: this.addData.data.vendorId
      }).then(data => {
        if (data.success) {
          const value = data.data ? JSON.parse(data.data).value : []
          this.definitions = value.map(item => {
            return {
              ...item,
              value: item.name.value
            }
          })
          this.getAllData(this.params)
        }
      })
    }
  }
}
</script>
<style scoped lang="scss"></style>
