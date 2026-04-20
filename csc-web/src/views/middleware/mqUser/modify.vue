<template>
  <div>
    <el-dialog title="编辑" :visible.sync="addData.dialog" width="50%" append-to-body>
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="密码:" prop="password" validate="required">
              <el-input v-model="addData.data.password" type="password"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="tags:" prop="tags">
              <el-input v-model="addData.data.tags"></el-input>
              <div class="mine-text">
                <span>Set</span>
                <span class="m-l-md" @click="setTags(item.value)" v-for="(item, index) in list" :key="index">{{ item.name }}</span>
              </div>
            </el-form-item>
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
import { modisyMqUser } from 'services/resource/middleware'
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
      list: [
        { name: 'Admin', value: 'administrator' },
        { name: 'Monitoring', value: 'monitoring' },
        { name: 'Policymaker', value: 'policymaker' },
        { name: 'management', value: 'management' },
        { name: 'None', value: '' }
      ]
    }
  },
  methods: {
    setTags(value) {
      this.$set(this.addData.data, 'tags', value)
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const obj = JSON.parse(JSON.stringify(this.addData.data))
          obj.password = crypto.encrypt(obj.password)
          modisyMqUser(obj).then(data => {
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

<style scoped>
.mine-text {
  color: darkgray;
  font-size: 12px;
  cursor: pointer;
}
</style>
