<template>
  <div>
    <!-- <detail-map :detail="detailData" :list="detailMapList"></detail-map> -->
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
// import detailMap from 'views/components/detailMap.vue'
import { getCharts, getHostDisk } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { chartBox },
  props: {
    detailId: {
      type: Number
    },
    detailName: {
      type: String
    },
    uuid: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        { title: '磁盘使用速率', value: 'usage', expr: JSON.stringify(['round(bocloud_zstack_host_disk_util_rate{instance_id="' + this.uuid + '"},0.01)']), name: "['磁盘使用速率']", unit: 'KB/s' }
        // { title: '磁盘读取/写入速率', value: 'disk', expr: JSON.stringify(['vsphere_host_disk_read_average{disk="instance-total",esxhostname="' + this.detailName + '"}', 'vsphere_host_disk_write_average{disk="instance-total",esxhostname="' + this.detailName + '"}']), name: "['磁盘读取速率', '磁盘写入速率']", unit: 'KB/s' },
        // { title: '磁盘每秒读次数', value: 'diskNumberReadAveraged', expr: JSON.stringify([`round(vsphere_host_disk_numberReadAveraged_average{disk!="",esxhostname='${this.detailName}'},0.01)`]), name: "['$disk']", unit: '次' },
        // { title: '磁盘每秒写次数', value: 'diskNumberWriteAveraged', expr: JSON.stringify([`round(vsphere_host_disk_numberWriteAveraged_average{disk!=" ",esxhostname='${this.detailName}'},0.01)`]), name: "['$disk']", unit: '次' }
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
        disk: {}
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
    // this.getDetail();
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
