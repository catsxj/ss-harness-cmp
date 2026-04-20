<template>
  <div class="wrapper">
    <common-detail v-if="detailFlag" :title="addData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ installDetail.name }}</common-detail-item>
        <common-detail-item label="网段">{{ installDetail.cidr ? JSON.parse(installDetail.cidr).join(',') : '' }}</common-detail-item>
        <!-- <common-detail-item label="IPV6网段">{{ installDetail.ipv6Cidr }}</common-detail-item> -->
        <common-detail-item label="默认专有网络">{{ installDetail.defaultVpc | isTrue }}</common-detail-item>
        <common-detail-item label="描述">{{ installDetail.remark }}</common-detail-item>
      </template>
      <el-tabs v-model="activeTab" @tab-click="changeTab">
        <el-tab-pane label="子网列表" name="second">
          <basic-form :inline="true" v-if="activeTab === 'second'">
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
              <el-button type="ghost" class="el-icon-add" @click="addSubnet(addRow)">添加子网</el-button>
            </basic-form-item>
          </basic-form>
          <basic-table v-if="activeTab === 'second'" :data="childrenData" :params="paramd" :get-list="getSubnet" :total="childrenDataTotal" ref="childrenMultipleTable">
            <el-table-column prop="name" label="名称" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="subnetUuid" label="UUID" show-overflow-tooltip></el-table-column>
            <el-table-column prop="zoneName" label="可用区" show-overflow-tooltip></el-table-column>
            <el-table-column prop="cidr" label="网段" show-overflow-tooltip></el-table-column>
            <!-- <el-table-column prop="ipv6Cidr" label="ipv6网段" show-overflow-tooltip></el-table-column> -->
            <el-table-column prop="resourceGroupName" label="资源组" show-overflow-tooltip></el-table-column>
            <el-table-column prop="labels" label="标签" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="280px">
              <template slot-scope="scope">
                <el-button type="text" @click="modifySubnet(scope.row)"> <i class="el-icon-edit"></i> 编辑 </el-button>
                <!-- <el-button type="text" @click="subnetSetting(scope.row.id)"> <i class="el-icon-setting"></i> 配置 </el-button> -->
                <!-- <el-button type="text" @click="subnetMapping(scope.row.id)"> <i class="el-icon-setting"></i> 映射 </el-button> -->
                <el-button type="text" @click="subnetRemove(scope.row.id, 1)"> <i class="el-icon-delete"></i> 删除 </el-button>
                <!-- <el-button type="text" v-if="addRow.ipv6Cidr !== '' && addRow.ipv6Cidr != null" @click="changeIp(scope.row)">
                  <span v-if="scope.row.ipv6Cidr == null || scope.row.ipv6Cidr === ''">开启IPV6</span>
                  <span v-else>关闭IPV6</span>
                </el-button> -->
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <!-- <el-tab-pane label="网段管理" name="first">
          <mcidr ref="mcidr" v-if="activeTab === 'first'" :add-data="mcidrData" :row-data="addRow" @addmcidr="addmcidr"></mcidr>
        </el-tab-pane> -->
      </el-tabs>
    </common-detail>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceVpcCreate', params: { type: 'ALIYUN' } }" class="m-l-xs">
          <el-button type="primary">订购VPC实例</el-button>
        </router-link>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #cidr="cidr, record">
        <div v-if="cidr">
          <div v-for="ip in JSON.parse(record.cidr)" :key="ip">{{ ip }}</div>
        </div>
      </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #defaultVpc="defaultVpc">
        {{ defaultVpc | isTrue }}
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleOperate({ flag: 2, id: record.id })">编辑 </el-button>
        <div class="action-divider"></div>
        <UnsubscribeService type="vpc" :data="record" @getList="getList"> </UnsubscribeService>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleOperate({ flag: 3, row: record })">添加子网 </el-button>
      </template>
    </AdvanceTable>
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
    <add-subnet :add-data="subnetData" v-if="subnetData.dialog" @goBack="getSubnet"></add-subnet>
    <ipv6 :add-data="ipv6Data" v-if="ipv6Data.dialog" @goBack="getSubnet"></ipv6>
    <modify-subnet :add-data="modifySubnetData" v-if="modifySubnetData.dialog" @back="getSubnet"></modify-subnet>
    <addmcidr :add-data="addmcidrData" v-if="addmcidrData.dialog" @mcidrback="mcidrBack"></addmcidr>
    <setsubnet :add-data="setsubnetData" v-if="setsubnetData.dialog" @back="getSubnet"></setsubnet>
    <el-dialog :title="title" :close-on-click-modal="false" v-if="addFlag" :visible.sync="addFlag">
      <basic-form :model="addData" ref="addData" label-width="120px">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required,aliVpcName">
              <el-input v-model="addData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="描述：" prop="remark">
              <div slot="label">
                描述：
                <el-tooltip popper-class="sssa" content="描述可以为空，或输入2~256个中英文字符，不能以http://和https://开头" placement="right">
                  <el-button type="text"><i class="el-icon-question"></i></el-button>
                </el-tooltip>
              </div>
              <el-input type="textarea" v-model="addData.remark" :maxlength="256"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addFlag = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading1">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { booleanFilter } from 'filters/common'
