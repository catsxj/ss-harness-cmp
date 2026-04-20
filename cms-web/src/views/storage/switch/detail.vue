<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="item in configs" :key="item.title">
        <monitor-charts :params="item.params" :title="item.title" :transform-unit="item.transformUnit"></monitor-charts>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  components: {},
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
          title: '输入输出流量',
          params: {
            expr: [`round(rate(ifInOctets{${this.paramsStr}}[5m])/1024,0.01)`, `round(rate(ifOutOctets{${this.paramsStr}}[5m])/1024,0.01)`],
            name: "['输入流量', '输出流量']",
            unit: 'kbps'
          }
        },
        {
          title: '输入输出字节数',
          transformUnit: 'KB',
          params: {
            expr: [`round(ifInOctets{${this.paramsStr}}/1024,0.01)`, `round(ifOutOctets{${this.paramsStr}}/1024,0.01)`],
            name: "['输入字节数', '输出字节数']",
            unit: 'KB'
          }
        },
        {
          title: '数据包总数',
          params: {
            expr: [`ifInUcastPkts{${this.paramsStr}}`, `ifOutUcastPkts{${this.paramsStr}}`],
            name: "['输入数据包总数', '输出数据包总数']",
            unit: ''
          }
        },
        {
          title: '接口利用率',
          params: {
            expr: [`round(rate(ifInOctets[5m])/ifHighSpeed{${this.paramsStr}}/10000,0.01)`, `round(rate(ifOutOctets[5m])/ifHighSpeed{${this.paramsStr}}/10000,0.01)`],
            name: "['输入接口利用率', '输出接口利用率']",
            unit: '%'
          }
        },
        {
          title: '丢包数',
          params: {
            expr: [`ifInDiscards{${this.paramsStr}}`, `ifOutDiscards{${this.paramsStr}}`],
            name: "['输入包丢弃数', '输出包丢弃数']",
            unit: 'packages/ps'
          }
        },
        {
          title: '错误包',
          params: {
            expr: [`ifInErrors{${this.paramsStr}}`, `ifOutErrors{${this.paramsStr}}`],
            name: "['输入包错误数', '输出包错误数']",
            unit: 'packages/ps'
          }
        },
        {
          title: '丢失率',
          params: {
            expr: [`round((ifInDiscards{${this.paramsStr}}+ifOutDiscards)/(ifInUcastPkts+ifOutUcastPkts)*100, 0.01)`],
            name: "['丢失率']",
            unit: '%'
          }
        },
        {
          title: '错误率',
          params: {
            expr: [`round((ifInErrors{${this.paramsStr}}+ifOutErrors)/(ifInUcastPkts+ifOutUcastPkts)*100,0.01 )`],
            name: "['错误率']",
            unit: '%'
          }
        }
      ]
    }
  },
  methods: {}
}
</script>
