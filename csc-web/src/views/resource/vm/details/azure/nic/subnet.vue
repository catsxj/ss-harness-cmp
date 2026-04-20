<template>
  <div>
    <el-dialog title="更改子网" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog" append-to-body>
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="80px">
          <el-col :span="24">
            <basic-form-item label="VPC：">
              {{ addData.vpcName }}
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="子网：" prop="securityGroupId">
              <el-select v-model="addData.data.subnetId">
                <el-option
                  v-for="(item, index) in list"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.name.indexOf('GatewaySubnet') > -1 || item.name.indexOf('BastionSubnet') > -1 || item.name.indexOf('FirewallSubnet') > -1 || item.name.indexOf('FirewallManagementSubnet') > -1"
                ></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getSubnet } from 'services/platform/index'
import { patchNics } from 'services/platform/azure'
/* global $ */
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
      list: []
    }
  },
  created() {
    this.getSubnet()
  },
  methods: {
    getSubnet() {
      getSubnet({
        simple: true,
        params: JSON.stringify([{ param: { networkId: this.addData.data.vpcId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.list = data.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          patchNics('changeSubnet', this.addData.data).then(data => {
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
  }
}
</script>

<style></style>
