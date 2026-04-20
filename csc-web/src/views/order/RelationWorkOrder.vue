<template>
  <el-dialog title="" :visible.sync="dialogData.visible" width="90%" append-to-body top="5vh">
    <ApplyDetail :record="dialogData.record" @goBack="dialogData.visible = false"></ApplyDetail>
  </el-dialog>
</template>

<script>
import ApplyDetail from 'views/personal/apply/ApplyDetail.vue'
export default {
  components: { ApplyDetail },
  props: {
    dialogData: {
      type: Object,
      default: () => ({ visible: false })
    }
  }
}
</script>
