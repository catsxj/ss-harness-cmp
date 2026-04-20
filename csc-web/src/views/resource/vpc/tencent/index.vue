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
        <common-detail-item label="CIDR">{{ detail.cidr }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="子网列表" name="second">
          <basic-table :data="childrenData" :params="paramd" :get-list="getDetailHost" :total="childrenDataTotal" ref="childrenMultipleTable">
            <el-table-column prop="name" label="名称"> </el-table-column>
            <el-table-column prop="zoneName" label="可用区"></el-table-column>
            <el-table-column prop="cidr" label="网络地址"></el-table-column>
            <el-table-column prop="gmtCreate" label="创建时间"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" @click="subnetRemove(scope.row.id, 1)"> <i class="el-icon-delete"></i> 删除 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getVpcData" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceVpcCreate', params: { type: 'TENCENT' } }" class="m-r-md">
          <el-button type="primary">订购VPC实例</el-button>
        </router-link>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #defaultVpc="defaultVpc">
        {{ defaultVpc | booleanFilter }}
      </template>
      <template #operate="val, record">
        <UnsubscribeService type="vpc" :data="record" @getList="getList"> </UnsubscribeService>
        <div class="action-divider"></div>
        <el-button type="text" @click="addSubnet(record)"> 添加子网 </el-button>
      </template>
    </AdvanceTable>
    <add-subnet :add-data="subnetData" v-if="subnetData.dialog"></add-subnet>
  </div>
</template>

<script>
import addSubnet from './addSubnet.vue'
import { getPort, removePort, getVpc, createVpc, modifyVpc, removeVpc, detailVpc, getZone, getRegion, getSubnet, removeSubnet } from 'services/platform/index'
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
    label: 'CIDR',
    prop: 'cidr'
  },
  {
    label: '地域',
    prop: 'regionName'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '默认专有网络',
    prop: 'defaultVpc',
    scopedSlots: { customRender: 'defaultVpc' }
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
        { type: 'Const', value: 'vendorType', initValue: 'TENCENT' }
      ]
    }
  },
  components: {
    addSubnet,
    UnsubscribeService
  },
  data() {
    return {
      columns,
      loading: false,
      // 验证
      rules: {
        names: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
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
      tableData: [],
      total: 0,
      detailFlag: false,
      detail: {},
      // 新增数据
      title: '',
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
      }
    }
  },
  methods: {
    // 添加子网
    addSubnet(data) {
      this.subnetData = {
        dialog: true,
        cidr: data.cidr,
        data: {
          id: data.id,
          vendorId: data.vendorId,
          regionId: data.regionId
        }
      }
    },
    getVpcData() {
      this.loading = true
      getVpc(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        regionId: this.searchData.regionId,
        'name:LK': this.searchData.name
      })
      this.getVpcData()
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
                this.getDetailHost()
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
    getDetail(id) {
      detailVpc(id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.getDetailHost()
          // this.getPortList()
          this.detailFlag = true
        }
      })
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
    getDetailHost(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([
        {
          param: {
            networkId: this.detail.id,
            vendorId: this.detail.vendorId
          },
          sign: 'EQ'
        }
      ])
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
                this.handleSearch(command.id)
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
