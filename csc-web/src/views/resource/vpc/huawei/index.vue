<template>
  <div>
    <common-detail v-if="detailFlag" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="网络UUID">{{ detail.vpcId }}</common-detail-item>
        <common-detail-item label="状态">
          <status-icon :type="detail.status | vmStatusColor">{{ detail.status | openstackServer }}</status-icon>
        </common-detail-item>
        <common-detail-item label="地域">{{ detail.regionName }}</common-detail-item>
        <common-detail-item label="CIDR">{{ detail.cidr }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="子网列表" name="second">
          <basic-form :inline="true" :model="subSearchData">
            <basic-form-item>
              <el-select v-model="subSearchData.zone" clearable placeholder="可用区">
                <el-option v-for="(item, index) in zoneList" :key="index" :label="item.name" :value="item.zoneId"></el-option>
              </el-select>
            </basic-form-item>
            <basic-form-item>
              <el-input placeholder="名称" v-model="subSearchData.name"></el-input>
            </basic-form-item>
            <basic-form-item>
              <el-input placeholder="uuid" v-model="subSearchData.subnetUuid"></el-input>
            </basic-form-item>
            <basic-form-item>
              <el-button type="ghost" icon="el-icon-search" @click="handleSubSearch">搜索</el-button>
            </basic-form-item>
          </basic-form>
          <basic-table :data="networkData" :params="paramd" :get-list="getSubnet" :total="networkTotal">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="subnetUuid" label="UUID" show-overflow-tooltip></el-table-column>
            <el-table-column prop="gateway" label="网关" show-overflow-tooltip></el-table-column>
            <el-table-column prop="cidr" label="子网Ipv4网段" show-overflow-tooltip></el-table-column>
            <!-- <el-table-column label="子网Ipv6网段" show-overflow-tooltip prop="ipv6Cidr">
              <template slot-scope="scope">
                <span v-if="scope.row.ipv6Cidr">{{ scope.row.ipv6Cidr }}</span>
                <el-button type="text" v-else @click="operationHuaweiVpcSubIpv6(scope.row.id, 'associateIpv6')"> 开启Ipv6 </el-button>
              </template>
            </el-table-column> -->
            <el-table-column prop="dnsNames" label="DNS" show-overflow-tooltip></el-table-column>
            <el-table-column prop="zoneName" label="所属区域" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="220px" align="center">
              <template slot-scope="scope">
                <el-button v type="text" @click="modifySubnet(scope.row)"> <i class="el-icon-edit"></i> 编辑 </el-button>
                <!-- <el-button type="text" @click="subnetSetting(scope.row.id)"> <i class="el-icon-setting"></i> 配置 </el-button>
                <el-button type="text" @click="subnetMapping(scope.row.id)"> <i class="el-icon-setting"></i> 映射 </el-button> -->
                <el-button v type="text" @click="removeSubnet(scope.row.id)"> <i class="el-icon-delete"></i> 删除 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <div class="wrapper" v-if="!detailFlag">
      <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
        <template v-slot:action>
          <router-link :to="{ name: 'ServiceVpcCreate', params: { type: 'HUAWEI' } }" class="m-r-md">
            <el-button type="primary">订购VPC实例</el-button>
          </router-link>
          <el-button type="ghost" @click="handleDelete" :disabled="selectList.length == 0">删除 </el-button>
        </template>
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #status="status">
          <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
        </template>
        <template #operate="val, record">
          <UnsubscribeService type="vpc" :data="record" @getList="getData"> </UnsubscribeService>
          <div class="action-divider"></div>
          <el-button v type="text" @click="dropdownClick({ data: record, index: 8 })" :disabled="record.projectVisibility && record.projectVisibility != 'GLOBAL_PROJECT'"> 创建子网 </el-button>
        </template>
      </AdvanceTable>
    </div>
    <el-dialog title="子网映射" :close-on-click-modal="false" :visible.sync="mapDialog.visible" v-if="mapDialog.visible" width="35%">
      <basic-form :model="mappingData" ref="MappingForm" label-width="120px">
        <basic-form-item label="ipPoolId：" prop="ipPoolId">
          <el-input v-model="mappingData.ipPoolId" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="netInfoId：" prop="netInfoId">
          <el-input v-model="mappingData.netInfoId" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="v6NetInfoId：" prop="v6NetInfoId">
          <el-input v-model="mappingData.v6NetInfoId" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="mapDialog.visible = false">取消</el-button>
        <el-button type="primary" @click.native="saveMapping">确定</el-button>
      </div>
    </el-dialog>
    <add-subnet :add-data="addSubnetData" v-if="addSubnetData.dialog"></add-subnet>
    <modify-subnet @back="getSubnet" :add-data="modifySubnetData" v-if="modifySubnetData.dialog"></modify-subnet>
    <setsubnet :add-data="setsubnetData" v-if="setsubnetData.dialog" @back="getSubnet"></setsubnet>
  </div>
</template>

<script>
import {
  getRouterSubnet,
  getZone,
  getVpc,
  mapSubnet,
  createVpc,
  modifyVpc,
  operationSubIpvs,
  removeVpc,
  removeVpcs,
  detailVpc,
  patchRouter,
  getRegion,
  getSubnet,
  createSubnet,
  removeSubnet,
  detailSubnet,
  removeSubnets,
  getNetwork,
  attachRouterSubents,
  detachRouterSubents
} from 'services/platform/index'
import { openstackServer, vmStatusColor, adminStateupFilter } from 'filters'
import addSubnet from './addSubnet.vue'
import modifySubnet from './modifySubnet.vue'
import setsubnet from './setsubnet.vue'
import UnsubscribeService from '@/components/UnsubscribeService.vue'
import webSocket from '@/common/mixins/getGlobalSocket'

const columns = [
  {
    type: 'selection',
    disabled: true
  },
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: 'UUID',
    prop: 'vpcId'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: 'CIDR',
    prop: 'cidr'
  },
  {
    label: '所属地域',
    prop: 'regionName'
  },
  {
    label: '操作',
    width: '220px',
    scopedSlots: { customRender: 'operate' },
    disabled: true
  }
]
export default {
  mixins: [webSocket],
  computed: {
    searchConfigs() {
      return [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'UUID', value: 'vpcId' },
        { type: 'Const', value: 'vendorType', initValue: 'HUAWEI' }
      ]
    }
  },
  components: {
    addSubnet,
    modifySubnet,
    setsubnet,
    UnsubscribeService
  },
  data() {
    return {
      columns,
      loading: false,
      detailFlag: false,
      detail: {},
      networkTotal: 0,
      networkData: [],
      paramd: {
        page: 1,
        rows: 10
      },
      id: '',
      params: {
        page: 1,
        rows: 10
      },
      setsubnetData: {
        dialog: false,
        data: {}
      },
      mapDialog: {
        visible: false
      },
      searchData: {
        name: '',
        regionId: '',
        vpcId: ''
      },
      regionList: [],
      list: [],
      total: 0,
      addFlag: false,
      addData: {
        name: ''
      },
      networkList: [],
      modifyData: {
        adminStateup: true,
        name: ''
      },
      modifyFlag: false,
      connectData: {
        subnetId: ''
      },
      connectFlag: false,
      subnetList: [],
      closeList: [],
      closeData: {
        subnetId: ''
      },
      closeFlag: false,
      setData: {
        networkId: ''
      },
      setFlag: false,
      setList: [],
      addSubnetData: {
        dialog: false,
        data: {}
      },
      modifySubnetData: {
        dialog: false,
        data: {}
      },
      idList: [],
      selectList: [],
      mappingData: {
        ipPoolId: '',
        netInfoId: '',
        v6NetInfoId: ''
      },
      subSearchName: '',
      subSearchData: {
        name: '',
        zone: '',
        subnetUuid: ''
      },
      detailData: null
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('vpc') > -1) {
        this.getData()
      }
    },
    handleDelete() {
      this.refreshId()
      const list = this.idList
      if (list.length == 0) return this.$message.error('请选择VPC')
      this.$confirm('此操作将删除所选VPC, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeVpcs(list).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getData()
            this.selectList = []
          }
        })
      })
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    // 单选
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    modifySubnet(data) {
      const callBack = function (data) {
        if (!data) return ''
        const list = JSON.parse(data)
        let str = ''
        if (list.length > 1) str = list.join('\n')
        else str = list.join()
        return str
      }
      this.modifySubnetData = {
        dialog: true,
        data: {
          id: data.id,
          name: data.name,
          vendorId: data.vendorId,
          dnsName: data.dnsNames ? callBack(data.dnsNames) : ''
        }
      }
    },
    getDetail(row) {
      this.detailData = row
      detailVpc(row.id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.getSubnet(1)
          this.getZoomData(row.regionId)
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    getSubnet(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([
        {
          param: { vpcUuid: this.detail.vpcId, vendorId: this.detail.vendorId },
          sign: 'EQ'
        }
      ])
      getSubnet(this.paramd).then(data => {
        if (data.success) {
          this.networkData = data.data.rows
          this.networkTotal = data.data.total
        }
      })
    },
    getData() {
      this.loading = true
      getVpc(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(data => {
            if (data.projectVisibility && data.projectVisibility != 'GLOBAL_PROJECT') {
              data.disabled = true
            }
          })
        }
      })
    },
    getZoomData(regionId) {
      getZone({
        regionId,
        vendorId: this.detail.vendorId
      }).then(data => {
        if (data.success) {
          this.zoneList = data.data
        }
      })
    },
    handleSubSearch() {
      const params = [
        {
          param: { vpcUuid: this.detail.vpcId, vendorId: this.detail.vendorId, zone: this.subSearchData.zone },
          sign: 'EQ'
        },
        {
          param: {
            name: this.subSearchData.name,
            subnetUuid: this.subSearchData.subnetUuid
          },
          sign: 'LK'
        }
      ]
      if (!this.subSearchData.zone && !this.subSearchData.name && !this.subSearchData.subnetUuid) {
        this.getSubnet()
      } else {
        if (!this.subSearchData.zone) delete params[0].param.zone
        if (!this.subSearchData.name && this.subSearchData.subnetUuid) delete params[1].param.name
        if (!this.subSearchData.subnetUuid && this.subSearchData.name) delete params[1].param.subnetUuid
        if (!this.subSearchData.subnetUuid && !this.subSearchData.name) params.pop()
        getSubnet({ page: 1, rows: 10, params: JSON.stringify(params) }).then(data => {
          if (data.success) {
            this.networkData = data.data.rows
            this.networkTotal = data.data.total
          }
        })
      }
    },
    removeSubnet(id) {
      this.$confirm('此操作将删除子网, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeSubnet(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getSubnet()
          }
        })
      })
    },
    dropdownClick(command) {
      switch (command.index) {
        case 6:
          this.$confirm('此操作将永久删除该VPC, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            removeVpc(command.id).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.getData()
              }
            })
          })
          break
        case 8:
          this.addSubnetData = {
            dialog: true,
            cidr: command.data.cidr,
            data: {
              id: command.data.id,
              vendorId: command.data.vendorId,
              regionId: command.data.regionId,
              dhcpEnabled: true,
              ipv6Enable: false
            }
          }
          break
      }
    },
    handleCidr(item) {
      // let arr = cidr.split('/');
      const arr = item.cidr.split('/')
      const arr1 = arr[0].split('.')
      if (arr[1] >= 8) {
        item.tag = 1
        this.$set(item, 'ipfirst', arr1[0])
        item.ipfirst = arr1[0]
      }
      if (arr[1] >= 16) {
        item.tag = 2
        this.$set(item, 'ipTwo', arr1[1])
        item.ipTwo = arr1[1]
      }
      if (arr[1] >= 24) {
        item.tag = 3
        this.$set(item, 'ipThree', arr1[2])
        item.ipThree = arr1[2]
      }
      const ipPools = item.ipPools || []
      let str = ''
      if (ipPools.length) str = ipPools.substring(1, ipPools.length - 1)
      const ipArr = str.split('"')
      item.a = []
      for (let i = 0; i < ipArr.length; i++) {
        if (i % 2 != 0) {
          item.a.push(ipArr[i])
        }
      }
      item.iparr = []
      item.a.forEach(function (data, index) {
        const items = data.split('-')
        item.iparr.push(items)
      })
    },
    subnetSetting(id) {
      this.setsubnetData = {
        id,
        dialog: true,
        data: {
          networkArea: '',
          envCode: '',
          appSystemCodes: [],
          appSystemName: ''
        }
      }
    },
    subnetMapping(id) {
      this.mapDialog = {
        visible: true,
        id: id
      }
    },
    saveMapping() {
      mapSubnet(this.mapDialog.id, {
        id: this.mapDialog.id,
        params: JSON.stringify(this.mappingData)
      }).then(data => {
        const type = data.success ? 'success' : 'error'
        this.$message({
          type: type,
          message: data.message
        })
        if (data.success) {
          this.mapDialog = {
            visible: false
          }
          this.getSubnet()
          this.mappingData = { ipPoolId: '', netInfoId: '', v6NetInfoId: '' }
        }
      })
    },
    operationHuaweiVpcSubIpv6(id, action) {
      operationSubIpvs(id, {
        action,
        params: JSON.stringify({
          ipv6Cidr: ''
        })
      }).then(data => {
        const type = data.success ? 'success' : 'error'
        this.$message({
          type,
          message: data.message
        })
        if (data.success) this.getSubnet()
      })
    }
  }
}
</script>

<style scoped></style>
