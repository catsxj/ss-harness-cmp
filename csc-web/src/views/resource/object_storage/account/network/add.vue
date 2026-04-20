<template>
  <div>
    <el-dialog title="设置网络" :visible.sync="addData.dialog" width="50%" v-if="addData.dialog" append-to-body>
      <el-alert v-if="addData.data.isAccessAllNetworks == true" class="m-b" type="warning" show-icon :closable="false" description="设置全部网络会删除关联子网和防火墙，请谨慎操作！"></el-alert>
      <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
        <basic-form-item label="分配：" prop="isAccessAllNetworks" validate="required">
          <el-radio-group v-model="addData.data.isAccessAllNetworks" size="small">
            <el-radio :label="true" border>所有网络</el-radio>
            <el-radio :label="false" border>所选网络</el-radio>
          </el-radio-group>
        </basic-form-item>
        <el-row v-if="addData.data.isAccessAllNetworks == false">
          <el-col :span="24">
            <basic-form-item label="网络：" prop="vpcId" validate="required">
              <el-select v-model="addData.data.vpcId" @change="getSubnet">
                <el-option v-for="(item, index) in networkList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="子网：" prop="subnetId" validate="required">
              <el-select v-model="addData.data.subnetId">
                <el-option
                  v-for="(item, index) in subnetList"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item.name.indexOf('GatewaySubnet') > -1 || item.name.indexOf('BastionSubnet') > -1 || item.name.indexOf('FirewallSubnet') > -1 || item.name.indexOf('FirewallManagementSubnet') > -1"
                ></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { postAccountAllNetwork, detailAccount, addAccountNetwork, removeAccountNetwork } from 'services/platform/azure'
import { getVpc, getAccountSubnet } from 'services/platform/index'
/* global $ */
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {},
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      params: {
        page: 1,
        rows: 9999
      },
      networkList: [],
      subnetList: [],
      total: 0
    }
  },
  created() {
    this.getVpc()
  },
  methods: {
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.networkList = data.data.rows
        }
      })
    },
    getSubnet() {
      getAccountSubnet(this.addData.data.vpcId).then(data => {
        if (data.success) {
          if (this.addData.data.subnetId) this.addData.data.subnetId = ''
          this.subnetList = data.data
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          if (this.addData.data.isAccessAllNetworks == true) {
            postAccountAllNetwork({
              id: this.addData.data.id
            }).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
                this.$emit('back')
              }
              this.loading = false
            })
          } else {
            addAccountNetwork({
              id: this.addData.data.id,
              subnetId: this.addData.data.subnetId
            }).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
                this.$emit('back')
              }
              this.loading = false
            })
          }
        }
      })
    }
  }
}
</script>

<style></style>
