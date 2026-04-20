<template>
  <el-dialog title="作业详情" :visible.sync="addData.visible" width="1200px" v-if="addData.visible" append-to-body top="5vh">
    <ExecuteDetail :RetryTaskInstanceId="addData.taskInstanceId" @close="addData.visible = false"></ExecuteDetail>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.visible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ExecuteDetail from 'views/task/graph/executeDetail/index.vue'
export default {
  components: { ExecuteDetail },
  props: {
    addData: {
      type: Object
    }
  }
}
</script>
