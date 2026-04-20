<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12" v-for="item in configs" :key="item.title">
        <monitor-charts :params="item.params" :title="item.title"></monitor-charts>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import detailMap from 'views/components/detailMap.vue'
export default {
  components: { detailMap },
  props: {
    detailData: {
      type: Object
    },
    paramsStr: {
      type: String
    }
  },
  data() {
    return {
      configs: [
        {
          title: '带宽',
          params: {
            expr: [`round(xms_disk_read_bandwidth_kbyte{${this.paramsStr}},0.01)`, `round(xms_disk_write_bandwidth_kbyte{${this.paramsStr}},0.01)`],
            name: "['读取', '写入']",
            unit: 'KB'
          }
        },
        {
          title: 'IOPS',
          params: {
            expr: [`xms_disk_read_iops{${this.paramsStr}}`, `xms_disk_write_iops{${this.paramsStr}}`],
            name: "['读取', '写入']",
            unit: 'IO/ps'
          }
        },
        {
          title: '延迟',
          params: {
            expr: [`xms_disk_read_wait_us{${this.paramsStr}}`, `xms_disk_write_wait_us{${this.paramsStr}}`],
            name: "['读取', '写入']",
            unit: 'us'
          }
        },
        {
          title: 'IO利用率',
          params: {
            expr: [`round(xms_disk_io_util{${this.paramsStr}}*100,0.01)`],
            name: "['IO利用率']",
            unit: '%'
          }
        }
      ],
      detailMapList: [
        { name: '名称', value: 'name' },
        { name: '分区大小', value: 'partitionSize', unit: 'GB' }
      ]
    }
  },
  methods: {}
}
</script>
