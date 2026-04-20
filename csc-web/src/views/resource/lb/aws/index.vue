<template>
  <div class="wrapper">
    <common-detail v-if="detailFlag" :title="detail.name" @goBack="back">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="类型">{{ detail.loadBalancerType }}</common-detail-item>
        <common-detail-item label="状态">{{ detail.status }}</common-detail-item>
        <common-detail-item label="模式">{{ detail.scheme }}</common-detail-item>
        <common-detail-item label="VPC ID">{{ detail.vpcUuid }}</common-detail-item>
        <common-detail-item label="所在地域">{{ detail.regionName }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
      </template>
      <el-tabs v-model="activeDetail">
        <el-tab-pane name="listeners" label="侦听器" v-if="activeDetail === 'listeners'">
          <div style="padding: 10px 0">
            <el-button type="ghost" @click="addListenersBtn">
              <i class="el-icon-warning-outline"></i>
              添加侦听器
            </el-button>
          </div>
          <basic-table :data="detailTableData" :params="paramd" :get-list="handleDetailSearch" :total="totald">
            <el-table-column prop="protocol" label="协议" show-overflow-tooltip></el-table-column>
            <el-table-column prop="port" label="端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="sslPolicy" label="安全策略" show-overflow-tooltip></el-table-column>
            <el-table-column prop="certificates" label="证书" show-overflow-tooltip></el-table-column>
            <el-table-column prop="feeType" label="类型" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" class="el-icon-delete" @click="handleDeleteWatch(scope.row.id)"> 删除</el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceLbCreate', params: { type: 'AWS' } }" class="m-l-xs">
          <el-button type="primary">订购负载均衡</el-button>
        </router-link>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #operate="val, record">
        <UnsubscribeService :data="record" @getList="getData" type="lb"> </UnsubscribeService>
      </template>
    </AdvanceTable>
    <!-- 配置弹窗 -->
    <el-dialog title="配置" :close-on-click-modal="false" :visible.sync="settingData.dialog" v-if="settingData.dialog" width="35%">
      <basic-form :model="settingData.data" ref="settingForm">
        <basic-form-item label="所属环境：" prop="envCode" validate="required" required-message="请选择环境">
          <el-select v-model="settingData.data.envCode" placeholder="请选择">
            <el-option v-for="item in envCodeList" :key="item.id" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '：'" prop="appSystemCode" validate="required" :required-message="'请选择' + $store.getters.systemConfig.projectConfigLabel">
          <el-select v-model="settingData.data.appSystemCode">
            <el-option v-for="(item, index) in dicList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="close('settingForm', 'settingData')">取消</el-button>
        <el-button type="primary" @click.native="saveSetting">确定</el-button>
      </div>
    </el-dialog>
    <!-- 添加侦听器弹窗 -->
    <el-dialog title="添加侦听器" :visible.sync="addListenersDialog" width="50%" :close-on-click-modal="false">
      <basic-form :model="listenersData" ref="listenersRef">
        <el-row style="margin-left: -30px">
          <el-col :span="12">
            <basic-form-item prop="tcp_protocol" validate="required" required-message="请选择协议" label="协议：">
              <el-select v-if="loadBalancerType == 'network'" v-model="listenersData.tcp_protocol" @change="changeProtocol">
                <el-option value="TCP" label="TCP"></el-option>
                <el-option value="TCP_UDP" label="TCP_UDP"></el-option>
                <el-option value="UDP" label="UDP"></el-option>
              </el-select>
              <el-select v-else v-model="listenersData.http_protocol" @change="changeProtocol">
                <el-option value="HTTP" label="HTTP"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item prop="port" validate="required" required-message="请填写端口号" label="端口：">
              <el-input v-model="listenersData.port" type="number"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>

        <div class="listen_table">
          <basic-table :data="listenersTableList">
            <el-table-column label="操作" prop="forwardTo">
              <template slot-scope="scope">
                <el-select style="width: 50%" v-model="scope.row.forwardTo" @change="handleForward(scope.row)">
                  <el-option value="forward" label="Forward to..."></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="目标组">
              <template slot-scope="{}">
                <el-select style="width: 50%" v-model="targetVal" @change="changeSelect">
                  <el-option v-for="item in targetTableData" :key="item.id" :value="item.id" :label="item.name"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </div>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addListenersDialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getRegion, getBalance, getListeners, detailSoftCategory, getEnvironments, balanceSetting, detailBalance, deleteBalance, deleteBalanceWatch, getTargetgroups, createListeners } from 'services/platform/aws'
import UnsubscribeService from '@/components/UnsubscribeService.vue'

