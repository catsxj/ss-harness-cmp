<template>
  <div>
    <el-dialog append-to-body title="新增运行状况探测" :visible.sync="addData.dialog" v-if="addData.dialog">
      <cmp-form ref="data" :model="addData.data" :status-icon="true" label-width="110px">
        <cmp-form-item label="名称：" prop="name" validate="required">
          <el-input v-model="addData.data.name" placeholder="请输入内容"></el-input>
        </cmp-form-item>
        <cmp-form-item label="协议：" prop="protocol" validate="required">
          <el-select v-model="addData.data.protocol">
            <el-option label="TCP" value="TCP"></el-option>
            <el-option label="HTTP" value="HTTP"></el-option>
            <el-option label="HTTPS" value="HTTPS"></el-option>
          </el-select>
        </cmp-form-item>
        <cmp-form-item label="端口：" prop="port" validate="required,port">
          <el-input v-model.number="addData.data.port" placeholder="请输入内容"></el-input>
        </cmp-form-item>
        <cmp-form-item v-if="addData.data.protocol == 'HTTP' || addData.data.protocol == 'HTTPS'" label="路径：" prop="requestPath" validate="required">
          <el-input v-model="addData.data.requestPath" placeholder="请输入内容"></el-input>
        </cmp-form-item>
        <cmp-form-item label="间隔：" prop="intervalInSeconds" validate="required">
          <el-input v-model.number="addData.data.intervalInSeconds" placeholder="请输入内容">
            <template slot="append">秒</template>
          </el-input>
        </cmp-form-item>
        <cmp-form-item label="不正常阈值：" prop="numberOfProbes" validate="required">
          <el-input v-model.number="addData.data.numberOfProbes" placeholder="请输入内容"></el-input>
          <template slot="append">连续失败</template>
        </cmp-form-item>
      </cmp-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createProbes } from 'services/platform/azure'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            name: ''
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      list: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createProbes({
            probe: this.addData.data
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
              this.$parent.handleSearch()
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
