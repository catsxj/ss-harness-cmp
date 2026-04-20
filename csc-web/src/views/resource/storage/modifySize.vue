<template>
  <div>
    <el-dialog title="扩容" :visible.sync="addData.dialog" width="50%">
      <el-row>
        <disk :item-data="addData.data" ref="disk"></disk>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import disk from '@/views/personal/apply/components/disk/index.vue'
import { modifyResourceEFC } from 'services/services/product'

export default {
  components: { disk },
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    ok() {
      const data = this.$refs.disk.ok()
      if (data) {
        modifyResourceEFC(data).then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.addData.dialog = false
          }
        })
      } else {
        this.$message.error('信息填写不完整')
      }
    }
  }
}
</script>

<style></style>
