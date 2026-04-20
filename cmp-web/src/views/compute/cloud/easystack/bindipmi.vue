<template>
  <div>
    <el-dialog title="绑定IPMI" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="90px">
          <el-col :span="24">
            <basic-form-item label="IPMI_IP：" prop="ipmiIp" validate="required">
              <el-input v-model="addData.data.ipmiIp"></el-input>
            </basic-form-item>
            <basic-form-item label="用户名：" prop="username">
              <el-input v-model="addData.data.username"></el-input>
            </basic-form-item>
            <basic-form-item label="密码：" prop="password">
              <el-input v-model="addData.data.password" type="password"></el-input>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import crypto from 'utils/crypto.js'
import { patchHosts } from 'services/monitor'
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
      volumeData: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          const str = JSON.stringify(this.addData.data)
          const addData = JSON.parse(str)
          if (addData.password) {
            addData.password = crypto.encrypt(addData.password)
          }
          patchHosts('/cms/v1/hosts/ipmi/binding', this.addData.data).then((data) => {
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
