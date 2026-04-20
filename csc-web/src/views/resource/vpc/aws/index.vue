<template>
  <div class="wrapper">
    <common-detail v-if="detailFlag" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="网络UUID">{{ detail.vpcId }}</common-detail-item>
        <common-detail-item label="状态">
          <status-icon :type="detail.status | vmStatusColor">{{ detail.status | openstackServer }}</status-icon>
        </common-detail-item>
        <common-detail-item label="地域">{{ detail.regionName }}</common-detail-item>
        <common-detail-item label="CIDR">{{ detail.cidr ? JSON.parse(detail.cidr).join(',') : '' }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="子网列表" name="second">
          <el-form :inline="true">
            <el-form-item>
              <el-select v-model="childrenSearchData.zone" clearable>
                <el-option v-for="(item, index) in zoneList" :key="index" :label="item.name" :value="item.zoneId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input placeholder="名称" v-model="childrenSearchData.name"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="ghost" icon="el-icon-search" @click="handleChildrenSearch">搜索</el-button>
              <el-button type="ghost" class="el-icon-add" @click="addSubnet(addRow)">添加子网</el-button>
            </el-form-item>
          </el-form>
          <basic-table :data="childrenData" :params="paramd" :get-list="getSubnets" :total="childrenDataTotal" ref="childrenMultipleTable">
            <el-table-column prop="name" label="名称" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="zoneName" label="可用区" show-overflow-tooltip></el-table-column>
            <el-table-column prop="cidr" label="IPv4 CIDR" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ipv6Cidr" label="IPv6 CIDR" show-overflow-tooltip></el-table-column>
            <el-table-column prop="gateway" label="网关" show-overflow-tooltip></el-table-column>
            <el-table-column prop="subnetUuid" label="UUID" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="labels" label="标签" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="350px">
              <template slot-scope="scope">
                <el-button type="text" @click="modifySubnet(scope.row)"> <i class="el-icon-edit"></i> 编辑 </el-button>
                <el-button type="text" @click="subnetRemove(scope.row.id, 1)"> <i class="el-icon-delete"></i> 删除 </el-button>
                <!-- <el-button type="text" @click="subnetSetting(scope.row.id)> <i class="el-icon-setting"></i> 配置 </el-button>
                <el-button type="text" @click="subnetMapping(scope.row.id)"> <i class="el-icon-setting"></i> 映射 </el-button> -->
                <el-button type="text" @click="editSubCidr6(scope.row)" :disabled="addRow.ipv6Cidr == null"> <i class="el-icon-edit"></i> 编辑IPV6 CIDR </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getVpcData" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceVpcCreate', params: { type: 'AWS' } }" class="m-l-xs">
          <el-button type="primary">订购VPC实例</el-button>
        </router-link>
      </template>
      <template #vpcId="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #defaultVpc="defaultVpc">
        <span>{{ defaultVpc | booleanFilter }}</span>
      </template>
      <template #ipAry="ipAry">
        <span>
          <div v-for="(item, index) in ipAry" :key="index">
            {{ item }}
          </div>
        </span>
      </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.projectVisibility && record.projectVisibility != 'GLOBAL_PROJECT'" @click="modify(record)"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <UnsubscribeService type="vpc" :data="record" @getList="getList"> </UnsubscribeService>
        <div class="action-divider"></div>
        <el-button type="text" @click="addSubnet(record)" :disabled="record.projectVisibility && record.projectVisibility != 'GLOBAL_PROJECT'"> <i class="el-icon-add"></i> 添加子网 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="editCidr(record)" :disabled="record.projectVisibility && record.projectVisibility != 'GLOBAL_PROJECT'"> <i class="el-icon-edit"></i> 编辑CIDR </el-button>
      </template>
    </AdvanceTable>
    <add-subnet :add-data="subnetData" v-if="subnetData.dialog" @goBack="getSubnets"></add-subnet>
    <edit-cidr :add-data="cidrData" v-if="cidrData.dialog" @goBack="getVpcData"></edit-cidr>
    <edit-sub-cidr :add-data="subCidrData" v-if="subCidrData.dialog" @goBack="getSubnets" :add-row="addRow"></edit-sub-cidr>
    <modify-subnet :add-data="modifySubnetData" v-if="modifySubnetData.dialog" @back="getSubnets"></modify-subnet>
    <add-vpc :add-data="addData" v-if="addData.dialog"></add-vpc>
    <modify :add-data="modifyData" v-if="modifyData.dialog" @back="getVpcData"></modify>
    <el-dialog title="子网标签" :close-on-click-modal="false" :visible.sync="dialog.visible" v-if="dialog.visible" width="35%">
      <basic-form :model="settingData" ref="settingForm">
        <basic-form-item label="所属环境：" prop="envCode" validate="required" required-message="请选择环境">
          <el-select v-model="settingData.envCode" placeholder="请选择">
            <el-option v-for="(item, index) in envCodeList" :key="index" :label="item.name" :value="item.value"> </el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="网络区域：" prop="networkArea" validate="required" required-message="请输入网络区域名称">
          <el-select v-model="settingData.networkArea">
            <el-option v-for="(item, index) in dicList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click.native="saveSetting">确定</el-button>
      </div>
    </el-dialog>
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
  </div>
</template>

<script>
import addSubnet from './addSubnet.vue'
import editCidr from './editCidr.vue'
import editSubCidr from './editSubCidr.vue'
import modifySubnet from './modifySubnet.vue'
import addVpc from './addVpc.vue'
import modify from './modify.vue'
import UnsubscribeService from '@/components/UnsubscribeService.vue'

import { getPort, removePort, getVpc, createVpc, modifyVpc, removeVpc, detailVpc, getZone, getZoneList, getRegion, getSubnet, removeSubnet, setSubnet, getEnvironments, mapSubnet, detailSoftCategory } from 'services/platform/aws'
const columns = [
  {
    label: 'UUID',
    prop: 'vpcId',
    scopedSlots: { customRender: 'vpcId' }
  },
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: 'CIDR',
    prop: 'ipAry',
    scopedSlots: { customRender: 'ipAry' }
  },
  {
    label: 'IPV6CIDR',
    prop: 'ipv6Cidr'
  },
  {
    label: '所属地域',
    prop: 'regionName'
  },
  {
    label: '默认私有网络',
    prop: 'defaultVpc',
    scopedSlots: { customRender: 'defaultVpc' }
  },
  {
    label: '操作',
    width: '360px',
    scopedSlots: { customRender: 'operate' },
    disabled: true
  }
]
export default {
  computed: {
    searchConfigs() {
      return [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorType', initValue: 'AWS' }
      ]
    }
  },
  components: {
    addSubnet,
    addVpc,
    modify,
    modifySubnet,
    editCidr,
    editSubCidr,
    UnsubscribeService
  },
  data() {
    return {
      columns,
      loading: false,
      // 验证
      rules: {
        names: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }
        ]
      },
      dialog: {
        visible: false
      },
      mapDialog: {
        visible: false
      },
      addRow: {},
      settingData: {
        envCode: '',
        networkArea: ''
      },
      childrenSearchData: {},
      mappingData: {
        ipPoolId: '',
        netInfoId: '',
        v6NetInfoId: ''
      },
      envCodeList: [],
      dicList: [],
      // 获取城市
      categoryData: [],
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: '',
        regionId: ''
      },
      regionList: [],
      tableData: [],
      total: 0,
      detailFlag: false,
      detail: {},
      // 新增数据
      title: '',
      addData: {
        dialog: false,
        data: {}
      },
      zoneList: [],
      // 详情
      paramd: {
        page: 1,
        rows: 10
      },
      paramd2: {
        page: 1,
        rows: 10
      },
      portListData: [],
      portListDataTotal: 0,
      childrenData: [],
      childrenDataTotal: 0,
      // 添加子网
      subnetData: {
        dialog: false,
        data: {}
      },
      cidrData: {
        dialog: false,
        data: {}
      },
      subCidrData: {
        dialog: false,
        data: {}
      },
      modifyData: {
        dialog: false,
        data: {}
      },
      modifySubnetData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    modifySubnet(data) {
      this.modifySubnetData = {
        dialog: true,
        data: {
          name: data.name,
          id: data.id,
          vendorId: data.vendorId
        }
      }
    },
    modify(data) {
      this.modifyData = {
        dialog: true,
        data: {
          id: data.id,
          name: data.name,
          vpcId: data.vpcId,
          regionId: data.regionId
        }
      }
    },
    // 添加子网
    addSubnet(data) {
      this.subnetData = {
        dialog: true,
        ipv6Cidr: data.ipv6Cidr,
        ipAry: data.ipAry,
        data: {
          id: data.id,
          vendorId: data.vendorId,
          regionId: data.regionId,
          poolGroupId: data.poolGroupId
        }
      }
    },
    editCidr(row) {
      this.cidrData = {
        dialog: true,
        data: {
          targetId: row.vpcId,
          id: row.id,
          vendorId: row.vendorId
        }
      }
    },
    editSubCidr6(row) {
      this.subCidrData = {
        dialog: true,
        data: {
          targetId: row.subnetUuid,
          id: row.id,
          vendorId: row.vendorId
        }
      }
    },
    getVpcData() {
      this.loading = true
      getVpc(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows.map(item => {
            return {
              ...item,
              ipAry: item.cidr ? JSON.parse(item.cidr) : []
            }
          })
          this.total = data.data.total
        }
      })
    },
    // 配置子网
    subnetSetting(id) {
      this.dialog = {
        visible: true,
        id: id
      }
      this.getEnvs()
      this.getDics()
    },
    getEnvs() {
      getEnvironments({
        simple: true
      }).then(data => {
        if (data.success) {
          this.envCodeList = data.data.rows
        }
      })
    },
    getDics() {
      detailSoftCategory('NETWORK_AREA').then(data => {
        if (data.success) {
          this.dicList = data.data
        }
      })
    },
    // 映射子网
    subnetMapping(id) {
      this.mapDialog = {
        visible: true,
        id: id
      }
    },
    saveSetting() {
      setSubnet(this.dialog.id, {
        id: this.dialog.id,
        params: JSON.stringify({
          labels: this.settingData
        })
      }).then(data => {
        const type = data.success ? 'success' : 'error'
        this.$message({
          type: type,
          message: data.message
        })
        if (data.success) {
          this.$refs.settingForm.resetFields()
          this.dialog = {
            visible: false
          }
          this.getSubnets()
        }
      })
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
          this.getSubnets()
          this.mappingData = { ipPoolId: '', netInfoId: '', v6NetInfoId: '' }
        }
      })
    },
    // 删除子网/端口
    subnetRemove(id, flag) {
      let tip, url
      switch (flag) {
        case 1:
          tip = '您是否确认删除该子网？'
          break
        case 2:
          tip = '您是否确认删除该端口？'
          break
      }
      this.$confirm(tip, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          if (flag === 1) {
            removeSubnet(id).then(data => {
              if (data.success) {
                this.$message.success({
                  message: data.message,
                  type: 'success'
                })
                this.getSubnets()
              }
            })
          } else {
            removePort(id).then(data => {
              if (data.success) {
                this.$message.success({
                  message: data.message,
                  type: 'success'
                })
                this.getPortList()
              }
            })
          }
        })
        .catch(() => {})
    },
    // 详情开始
    getDetail(row) {
      this.addRow = row
      detailVpc(row.id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.getSubnets()
          // this.getPortList()
          this.detailFlag = true
        }
      })
      this.getZoomData(row)
    },
    getPortList(page) {
      this.paramd2.page = page || this.paramd.page
      this.paramd2.params = JSON.stringify([
        {
          param: {
            networkId: this.detail.id,
            vendorId: this.detail.vendorId
          },
          sign: 'EQ'
        }
      ])
      getPort(this.paramd2).then(data => {
        if (data.success) {
          this.portListData = data.data.rows
          this.portListDataTotal = data.data.total
        }
      })
    },
    handleChildrenSearch() {
      this.getSubnets()
    },
    getSubnets(page) {
      this.paramd.page = page || this.paramd.page
      const params = []
      const param = {
        networkId: this.detail.id,
        vendorId: this.detail.vendorId
      }
      params[0] = {
        param,
        sign: 'EQ'
      }
      const paramLk = {}
      for (const name in this.childrenSearchData) {
        if (this.childrenSearchData && this.childrenSearchData[name] !== '') {
          if (name === 'zone') {
            params[0].param[name] = this.childrenSearchData[name]
          }
          if (name === 'name') {
            paramLk[name] = this.childrenSearchData[name]
            params[1] = {
              param: paramLk,
              sign: 'LK'
            }
          }
        }
      }
      this.paramd.params = JSON.stringify(params)
      getSubnet(this.paramd).then(data => {
        if (data.success) {
          this.childrenData = data.data.rows
          this.childrenDataTotal = data.data.total
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    // 详情操作结束
    // 获取可用区
    getZoomData(row) {
      getZone({
        regionId: row.regionId,
        vendorId: row.vendorId
      }).then(data => {
        if (data.success) {
          this.zoneList = data.data
        }
      })
    },
    // 操作
    handleOperate(command) {
      switch (command.flag / 1) {
        case 1:
          // 删除
          this.$confirm('确定删除吗？', '提示', {
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
                this.getVpcData(command.id)
              }
            })
          })
          break
        case 2:
          // 创建云主机
          this.handleCreatedCloud(command.id)
      }
    }
  }
}
</script>

<style scoped></style>
