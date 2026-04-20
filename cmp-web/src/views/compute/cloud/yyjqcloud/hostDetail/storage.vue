<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="20">
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
    uuid: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        { title: '磁盘读取速率', value: 'read', expr: JSON.stringify(['round(bocloud_cloudtower_host_zbs_chunk_read_iops{instanceId="' + this.uuid + '"}, 0.01)']), name: "['磁盘读取速率']", unit: 'Bps' },
        { title: '磁盘写入速率', value: 'write', expr: JSON.stringify(['round(bocloud_cloudtower_host_zbs_chunk_write_iops{instanceId="' + this.uuid + '"}, 0.01)']), name: "['磁盘写入速率']", unit: 'Bps' }
      ],
      detailData: {},
      detailMapList: [
        { name: '磁盘总量', value: 'diskCapacity', unit: 'GB' },
        { name: '磁盘使用量', value: 'diskUsed', unit: 'GB' },
        { name: '磁盘空闲量', value: 'diskFree', unit: 'GB' }
      ],
      dashboradData: {
        read: {},
        write: {}
      }
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
