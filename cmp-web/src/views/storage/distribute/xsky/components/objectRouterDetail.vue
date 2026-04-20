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
          title: 'CPU利用率',
          params: {
            expr: [`round(xms_s3_load_balancer_cpu_util{${this.paramsStr}}*100,0.01)`],
            name: "['CPU利用率']",
            unit: '%'
          }
        },
        {
          title: '内存利用率',
          params: {
            expr: [`round(xms_s3_load_balancer_mem_usage_percent{${this.paramsStr}}*100,0.01)`],
            name: "['内存利用率']",
            unit: '%'
          }
        },
        {
          title: '并发连接数',
          params: {
            expr: [`xms_s3_load_balancer_active_connections{${this.paramsStr}}`],
            name: "['并发连接数']",
            unit: '个'
          }
        }
      ],
      detailMapList: [
        { name: '名称', value: 'name' },
        { name: '生效虚拟IP', value: 'vip' }
      ]
    }
  },
  methods: {}
}
</script>
