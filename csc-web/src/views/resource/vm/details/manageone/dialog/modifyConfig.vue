<template>
  <div>
    <el-dialog title="修改配置" append-to-body :visible.sync="addData.dialog" width="40%">
      <span>
        <el-form ref="bandIpData" :model="addData.data" :status-icon="true" label-width="80px">
          <el-row>
            <el-col :span="24">
              <basic-form-item label="名称：" prop="flavorId" :rules="[required]" required-message="该字段为必填字段">
                <el-select v-model="addData.data.flavorId">
                  <el-option v-for="item in flavorList" :key="item.id" :label="item.name + '(' + item.cpu + '核/' + item.memory + 'GB' + ')'" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { patchVmResize, getVmFlavor } from 'services/platform/index'
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
      flavorList: []
    }
  },
  methods: {
    ok() {
      this.$refs.bandIpData.validate(valid => {
        if (valid) {
          patchVmResize('resize', this.addData.data).then(data => {
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
  created() {
    getVmFlavor({
      action: 'high',
      params: JSON.stringify({
        id: this.addData.data.id,
        vendorId: this.addData.data.vendorId
      })
    }).then(data => {
      if (data.success) {
        this.flavorList = data.data
      }
    })
  }
}
</script>

<style></style>
