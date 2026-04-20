<template>
  <div>
    <el-dialog title="新增负载均衡" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <vendor :add-data="addData.data" :types="['AZURE']" @vendorId="vendorId"></vendor>
          <el-col :span="24">
            <cmp-form-item label="资源组：" prop="resourceGroupId" validate="required" required-message="该字段为必填字段">
              <el-select v-model="addData.data.resourceGroupId" @change="getPublicIps">
                <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
            </cmp-form-item>
          </el-col>
          <el-col :span="24">
            <cmp-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="addData.data.name"></el-input>
            </cmp-form-item>
          </el-col>
          <el-col :span="24">
            <cmp-form-item label="类型：" prop="slbType" validate="required" required-message="请输入名称">
              <el-radio-group v-model="addData.data.slbType" @change="handleSlbType">
                <el-radio label="INTERNAL">内部</el-radio>
                <el-radio label="EXTERNAL">公共</el-radio>
              </el-radio-group>
            </cmp-form-item>
          </el-col>
          <el-col :span="24" v-if="addData.data.slbType == 'EXTERNAL'">
            <cmp-form-item label="弹性IP地址：" prop="publicIPAddressId" validate="required">
              <el-select v-model="addData.data.publicIPAddressId">
                <el-option v-for="(item, index) in publicIPAddress" :key="index" :label="item.name + '(' + (item.ipAddress || '') + ')'" :value="item.id"></el-option>
              </el-select>
              <el-button type="text" :disabled="!(addData.data.vendorId && addData.data.regionId && addData.data.resourceGroupId)" @click="openResourceDialog('set')">新增</el-button>
              <el-button type="text" :disabled="!(addData.data.vendorId && addData.data.regionId && addData.data.resourceGroupId)" @click="getPublicIps">刷新</el-button>
            </cmp-form-item>
          </el-col>
          <el-col :span="24" v-if="addData.data.slbType == 'INTERNAL'">
            <cmp-form-item label="网络：" prop="vpcId" validate="required">
              <el-select v-model="addData.data.vpcId" @change="getSubnet">
                <el-option v-for="(item, index) in networkList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </cmp-form-item>
            <cmp-form-item label="子网：" prop="subnetId" validate="required">
              <el-select v-model="addData.data.subnetId">
                <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name + '(' + item.cidr + ')'" :value="item.id"></el-option>
              </el-select>
            </cmp-form-item>
          </el-col>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
    <ip :add-data="resourceDialog" v-if="resourceDialog.dialog"></ip>
  </div>
</template>

<script>
/* global $ */
import { getRegion, createGroup, getSubnet, getVpc } from 'services/platform/index'
import { getResource, getPublicIpsUnused, createLb } from 'services/platform/azure'
import vendor from '@/components/setVendor/index.vue'
import ip from './ip.vue'
export default {
  components: { vendor, ip },
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
      regionList: [],
      loading: false,
      publicIPAddress: [],
      resourceData: [],
      resourceDialog: {
        dialog: false,
        data: {}
      },
      networkList: [],
      subnetList: []
    }
  },
  methods: {
    openResourceDialog() {
      this.resourceDialog = {
        dialog: true,
        data: {
          vendorId: this.addData.data.vendorId,
          regionId: this.addData.data.regionId,
          resourceGroupId: this.addData.data.resourceGroupId,
          ipAllocationMethod: 'Static',
          sku: 'Standard',
          IdleTimeoutInMinutes: 4
        }
      }
    },
    getPublicIps() {
      getPublicIpsUnused({ vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }).then(data => {
        if (data.success) {
          this.publicIPAddress = data.data
          if (this.addData.data.publicIPAddressId) this.addData.data.publicIPAddressId = ''
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          if (this.addData.data.slbType == 'EXTERNAL') {
            delete this.addData.data.vpcId
            delete this.addData.data.subnetId
            this.addData.data.publicIPAddressIds = [this.addData.data.publicIPAddressId]
          } else {
            delete this.addData.data.publicIPAddressId
          }
          createLb({ slb: this.addData.data }).then(data => {
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
    },
    getResource() {
      if (this.addData.data.resourceGroupId) this.addData.data.resourceGroupId = ''
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then(data => {
        if (data.success) {
          this.resourceData = data.data.rows
        }
      })
    },
    vendorId() {
      this.getResource()
      this.getVpc()
    },
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
        if (this.addData.data.subnetId) this.$set(this.addData.data, 'subnetId', '')
        this.subnetList = data.data.rows
      })
    },
    handleSlbType(data) {
      if (data == 'EXTERNAL') {
        this.$set(this.addData.data, 'vpcId', '')
        this.$set(this.addData.data, 'subnetId', '')
      } else {
        this.$set(this.addData.data, 'publicIPAddressIds', '')
      }
    }
  },
  created() {}
}
</script>

<style></style>
