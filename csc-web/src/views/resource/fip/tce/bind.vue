<template>
  <div>
    <el-dialog title="绑定云主机" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="90px" :model="addData.data" ref="data">
          <basic-form-item label="云主机：" prop="serverId" validate="required" required-message="请选择云主机">
            <el-select v-model="addData.data.serverId">
              <el-option v-for="(item, index) in vmList" :label="item.name" :value="item.id" :key="index"></el-option>
            </el-select>
          </basic-form-item>
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
import { floatIpPorts, getVm } from 'services/platform/index'
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
      vmList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          floatIpPorts(this.addData.data).then(data => {
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
    },
    // 获取可用区
    getVm() {
      getVm({
        simple: true,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.vmList = data.data.rows
        }
      })
    }
  },
  created() {
    this.getVm()
  }
}
</script>

<style></style>
