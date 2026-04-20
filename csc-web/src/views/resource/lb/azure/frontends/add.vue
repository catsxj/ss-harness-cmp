<template>
  <div>
    <el-dialog append-to-body title="新增前端IP" :visible.sync="addData.dialog" v-if="addData.dialog">
      <cmp-form ref="data" :model="addData.data.ipList" :status-icon="true" label-width="110px">
        <el-row>
          <el-col :span="24">
            <cmp-form-item label="名称：" prop="name" validate="required">
              <el-input v-model="addData.data.ipList.name" placeholder="请输入内容"></el-input>
            </cmp-form-item>
          </el-col>
          <el-col :span="24" v-if="addData.data.ipList.frontEndType == 'EXTERNAL'">
            <cmp-form-item label="弹性IP地址：" prop="publicIpId" validate="required">
              <el-select v-model="addData.data.ipList.publicIpId">
                <el-option v-for="(item, index) in list" :key="index" :label="item.name + '(' + (item.ipAddress || '') + ')'" :value="item.id"></el-option>
              </el-select>
            </cmp-form-item>
          </el-col>
          <el-col :span="24" v-if="addData.data.ipList.frontEndType == 'INTERNAL'">
            <cmp-form-item label="网络：" prop="vpcId" validate="required">
              <!-- {{addData.data.ipList.vpcId}} -->
              <el-select v-model="addData.data.ipList.vpcId" @change="getSubnet">
                <el-option v-for="(item, index) in networkList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </cmp-form-item>
            <cmp-form-item label="子网：" prop="subnetId" validate="required">
              <el-select v-model="addData.data.ipList.subnetId">
                <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name + '(' + item.cidr + ')'" :value="item.id"></el-option>
              </el-select>
            </cmp-form-item>
          </el-col>
        </el-row>
      </cmp-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getSubnet, getVpc } from 'services/platform/index'
import { createFrontend, getPublicIpsUnused } from 'services/platform/azure'
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
      list: [],
      networkList: [],
      subnetList: []
    }
  },
  methods: {
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, regionId: this.addData.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (this.addData.data.ipList.vpcId) this.addData.data.ipList.vpcId = ''
        this.networkList = data.data.rows
      })
    },
    getSubnet() {
      getSubnet({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, networkId: this.addData.data.ipList.vpcId }, sign: 'EQ' }])
      }).then(data => {
        if (this.addData.data.ipList.subnetId) this.$set(this.addData.data.ipList, 'subnetId', '')
        this.subnetList = data.data.rows
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          // createFrontend(this.addData.data.ipList.map(item => {
          //   return {
          //     frontEnd: {
          //       ...item,
          //       vendorId: this.addData.data.vendorId,
          //       slbId: this.addData.data.slbId
          //     }
          //   }
          // }))
          createFrontend({
            frontEnd: {
              ...this.addData.data.ipList,
              vendorId: this.addData.data.vendorId,
              slbId: this.addData.data.slbId
            }
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
              this.$parent.handleSearch()
            }
          })
        }
      })
    },
    getIpList() {
      getPublicIpsUnused({ vendorId: this.addData.data.vendorId, regionId: this.addData.regionId }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    }
  },
  created() {
    this.getIpList()
    this.getVpc()
  }
}
</script>

<style></style>
