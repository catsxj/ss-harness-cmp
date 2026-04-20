<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import detailMap from 'views/components/detailMap.vue'
import { getCharts, getHostDisk } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { detailMap, chartBox },
  props: {
    detailId: {
      type: Number
    },
    detailName: {
      type: String
    },
    instanceId: {
      type: String
    },
    vendorId: {
      type: Number
    }
  },
  data() {
    return {
      typeData: [
        { title: '磁盘利用率', value: 'usage', expr: JSON.stringify(['round(yyjqcloud_host_disk_usage{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: '%' },
        {
          title: '吞吐量-读',
          value: 'read',
          expr: JSON.stringify(['round(yyjqcloud_host_disk_io_read_throughput{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']),
          name: "['$tag']",
          unit: 'MB/s'
        },
        {
          title: '吞吐量-写',
          value: 'write',
          expr: JSON.stringify(['round(yyjqcloud_host_disk_io_write_throughput{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']),
          name: "['$tag']",
          unit: 'MB/s'
        },
        { title: 'IOPS-读', value: 'diskNumberReadAveraged', expr: JSON.stringify(['round(yyjqcloud_host_disk_io_reads{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'IOPS' },
        { title: 'IOPS-写', value: 'diskNumberWriteAveraged', expr: JSON.stringify(['round(yyjqcloud_host_disk_io_writes{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'IOPS' }
      ],
      detailData: {},
      detailMapList: [
        { name: '磁盘总量', value: 'diskCapacity', unit: 'GB' },
        { name: '磁盘使用量', value: 'diskUsed', unit: 'GB' },
        { name: '磁盘剩余量', value: 'diskFree', unit: 'GB' }
      ],
      dashboradData: {
        usage: {},
        diskNumberReadAveraged: {},
        diskNumberWriteAveraged: {},
        disk: {},
        read: {},
        write: {}
      },
      userDefindVisible: false,
      userDefindTime: []
    }
  },
  methods: {
    getDetail() {
      getHostDisk(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    }
  },
  created() {
    this.getDetail()
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
