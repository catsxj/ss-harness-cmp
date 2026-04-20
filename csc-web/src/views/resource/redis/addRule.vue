<template>
  <div>
    <el-dialog title="新增防火墙" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="130px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required,fwName" required-message="请输入名称" maxlength="127">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="起始IP：" prop="startIp" validate="required,ip" required-message="请输入名称">
              <el-input v-model="addData.data.startIp"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="结束IP：" prop="endIp" validate="required,ip" required-message="请输入名称">
              <el-input v-model="addData.data.endIp"></el-input>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createRedisRule } from 'services/platform/azure'
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
      loading: false
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createRedisRule({ redisFirewallRule: this.addData.data }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style></style>
