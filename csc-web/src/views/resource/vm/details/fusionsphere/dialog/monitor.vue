<template>
  <div class="wrapper">
    <el-row>
      <el-col :span="9" class="m-b">
        <el-date-picker v-model="data.time" @change="selectTime" value-format="timestamp" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right"> </el-date-picker>
      </el-col>
      <el-col :span="4" class="m-b">
        <el-select v-model="data.interval" @change="selectInterval" placeholder="请选择刷新周期">
          <el-option v-for="item in timeData" :value="item.value" :key="item.value" :label="item.name"></el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="index === showIndex ? 24 : 12" v-for="(item, index) in list" :key="index">
        <el-card class="m-b-sm group" body-style="padding-top: 5px;padding-bottom: 5px;">
          <div slot="header" class="margins" style="text-align: center">{{ typeData[index].desc }}</div>
          <line-charts height="190px" width="100%" :id="`vc${index}`" :data="item" :unit="typeData[index].unit" v-if="item.values"></line-charts>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { getClusterMetrics } from 'services/platform/fc'

const timeData = [
  { name: '60秒', value: 60 },
  { name: '5分钟', value: 300 },
  { name: '30分钟', value: 1800 },
  { name: '一小时', value: 3600 },
  { name: '一天', value: 86400 },
  { name: '一周', value: 604800 },
  { name: '一月', value: 2592000 },
  { name: '一年', value: 31536000 }
]
@Component
export default class Monitor extends Vue {
  @Prop(Object) detailData: any
  @Prop(String) target: any
  private params: any = {}
  private data: any = {
    interval: 1800,
    time: [new Date(new Date(new Date().toLocaleDateString()).getTime()), new Date(new Date().toLocaleDateString()).getTime() + 60 * 60 * 24 * 1000]
  }

  private list: any[] = []
  private umList: any[] = []
  private chartList: any[] = []
  private typeData: any[] = [
    { desc: 'CPU占用率', unit: '百分比%' },
    { desc: '内存占用率', unit: '百分比%' },
    { desc: '磁盘占用率', unit: '百分比%' },
    { desc: '磁盘I/O', unit: 'KBps' },
    { desc: '网路吞吐量', unit: 'KBps' }
  ]

  private chartListLength: any = 0
  private showIndex: any = 4
  private monitorService: any = getClusterMetrics
  get timeData() {
    const [first, ...rest] = timeData
    return rest
  }

  private created() {
    const { id } = this.detailData
    this.params = {
      id
    }
    if (this.target == 'cluster') {
      this.showIndex = 2
      this.umList = ['cpu_usage', 'mem_usage', 'nic_byte_in', 'nic_byte_out']
      this.typeData = [
        { desc: 'CPU占用率', unit: '百分比%' },
        { desc: '内存占用率', unit: '百分比%' },
        { desc: '网路吞吐量', unit: 'KBps' }
      ]
    } else if (this.target == 'host') {
      this.umList = ['cpu_usage', 'domU_cpu_usage', 'mem_usage', 'domU_mem_usage', 'logic_disk_usage', 'disk_io_in', 'disk_io_out', 'nic_byte_in', 'nic_byte_out']
    } else if (this.target == 'vm') {
      this.umList = ['cpu_usage', 'mem_usage', 'disk_usage', 'disk_io_in', 'disk_io_out', 'nic_byte_in', 'nic_byte_out', 'nic_byte_in_out']
    }
    this.getData()
  }

  @Watch('chartListLength')
  onChangeValue() {
    // const hostList = ['主机虚拟化域内存占用率', '主机虚拟化域CPU占用率', '磁盘占用率', '磁盘I/O写入', '磁盘I/O读出', '网络流入流速', '网络流出流速']
    if (this.chartListLength > 3 && this.target == 'cluster') {
      this.chartList[2] && this.chartList[2].values && this.chartList[2].values.push(this.chartList[3].values[0])
      this.chartList.forEach((item, index) => {
        if (index != 3) {
          this.list.push(item)
        }
      })
    } else if (this.chartListLength > 8 && this.target == 'host') {
      const indexList = [1, 3, 6, 8]
      this.joinList(indexList)
      this.chartList.forEach((item, index) => {
        if (!indexList.includes(index)) {
          this.list.push(item)
        }
      })
    } else if (this.chartListLength > 7 && this.target == 'vm') {
      const indexList = [4, 6, 7]
      this.joinList(indexList)
      this.chartList.forEach((item, index) => {
        if (!indexList.includes(index)) {
          this.list.push(item)
        }
        console.log(this.list)
      })
    }
  }

  private joinList(indexList: any) {
    indexList.forEach((item: any) => {
      if (item == 7) {
        this.chartList[5] && this.chartList[5].values && this.chartList[5].values.push(this.chartList[item].values[0])
      } else {
        this.chartList[item - 1] && this.chartList[item - 1].values && this.chartList[item - 1].values.push(this.chartList[item].values[0])
      }
    })
  }

  private async getData() {
    this.chartList = []
    this.chartListLength = 0
    this.list = []
    for (let i = 0; i < this.umList.length; i++) {
      await this.getList(this.umList[i])
    }
  }

  private async getList(item: any) {
    const { vendorId, id, vdcId, clusterVal, uuid, instanceId } = this.detailData
    this.params.params = JSON.stringify({
      interval: this.data.interval,
      startTime: this.data.time && this.data.time[0] / 1000,
      endTime: this.data.time && this.data.time[1] / 1000,
      metricId: item,
      vendorId,
      vdcId,
      id,
      urn: clusterVal || uuid || instanceId
    })
    const data = await this.monitorService(this.params)
    if (data.success) {
      this.chartList.push(data.data || {})
      this.chartListLength = this.chartList.length
    }
  }

  // 选择周期
  private selectInterval() {
    this.getData()
  }

  // 选择时间
  private selectTime() {
    this.getData()
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