import addSubnet from './dialog/addSubnet.vue'
import ipv6 from './dialog/ipv6.vue'
import modifySubnet from './dialog/modifySubnet.vue'
import addmcidr from './dialog/addmcidr.vue'
import { openstackServer, vmStatusColor } from 'filters'
import { removeSubnet, getSubnet, getVpc, createVpc, modifyVpc, removeVpc, detailVpc, getZone, operationSubIpvs, mapSubnet } from 'services/platform/index'
import { getResource } from 'services/platform/azure.js'
import setsubnet from './dialog/setsubnet.vue'
import UnsubscribeService from '@/components/UnsubscribeService.vue'

const columns = [
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
    label: '网段',
    prop: 'cidr',
    scopedSlots: { customRender: 'cidr' }
  },
  // {
  //   label: 'ipv6网段',
  //   prop: 'ipv6Cidr'
  // },
  {
    label: '默认专有网络',
    prop: 'defaultVpc',
    scopedSlots: { customRender: 'defaultVpc' }
  },
  {
    label: '所属地域',
    prop: 'regionName'
  },
  {
    label: '资源组',
    prop: 'resourceGroupName'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  computed: {
    searchConfigs() {
      return [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'UUID', value: 'vpcId' },
        { type: 'Const', value: 'vendorType', initValue: 'ALIYUN' }
      ]
    }
  },
  components: { addSubnet, modifySubnet, addmcidr, setsubnet, ipv6, UnsubscribeService },
  data() {
    return {
      columns,
      loading: false,
      loading1: false,
      categoryData: [],
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: '',
        regionId: '',
        resourceGroupUuid: ''
      },
      activeTab: 'second',
      mcidrData: {
        dialog: false,
        data: {}
      },
      radio: 0,
      addRow: {},
      subnetData: {
        dialog: false,
        data: {}
      },
      tableData: [],
      total: 0,
      detailFlag: false,
      installDetail: {},
      // 新增数据
      title: '',
      addFlag: false,
      addData: {
        regionId: '',
        name: '',
        cidr: '',
        remark: '',
        providedIpv6Cidr: false
      },
      regionList: [],
      childrenData: [],
      zoneList: [],
      childrenDataTotal: 0,
      paramd: {
        page: 1,
        rows: 10
      },
      modifySubnetData: {
        dialog: false,
        data: {}
      },
      addmcidrData: {
        dialog: false,
        data: {}
      },
      setsubnetData: {
        dialog: false,
        data: {}
      },
      ipv6Data: {
        dialog: false,
        data: {}
      },
      subSearchData: {
        name: '',
        zone: '',
        resourceGroupUuid: ''
      },
      mapDialog: {
        visible: false
      },
      mappingData: {
        ipPoolId: '',
        netInfoId: '',
        v6NetInfoId: ''
      }
    }
  },
  methods: {
    getData(val) {
      this.loading = true
      getVpc(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
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
    changeIp(row) {
      if (row.ipv6Cidr == null || row.ipv6Cidr === '') {
        this.ipv6Data = {
          dialog: true,
          id: row.id,
          ipv6Cidr: this.addRow.ipv6Cidr,
          data: {}
        }
      } else {
        this.$confirm('此操作将关闭IPV6, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          operationSubIpvs(row.id, {
            action: 'disassociate',
            params: JSON.stringify({
              id: row.id
            })
          }).then(data => {
            const type = data.success ? 'success' : 'error'
            this.$message[type](data.message)
            if (data.success) {
              this.getSubnet()
            }
          })
        })
      }
    },
    mcidrBack() {
      this.$refs.mcidr.getData()
    },
    changeTab() {
      if (this.activeTab === 'first') {
        this.mcidrData = {
          dialog: true,
          addRow: this.addRow,
          data: {
            vendorId: this.addRow.vendorId,
            targetId: this.addRow.vpcId
          }
        }
      }
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
    addmcidr() {
      this.addmcidrData = {
        dialog: true,
        addRow: this.addRow,
        data: {}
      }
    },
    // 添加子网
    addSubnet(data) {
      this.subnetData = {
        dialog: true,
        row: data,
        ipv6Cidr: data.ipv6Cidr,
        data: {
          id: data.id,
          vendorId: data.vendorId,
          regionId: data.regionId,
          ipV6Enable: false
        }
      }
    },
    modifySubnet(data) {
      this.modifySubnetData = {
        dialog: true,
        data: {
          name: data.name,
          id: data.id,
          vendorId: data.vendorId,
          remark: data.remark
        }
      }
    },
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
    changeRadio() {
      this.addData.cidr = ''
    },
    getDetail(row) {
      this.addRow = row
      this.activeTab = 'second'
      detailVpc(row.id).then(data => {
        if (data.success) {
          this.detailFlag = true
          this.installDetail = data.data
          this.handleSubSearch()
        }
      })
      this.getZoomData(row)
    },
    handleSubSearch() {
      this.paramd.page = 1
      this.paramd.params = this.$tools.handleSearchParam({
        networkId: this.installDetail.id,
        vendorId: this.installDetail.vendorId,
        zone: this.subSearchData.zone,
        resourceGroupUuid: this.subSearchData.resourceGroupUuid,
        'name:lk': this.subSearchData.name,
        'subnetUuid:lk': this.subSearchData.subnetUuid
      })
      this.getSubnet()
    },
    getSubnet() {
      getSubnet(this.paramd).then(data => {
        if (data.success) {
          this.childrenData = data.data.rows
          this.childrenDataTotal = data.data.total
        }
      })
    },
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
                this.getSubnet(1)
              }
            })
          }
        })
        .catch(() => {})
    },
    goBack() {
      this.detailFlag = false
    },
    addSubmit() {
      this.$refs.addData.validate(valid => {
        if (valid) {
          this.loading1 = true
          modifyVpc(this.addData).then(data => {
            this.loading1 = false
            if (data.success) {
              this.$message.success(data.message)
              this.addFlag = false
            }
          })
        } else {
          return false
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
                this.getData()
              }
            })
          })
          break
        case 2:
          this.title = '编辑VPC'
          detailVpc(command.id).then(data => {
            if (data.success) {
              this.addData = {
                ...data.data,
                providedIpv6Cidr: data.data.ipv6Cidr != null
              }
              this.addFlag = true
            }
          })
          break
        case 3:
          this.subnetData = {
            dialog: true,
            row: command.row,
            ipv6Cidr: command.row.ipv6Cidr,
            data: {
              id: command.row.id,
              vendorId: command.row.vendorId,
              regionId: command.row.regionId,
              ipV6Enable: false
            }
          }
          break
      }
    }
  },
  created() {}
}
</script>

<style scoped>
.no-searchBox {
  padding: 10px;
}

.diskDeviceItem {
  width: calc(100% - 80px);
}

.diskDeviceTitle {
  width: 50px;
  text-align: right;
  display: inline-block;
  vertical-align: middle;
}
</style>
<style>
div.sssa {
  max-width: 25% !important;
}
</style>
