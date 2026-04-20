<template>
  <div>
    <el-dialog title="创建快照" append-to-body :visible.sync="addData.dialog" width="40%">
      <span>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="110px">
          <basic-form-item label="快照名称" prop="name" :rules="[required]" required-message="该字段为必填字段">
            <el-input v-model="addData.data.name"></el-input>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { vmSnapshot } from 'services/platform/index'
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
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      floatIpList: [],
      BloudList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const { name, serverId, remark } = this.addData.data
          vmSnapshot({ name, serverId, remark }).then(data => {
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
