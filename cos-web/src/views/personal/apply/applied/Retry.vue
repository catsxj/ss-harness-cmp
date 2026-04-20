<template>
  <el-dialog title="重试预览" :visible.sync="addData.visible" width="1200px" v-if="addData.visible" append-to-body top="5vh">
    <!-- 并非重新发起 -->
    <AttributeItem class="apply-node" ref="nodeRef" :current-node="addData.record" :disabled="false" :ReSubmit="false" :Retry="true" component="div"></AttributeItem>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.visible = false">关 闭</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">提 交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { retryTaskRecord } from 'services/services/flow'
import AttributeItem from '../components/attributeItem.vue'
export default {
  components: { AttributeItem },
  props: {
    addData: {
      type: Object
    }
  },
  provide() {
    return {
      // 虚拟机重试时不可编辑作业, 作业失败时有单独的任务记录可以发起重试
      isInApproval: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    async handleSubmit() {
      const params = this.$refs.nodeRef.getPostData()
      if (!params) return
      this.loading = true
      const res = await retryTaskRecord({ id: this.addData.id, retryParamObj: params }).finally(() => {
        this.loading = false
      })
      if (!res.success) return
      this.$message.success(res.message)
      this.addData.visible = false
      this.$emit('success')
    }
  }
}
</script>

<style scoped>
.apply-node {
  max-height: 70vh;
  overflow: scroll;
}
</style>
