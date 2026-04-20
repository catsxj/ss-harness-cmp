<template>
  <el-dialog title="详情" :visible.sync="data.dialog" width="40%">
    <basic-form :model="listen">
      <basic-form-item label="名称: ">
        <span>{{ listen.name }}</span>
      </basic-form-item>
      <basic-form-item label="协议: ">
        <span>{{ listen.protocol }}</span>
      </basic-form-item>
      <basic-form-item label="端口: ">
        <span>{{ listen.port }}</span>
      </basic-form-item>
      <basic-form-item label="调度算法: ">
        <span>{{ listen.scheduler }}</span>
      </basic-form-item>
      <basic-form-item label="连接超时时间: ">
        <span>{{ listen.requestTimeout }}</span>
      </basic-form-item>
      <basic-form-item label="状态: ">
        <span>{{ listen.status }}</span>
      </basic-form-item>
      <basic-form-item label="服务器组: ">
        <span>{{ listen.poolName }}</span>
      </basic-form-item>
    </basic-form>
    <div slot="footer">
      <el-button type="primary" @click="data.dialog = false">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getLbListenById } from 'services/platform/index'
export default {
  props: {
    data: {
      type: Object
    }
  },
  data() {
    return {
      listen: {}
    }
  },
  created() {
    this.getData()
  },
  mounted() {},
  methods: {
    getData() {
      getLbListenById(this.data.id).then(data => {
        if (data.success) {
          const conf = JSON.parse(data.data.configuration)
          this.listen = { ...data.data, ...conf }
        }
      })
    }
  }
}
</script>
