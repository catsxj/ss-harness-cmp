<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row v-if="!isTemplate">
      <el-col :span="24">
        <RegionItem :addData="itemData" @changeVendorId="getHostData"></RegionItem>
      </el-col>
      <h5>配置信息</h5>
      <el-col :span="24">
        已分配成员列表
        <smart-table :data="usedTableData">
          <el-table-column label="ip地址">
            <template slot-scope="scope">
              <el-select v-model="scope.row.member.address">
                <el-option v-for="(row1, index) in scope.row.Ips" :key="index" :label="row1.address" :value="row1.address"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="子网" prop="subnetName"></el-table-column>
          <el-table-column label="端口">
            <template slot-scope="scope">
              <el-input-number :disabled="scope.row.flag" :controls="false" v-model="scope.row.member.port" :min="1" :max="65535" label="权重"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="权重">
            <template slot-scope="scope">
              <el-input-number :disabled="scope.row.flag" :controls="false" v-model="scope.row.member.weight" :min="0" :max="256" label="权重"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="networkRemove(scope.row.id)">移除</el-button>
            </template>
          </el-table-column>
        </smart-table>
      </el-col>
      <el-col :span="24">
        可用的云主机
        <basic-table :data="usableTableData" :get-list="getHostData" :params="paramd" :total="total">
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column label="IP地址">
            <template slot-scope="scope">
              <div v-for="row1 in scope.row.Ips" :key="row1.address">{{ row1.address }}({{ row1.networkName }})</div>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作" width="100px">
            <template slot-scope="scope">
              <el-button :disabled="scope.row.flag || isPreview" type="text" @click="networkAdd(scope.row.id)">新增</el-button>
            </template>
          </el-table-column>
        </basic-table>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import node from '../../../mixins/index'
import show from '../../../mixins/show'
import { initOpItem } from '../../data/init'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'
import { getVm } from 'services/platform/index'
export default {
  components: { RegionItem },
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          ...initOpItem,
          members: []
        }
      }
    },
    nodeId: {}
  },
  computed: {
    lastNode: function () {
      let obj = {}
      const lastObj = this.getPreNodeData(this.nodeId, 'task.resource.cls.osp')
      if (lastObj.origin) obj = lastObj
      return obj
    }
  },
  data() {
    return {
      paramd: {
        page: 1,
        rows: 10
      },
      total: 0,
      usedTableData: [],
      usableTableData: []
    }
  },
  created() {
    if (this.lastNode.location) this.itemData.location = this.lastNode.location
    if (this.itemData.location.vendorId) {
      this.usedTableData = []
      this.itemData.members.forEach(data2 => {
        data2.flag = true
        data2.Ips = [
          {
            address: data2.address,
            subnetName: data2.subnetName,
            subnetId: data2.subnetId,
            subnetUuid: data2.subnetUuid
          }
        ]
        data2.member = {
          port: data2.port,
          weight: data2.weight,
          address: data2.address
        }
        data2.name = data2.subnetName
        this.usedTableData.push(data2)
      })
    }
  },
  methods: {
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          this.itemData.members = []
          const addData = ''
          let flag = false
          this.usedTableData.forEach((data, index) => {
            if (data.member.port == undefined || !data.member.weight == undefined) {
              flag = true
              return
            }
            data.Ips.forEach(function (item) {
              if (item.address == data.member.address) {
                data.member.subnetId = item.subnetId
                data.member.subnetUuid = item.subnetUuid
                data.member.subnetName = item.subnetName
              }
            })
            data.member.id = data.id
            this.itemData.members.push(data.member)
          })
          if (flag) {
            this.$message.error('请检查数据是否填写正确, 端口范围: 1-65535,权重范围: 0-256')
            return
          }
          data = this.itemData
        }
      })
      return data
    },
    getHostData(page) {
      this.paramd.page = page || this.paramd.page
      getVm({
        page: this.paramd.page,
        rows: this.paramd.rows,
        params: this.$tools.handleSearchParam({
          vendorId: this.itemData.location.vendorId,
          tenantId: 0,
          isRecycle: 0,
          'managerIp:UEG': ''
        })
      }).then(data => {
        if (data.success) {
          this.usableTableData = data.data.rows
          const that = this
          const idList = []
          this.usedTableData.forEach(item => {
            idList.push(item.id)
          })
          for (let i = that.usableTableData.length - 1; i >= 0; i--) {
            if (idList.indexOf(that.usableTableData[i].id) != -1) {
              that.usableTableData.splice(i, 1)
            }
          }
          this.usableTableData.forEach((data2, index) => {
            data2.Ips = []
            data2.flag = false
            if (data2.privateIps) {
              const privateIps = JSON.parse(data2.privateIps)
              privateIps.forEach(function (data3, index) {
                data3.addresses.forEach((data4, index) => {
                  data4.networkName = data3.networkName
                  data2.Ips.push(data4)
                })
              })
            }
            if (data2.Ips.length == 0) {
              data.flag = true
            }
          })
          this.total = data.data.total
        }
      })
    },
    networkAdd(id) {
      this.usableTableData.forEach((data, index) => {
        if (data.id == id) {
          this.usableTableData.splice(index, 1)
          data.member = {}
          data.member.address = data.Ips[0].address
          data.subnetName = data.Ips[0].subnetName
          this.usedTableData.push(data)
        }
      })
    },
    networkRemove(id) {
      this.usedTableData.forEach((data, index) => {
        if (data.id == id) {
          this.usedTableData.splice(index, 1)
          this.usableTableData.push(data)
        }
      })
    }
  }
}
</script>
<style></style>
