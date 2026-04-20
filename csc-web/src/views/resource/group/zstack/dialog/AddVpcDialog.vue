<template>
  <div>
    <el-dialog :title="`${dialog.type=='add'?'挂载':'卸载'}`" :visible.sync="dialog.visible" width="40%">
      <el-row>
        <basic-form label-width="120px" :model="addData" ref="data">
          <el-col :span="24">
            <basic-form-item label="三层网络：" prop="vpcId" validate="required">
              <el-select v-model="addData.vpcId" clearable>
                <el-option v-for="item in vpcList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </basic-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getVpc, createVpc, removeVpc } from 'services/platform/index'
export default {
  props: {
    dialog: {
      type: Object,
      default: function () {
        return {
          record: {},
          visible: false
        }
      }
    }
  },
  data() {
    return {
      vpcList: [],
      addData: {
        vpcId: ''
      }
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const http = this.dialog.type == 'add' ? createVpc : removeVpc
          http(this.dialog.record.id, this.addData.vpcId).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.dialog.visible = false
              this.$emit('back')
            }
          })
        }
      })
    },
    async getVpc() {
      const { data, success } = await getVpc({ condition: JSON.stringify({ condition: this.dialog.type == 'add' ? 'listNotInSecurityGroup' : 'listInSecurityGroup', groupId: this.dialog.record.id }) })
      if (success) this.vpcList = data
    }
  },
  created() {
    this.getVpc()
  }
}
</script>

<style></style>
