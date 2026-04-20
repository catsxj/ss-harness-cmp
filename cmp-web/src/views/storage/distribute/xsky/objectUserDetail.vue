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
          title: '容量历史监控',
          params: {
            expr: [`xms_object_storage_user_allocated_size_bytes{${this.paramsStr}}/1024`],
            name: "['容量历史监控']",
            unit: 'KB'
          }
        },
        {
          title: '对象数历史监控',
          params: {
            expr: [`xms_object_storage_user_allocated_objects{${this.paramsStr}}`],
            name: "['对象数历史监控']",
            unit: '个'
          }
        },
        {
          title: '上传带宽',
          params: {
            expr: [`xms_object_storage_user_rx_bandwidth_kbyte{${this.paramsStr}}`, `xms_object_storage_user_tx_bandwidth_kbyte{${this.paramsStr}}`],
            name: "['上传', '下载']",
            unit: 'KB'
          }
        },
        {
          title: '上传请求/分钟',
          params: {
            expr: [`xms_object_storage_user_rx_ops_per_minute{${this.paramsStr}}`],
            name: "['上传请求/分钟']",
            unit: '次'
          }
        },
        {
          title: '下载请求/分钟',
          params: {
            expr: [`xms_object_storage_user_tx_ops_per_minute{${this.paramsStr}}`],
            name: "['下载请求/分钟']",
            unit: '次'
          }
        },
        {
          title: '删除请求/分钟',
          params: {
            expr: [`xms_object_storage_user_del_ops_per_minute{${this.paramsStr}}`],
            name: "['下载请求/分钟']",
            unit: '次'
          }
        }
      ],
      detailMapList: [
        { name: '名称', value: 'name' },
        { name: '邮箱', value: 'email' }
      ]
    }
  },
  methods: {}
}
</script>
