<template>
  <el-card class="wrapper">
    <el-form ref="form" :inline="true">
      <el-form-item>
        <Icon type="icon-fanhui cur-point" @click.native="goBack"></Icon>
      </el-form-item>
      <el-form-item>
        <span>{{ params.name }}</span>
      </el-form-item>
      <div class="pull-right">
        <el-form-item>
          <el-select v-model="params.time" @change="selectTime()" placeholder="请选择刷新周期">
            <el-option v-for="item in timeData" :value="item.value" :key="item.value" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <el-row :gutter="20">
      <el-col :span="8" v-for="(item, key) in data" :key="key">
        <el-card class="m-b-sm group" body-style="padding-top: 5px;padding-bottom: 5px;">
          <div slot="header" class="margins" style="text-align: center">{{ typeData[key].desc }}</div>
          <line-charts height="190px" width="100%" :id="`vc${key}`" :data="item" :unit="typeData[key].unit" v-if="item.values"></line-charts>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { getHostMetrics } from 'services/platform/index'

const timeData = [
  { name: '实时', value: 'REAL' },
  { name: '一天', value: 'DAY' },
  { name: '一周', value: 'WEEK' },
  { name: '一月', value: 'MONTH' }
]
export default {
  data() {
    return {
      params: {},
      timeData,
      typeData: {
        CPU: { desc: 'CPU使用情况', unit: '百分比%' },
        DISK: { desc: '磁盘使用情况', unit: 'KBps' },
        POWER: { desc: '电源使用情况', unit: '瓦特' },
        MEM: { desc: '内存使用情况', unit: '百分比%' },
        NET: { desc: '网络使用情况', unit: 'KBps' },
        SYSTEM: { desc: '系统正常运行时间', unit: '天' }
      },
      type: 'vm',
      data: {}
    }
  },
  created() {
    const param = this.$route.query
    this.params = {
      time: 'REAL',
      vendorId: param.vendorId,
      name: param.name
    }
    if (this.$route.name === 'VhostPerformance') this.type = 'server'
    this.selectTime()
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    getData() {
      getHostMetrics(this.params).then(data => {
        if (data.success) {
          this.data = data.data
        } else if (this.timeInterval) this.clearTimer()
      })
    },
    // 选择周期
    selectTime() {
      if (this.params.time === 'REAL') this.setTimer()
      else if (this.timeInterval) this.clearTimer()
      this.getData()
    },
    // 清楚定时器
    clearTimer() {
      clearInterval(this.timeInterval)
      this.timeInterval = ''
    },
    setTimer() {
      this.timeInterval = setInterval(() => {
        this.getData()
      }, 60 * 1000)
    }
  }
}
</script>
<style scoped>
.el-form-item--mini.el-form-item,
.el-form-item--small.el-form-item {
  margin-bottom: 5px !important;
}

.margins {
  margin-top: -5px;
  margin-bottom: -5px;
}
</style>