const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '状态',
    prop: 'status'
  },
  {
    label: 'VPC ID',
    prop: 'vpcUuid'
  },
  {
    label: '所属地域',
    prop: 'regionName'
  },
  {
    label: '类型',
    prop: 'loadBalancerType'
  },
  {
    label: '标签',
    prop: 'labels'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    width: '220px',
    scopedSlots: { customRender: 'operate' },
    disabled: true
  }
]
export default {
  components: { UnsubscribeService },
  data() {
    return {
      columns,
      loading: false,
      detailFlag: false,
      activeDetail: 'listeners',
      tableData: [],
      detailTableData: [],
      regionList: [],
      envCodeList: [],
      dicList: [],
      detail: {},
      searchData: {
        name: '',
        regionId: ''
      },
      settingData: {
        dialog: false,
        data: {
          envCode: '',
          appSystemCode: ''
        }
      },
      setDatas: {},
      activeRow: {},
      params: {
        page: 1,
        rows: 20
      },
      paramd: {
        page: 1,
        rows: 20
      },
      publicParams: {
        page: 1,
        rows: 9999
      },
      total: 0,
      totald: 0,
      addListenersDialog: false,
      listenersData: {
        tcp_protocol: 'TCP',
        port: 80,
        http_protocol: 'HTTP'
      },
      loadBalancerType: '',
      vpcId: '',
      regionId: '',
      targetTableData: [],
      targetVal: '',
      listenersTableList: [{ forwardTo: 'Forward to...' }],
      listenerType: 'forward',
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorType', initValue: 'AWS' }
      ]
    }
  },
  methods: {
    handleDeleteBalance(id) {
      this.$confirm('此操作将永久删除该负载均衡器, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteBalance(id).then(data => {
            if (data.success) {
              this.$message.success({ message: data.message })
              this.getData()
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    handleDeleteWatch(id) {
      this.$confirm('此操作将永久删除该侦听器, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteBalanceWatch(id).then(data => {
            if (data.success) {
              this.$message.success({ message: data.message })
              this.handleDetailSearch()
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    getDics() {
      detailSoftCategory('APP_SYSTEM').then(data => {
        if (data.success) {
          this.dicList = data.data
        }
      })
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
    getDetail(row) {
      this.activeRow = row
      this.loadBalancerType = row.loadBalancerType
      this.vpcId = row.vpcUuid
      this.regionId = row.region
      detailBalance(row.id).then(data => {
        this.detail = data.data
        this.handleDetailSearch()
        this.detailFlag = true
      })
    },
    getData() {
      this.loading = true
      getBalance(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleDetailSearch() {
      this.paramd.params = this.$tools.handleSearchParam({
        lbId: this.activeRow.id,
        regionId: this.activeRow.region
      })
      this.getDetailData()
    },
    getDetailData() {
      getListeners(this.paramd).then(data => {
        if (data.success) {
          this.detailTableData = data.data.rows
          this.totald = data.data.total
        }
      })
    },
    back() {
      this.detailFlag = false
      this.activeRow = null
    },
    setting(row) {
      this.settingData.dialog = true
      this.settingData.id = row.id
      this.getEnvs()
      this.getDics()
    },
    saveSetting() {
      this.$refs.settingForm.validate(valid => {
        if (valid) {
          balanceSetting(this.settingData.id, {
            id: this.settingData.id,
            params: JSON.stringify({
              labels: this.settingData.data
            })
          }).then(data => {
            const type = data.success ? 'success' : 'error'
            this.$message({
              type: type,
              message: data.message
            })
            if (data.success) {
              this.$refs.settingForm.resetFields()
              this.settingData.dialog = false
              this.getData()
            }
          })
        }
      })
    },
    close(form, dialog) {
      this.$refs[form].resetFields()
      this[dialog].dialog = false
    },
    addListenersBtn() {
      this.getTargetData()
    },
    changeProtocol() {
      switch (this.listenersData.tcp_protocol) {
        case 'TCP':
          this.listenersData.port = 80
          break
        case 'HTTP':
          this.listenersData.port = 80
          break
        case 'TCP_UDP':
          this.listenersData.port = 53
          break
        case 'UDP':
          this.listenersData.port = 53
      }
      this.getTargetData()
    },
    handleForward(row) {
      this.listenerType = row.forwardTo
    },
    getTargetData() {
      const targetGroupsParams = JSON.parse(JSON.stringify(this.publicParams))
      if (this.loadBalancerType == 'application') {
        targetGroupsParams.params = JSON.stringify([
          {
            param: {
              vendorId: this.vendorId,
              loadBalancerUuids: '[]',
              vpcUuid: this.vpcId,
              regionId: this.regionId
            },
            sign: 'EQ'
          },
          {
            param: {
              protocol: '"HTTP"'
            },
            sign: 'IN'
          }
        ])
      } else {
        let protocol = ''
        if (this.listenersData.tcp_protocol == 'TCP') {
          protocol = '"TCP","TCP_UDP"'
        } else if (this.listenersData.tcp_protocol == 'UDP') {
          protocol = '"UDP","TCP_UDP"'
        } else {
          protocol = '"TCP_UDP"'
        }
        targetGroupsParams.params = JSON.stringify([
          {
            param: {
              vendorId: this.vendorId,
              loadBalancerUuids: '[]',
              vpcUuid: this.vpcId,
              regionId: this.regionId
            },
            sign: 'EQ'
          },
          {
            param: {
              protocol
            },
            sign: 'IN'
          }
        ])
      }
      getTargetgroups(targetGroupsParams).then(data => {
        if (data.success) {
          this.targetTableData = data.data.rows
          if (this.targetTableData.length) {
            this.targetVal = this.targetTableData[0].id
          } else {
            this.targetVal = ''
          }
          this.total = data.data.total
          this.addListenersDialog = true
        }
      })
    },
    ok() {
      for (let i = 0; i < this.detailTableData.length; i++) {
        if (this.listenersData.port == this.detailTableData[i].port) {
          return this.$message.error('端口号已存在')
        }
      }
      const params = JSON.stringify({
        listener: {
          lbId: this.activeRow.id,
          protocol: this.loadBalancerType == 'application' ? this.listenersData.http_protocol : this.listenersData.tcp_protocol,
          port: this.listenersData.port,
          defaultActions: [
            {
              tgId: this.targetVal,
              type: this.listenerType
            }
          ]
        }
      })
      createListeners(params).then(res => {
        if (res.success) {
          this.$refs.listenersRef.resetFields()
          this.addListenersDialog = false
          this.getDetailData()
        }
      })
    }
  }
}
</script>
<style lang="scss">
.listen_table {
  .cell:nth-child(1) {
    padding-left: 24px;
    .el-select {
      margin-left: -12px;
    }
  }
}
</style>
