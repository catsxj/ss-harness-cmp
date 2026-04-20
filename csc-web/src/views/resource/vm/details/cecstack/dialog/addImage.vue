<template>
  <div>
    <el-dialog title="添加镜像" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-row>
        <basic-form label-width="120px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required,aliNicsName" required-message="请输入名称">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="描述：" prop="remark" validate="aliRemark">
              <el-input v-model="addData.data.remark" type="textarea"></el-input>
            </basic-form-item>
          </el-col>
        </basic-form>
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
import { createImage, getVm } from 'services/platform/index'
import { getResource } from 'services/platform/azure.js'
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
    regionList: {
      type: Array
    }
  },
  data() {
    return {
      // regionList: [],
      vmList: [],
      rgroupList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createImage(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.$parent.getData()
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
