<template>
  <div>
    <el-dialog title="附加" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <cmp-form label-width="120px" ref="data" :model="addData.data">
          <cmp-form-item label="云主机：" prop="serverId" validate="required" required-message="请选择云主机">
            <el-select v-model="addData.data.serverId">
              <el-option v-for="item in vmDataList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </cmp-form-item>
        </cmp-form>
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
import { getVm } from 'services/platform/index'
import { patchNics } from 'services/platform/azure'
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
    vendorId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      vmDataList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          patchNics('attach', this.addData.data).then(data => {
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
    const params = JSON.stringify([
      {
        param: {
          vendorId: this.addData.data.vendorId
        },
        sign: 'EQ'
      }
    ])
    getVm({
      simple: true,
      params: params
    }).then(data => {
      if (data.success) {
        this.vmDataList = data.data.rows
      }
    })
  }
}
</script>

<style></style>
