<template>
  <div>
    <el-dialog title="热插拔设置" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <basic-form label-width="120px" :model="addData.data" ref="data">
          <el-row>
            <el-col :span="12">
              <basic-form-item label="CPU热插拔:" prop="cpuHotEnable" validate="required">
                <el-switch v-model="addData.data.cpuHotEnable" active-color="#13ce66" inactive-color="#ff4949" active-text="开启" inactive-text="关闭"> </el-switch>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="内存热插拔:" prop="memHotEnable" validate="required">
                <el-switch v-model="addData.data.memHotEnable" active-color="#13ce66" inactive-color="#ff4949" active-text="开启" inactive-text="关闭"> </el-switch>
              </basic-form-item>
            </el-col>
          </el-row>
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
import { vmHotConfigEnable } from 'services/platform/index'
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
          vmHotConfigEnable(this.addData.data).then(data => {
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
