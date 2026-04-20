<template>
  <div>
    <el-dialog title="编辑" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="名称:" prop="name">
              <el-input v-model="addData.data.name" disabled></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="原参数值:" prop="oldValue">
              <el-input v-model="addData.data.oldValue" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="参数值:" prop="value" v-if="type == 'boolean'">
              <el-switch v-model="addData.data.value" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </el-form-item>
            <basic-form-item label="参数值:" prop="value" validate="required" v-else>
              <el-input v-model="addData.data.value" v-if="type != 'boolean' && type != 'number'"></el-input>
              <el-input-number v-model="addData.data.value" v-if="type == 'number'" style="width: 100%"></el-input-number>
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
import { modifyRdsParameters, modifyKvsParameters } from 'services/resource/datebase'
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
    url: {
      type: String
    },
    type: {
      type: String,
      default: ''
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
          if (this.addData.data.value == this.addData.data.oldValue) return this.$message.error('不可与原有参数值一致')
          const ok = this.url == 'rds' ? modifyRdsParameters : modifyKvsParameters
          ok({
            id: this.addData.data.id,
            name: this.addData.data.name,
            value: this.addData.data.value,
            oldValue: this.addData.data.oldValue,
            type: this.type
          }).then(data => {
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
  created() {
    const value = this.addData.data.value
    if (this.type == 'boolean') {
      this.$set(this.addData.data, 'value', !!value)
    }
  }
}
</script>

<style></style>
