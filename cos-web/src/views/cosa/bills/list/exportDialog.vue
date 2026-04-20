<template>
  <div>
    <el-dialog title="提示" :visible.sync="dialog.visible" width="30%" :before-close="handleClose">
      <span> 即将导出当前界面中展示的账单数据，是否继续？</span>
      <div>
        <el-checkbox v-model="dialog.flag">同时导出账单详情</el-checkbox>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="handleSure">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { exportBill } from 'services/services/bill'

export default {
  props: {
    dialog: { type: Object }
  },

  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    handleClose() {
      this.dialog.visible = false
    },
    handleSure() {
      const params = { ...this.dialog.params, flag: this.dialog.flag }
      exportBill(params)
      this.dialog.visible = false
    }
  }
}
</script>
