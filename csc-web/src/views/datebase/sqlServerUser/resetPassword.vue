<template>
  <div>
    <el-dialog title="重置密码" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="旧密码:" prop="password" validate="required">
              <el-input type="password" v-model="addData.data.password"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="新密码:" prop="newPassword" validate="required,datebasePassword">
              <el-input type="password" v-model="addData.data.newPassword"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="确认密码:" prop="endPassword" validate="required,datebasePassword">
              <el-input type="password" v-model="addData.data.endPassword"></el-input>
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
import { patchRdsUsers } from 'services/resource/datebase'
import crypto from 'utils/crypto'

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
      regionList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.addData.data.newPassword == this.addData.data.password) return this.$message.error('新密码与旧密码不可一致')
          if (this.addData.data.newPassword != this.addData.data.endPassword) return this.$message.error('俩次密码不一致')
          const obj = JSON.parse(JSON.stringify(this.addData.data))
          obj.newPassword = crypto.encrypt(obj.newPassword)
          obj.endPassword = crypto.encrypt(obj.endPassword)
          obj.password = crypto.encrypt(obj.password)
          patchRdsUsers('reset', obj).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.getList()
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
