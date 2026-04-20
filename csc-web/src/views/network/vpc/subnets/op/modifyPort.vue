<template>
  <div>
    <el-dialog title="修改端口" append-to-body :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <div>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="80px">
          <basic-form-item label="端口名称" prop="name" validate="required,noChinese">
            <el-input v-model="addData.data.name"></el-input>
          </basic-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { modifyPort } from 'services/platform/index'
export default {
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
      this.$refs.data.validate(valid => {
        if (valid) {
          const param = {
            name: this.addData.data.name,
            id: this.addData.data.id
          }
          modifyPort(param).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
