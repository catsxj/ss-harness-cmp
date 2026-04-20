<template>
  <div>
    <el-dialog title="编辑子网" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { modifySubnet } from 'services/platform/aws'
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
    return {
      regionList: [],
      vpcList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          modifySubnet(this.addData.data).then(data => {
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
