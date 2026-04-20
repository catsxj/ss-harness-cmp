<template>
  <div>
    <el-dialog title="新增Vnet规则" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="130px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
          </el-col>
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
                <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name + '(' + item.cidr + ')'" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="ignoreMissingVnetServiceEndpoint" :rules="[{ required: true, message: '该字段为必填字段' }]" label-width="400px">
              <span slot="label">
                在虚拟网络启用 vnet 服务终结点之前创建防火墙规则：
                <el-tooltip class="item" effect="dark" content="选定子网没有为服务终结点启用 Microsoft.Sql。启用访问最多可能需要 15 分钟才能完成。" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-checkbox v-model="addData.data.ignoreMissingVnetServiceEndpoint" disabled>启用</el-checkbox>
            </el-form-item>
            <!-- <basic-form-item label="在虚拟网络启用 vnet 服务终结点之前创建防火墙规则：" label-width="400px" prop="ignoreMissingVnetServiceEndpoint" validate = "required">
              <el-checkbox v-model="addData.data.ignoreMissingVnetServiceEndpoint" disabled>启用</el-checkbox>
            </basic-form-item> -->
          </el-col>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getSubnet, getVpc } from 'services/platform/index'
import { createVnet } from 'services/platform/azure'
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
      loading: false,
      networkList: [],
      subnetList: []
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
        if (this.addData.data.vpcId) this.addData.data.vpcId = ''
        this.networkList = data.data.rows
      })
    },
    getSubnet() {
      getSubnet({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, networkId: this.addData.data.vpcId }, sign: 'EQ' }])
      }).then(data => {
        if (this.addData.data.subnetId) this.addData.data.subnetId = ''
        this.subnetList = data.data.rows
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createVnet({
            databaseServerId: this.addData.data.databaseServerId,
            name: this.addData.data.name,
            subnetId: this.addData.data.subnetId,
            ignoreMissingVnetServiceEndpoint: this.addData.data.ignoreMissingVnetServiceEndpoint
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
      })
    }
  }
}
</script>

<style></style>
