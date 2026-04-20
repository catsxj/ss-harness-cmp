<template>
  <div>
    <el-dialog title="新增网络接口" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="90px" :model="addData.data" ref="data">
          <vendor :add-data="addData.data" @vendorId="changeVendor"></vendor>
          <cmp-form-item label="名称：" prop="name" validate="required">
            <el-input v-model="addData.data.name"></el-input>
          </cmp-form-item>
          <cmp-form-item label="资源组：" prop="resourceGroupId" validate="required" required-message="该字段为必填字段">
            <el-select v-model="addData.data.resourceGroupId">
              <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
            </el-select>
          </cmp-form-item>
          <cmp-form-item label="网络：" prop="vpcId" validate="required">
            <el-select v-model="addData.data.vpcId" @change="setNetwork">
              <el-option v-for="(item, index) in networkList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </cmp-form-item>
          <cmp-form-item label="子网：" prop="subnetId" validate="required">
            <el-select v-model="addData.data.subnetId">
              <el-option
                v-for="(item, index) in subnetList"
                :key="index"
                :label="item.name + '(' + item.cidr + ')'"
                :value="item.id"
                :disabled="item.name.indexOf('GatewaySubnet') > -1 || item.name.indexOf('BastionSubnet') > -1 || item.name.indexOf('FirewallSubnet') > -1 || item.name.indexOf('FirewallManagementSubnet') > -1"
              ></el-option>
            </el-select>
          </cmp-form-item>
          <cmp-form-item label="专用IP：" prop="primaryPrivateIPAddress" validate="ip">
            <el-input v-model="addData.data.primaryPrivateIPAddress"></el-input>
          </cmp-form-item>
          <!-- <cmp-form-item label="安全组：" prop="securityGroups" validate="required">
            <el-select v-model="addData.data.securityGroups" multiple>
              <el-option v-for="(item, index) in groupList" :key="index" :label="item.name" :value="item.groupUuid"></el-option>
            </el-select>
          </cmp-form-item> -->
          <cmp-form-item label="描述：" prop="remark">
            <el-input type="textarea" v-model="addData.data.remark"></el-input>
          </cmp-form-item>
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
import { getGroup, getVpc, getSubnet, getRegion, conditionCloudVendor } from 'services/platform/index'
import { createNics, getResource } from 'services/platform/azure'
import vendor from '@/components/setVendor/index.vue'

export default {
  components: { vendor },
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
      groupList: [],
      regionList: [],
      resourceData: [],
      subnetList: [],
      networkList: [],
      vendorList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createNics({
            vendorId: this.addData.data.vendorId,
            nics: this.addData.data
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
    },
    // getGroup () {
    //   let networkId = ''
    //   this.networkList.forEach(item => {
    //     if (item.vpcId == this.addData.data.vpcId) networkId = item.id
    //   })
    //   getGroup({
    //     page: 1,
    //     rows: 9999,
    //     params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, vpcId: networkId }, sign: 'EQ' }])
    //   }).then(data => {
    //     if (data.success) {
    //       if (this.addData.data.securityGroups) this.$set(this.addData.data, 'securityGroups', [])
    //       this.groupList = data.data.rows
    //     }
    //   })
    // },
    getSubnet() {
      // let networkId = ''
      // this.networkList.forEach(item => {
      //   if (item.vpcId == this.addData.data.vpcId) networkId = item.id
      // })
      getSubnet({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, networkId: this.addData.data.vpcId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          if (this.addData.data.subnetId) this.$set(this.addData.data, 'subnetId', '')
          this.subnetList = data.data.rows
        }
      })
    },
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          if (this.addData.data.vpcId) this.addData.data.vpcId = ''
          this.networkList = data.data.rows
        }
      })
    },
    // 获取可用区
    getRegion() {
      getRegion({ vendorId: this.addData.data.vendorId }).then(data => {
        if (data.success) {
          this.regionList = data.data
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
    setNetwork() {
      this.getSubnet()
      // this.getGroup()
    },
    // getVendorList () {
    //   conditionCloudVendor({
    //     condition: JSON.stringify({
    //       condition: 'poolProviders',
    //       types: ['AWS']
    //     })
    //   }).then(data => {
    //     if (data.success) {
    //       this.vendorList = data.data;
    //       this.changeVendor();
    //     }
    //   })
    // },
    changeVendor() {
      this.getVpc()
      this.getResource()
    }
  },
  created() {
    // this.getVendorList()
  }
}
</script>

<style></style>
