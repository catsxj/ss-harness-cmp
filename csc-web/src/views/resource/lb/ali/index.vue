<template>
  <div class="wrapper">
    <common-detail v-if="detailFlag" :title="detail.name" @goBack="back">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="类型">{{ detail.loadBalancerType }}</common-detail-item>
        <common-detail-item label="状态">{{ detail.status | aliStatus }}</common-detail-item>
        <common-detail-item label="模式">{{ detail.scheme }}</common-detail-item>
        <common-detail-item label="VPC ID">{{ detail.vpcUuid }}</common-detail-item>
        <common-detail-item label="所在地域">{{ detail.regionName }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
      </template>
      <el-tabs v-model="activeDetail">
        <el-tab-pane name="listeners" label="侦听器">
          <listen v-if="activeDetail === 'listeners'" :listen-data="activeRow" @add="createListen" @edit="editListen" @getListenerDetail="getListenerDetail"></listen>
        </el-tab-pane>
        <el-tab-pane name="vs" label="虚拟服务器组">
          <vs :active-row="activeRow" v-if="activeDetail === 'vs'"></vs>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable title="" ref="advanceTable" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceLbCreate', params: { type: 'ALIYUN' } }" class="m-l-xs">
          <el-button type="primary">订购负载均衡</el-button>
        </router-link>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="status">
        {{ status | aliStatus }}
      </template>
      <template #scheme="scheme">
        <span v-if="scheme === 'internet'">公网</span>
        <span v-if="scheme === 'intranet'">私网</span>
      </template>
      <template #defaultVpc="defaultVpc">
        {{ defaultVpc | isTrue }}
      </template>
      <template #operate="val, record">
        <!-- <el-button type="text" @click="edit(record)"><i class="el-icon-edit"></i> 编辑</el-button>
        <div class="action-divider"></div> -->
        <UnsubscribeService :data="record" :showDivider="false" @getList="getData" type="lb" :disabled="record.deleteProtection === 'on'"> </UnsubscribeService>
        <div class="action-divider"></div>
        <el-dropdown @command="handleOperate" trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <!-- <el-dropdown-item :command="{ flag: 1, row: record }"> 配置</el-dropdown-item> -->
            <!-- <el-dropdown-item :command="{ flag: 2, row: record }"> 配置修改保护</el-dropdown-item> -->
            <el-dropdown-item :command="{ flag: 3, row: record }" v-if="record.deleteProtection === 'off'"> 开启删除保护</el-dropdown-item>
            <el-dropdown-item :command="{ flag: 4, row: record }" v-if="record.deleteProtection === 'on'"> 关闭删除保护</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
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
    <add v-if="addData.dialog" :add-data="addData"></add>
    <editProtect v-if="editProtectData.dialog" :add-data="editProtectData" @back="getData"></editProtect>
    <add-listen v-if="addListenData.dialog" :add-data="addListenData"></add-listen>
    <listener-detail :data="readListenerData" v-if="readListenerData.dialog"></listener-detail>
  </div>
</template>
<script>
import { getRegion, getBalance, getListeners, detailSoftCategory, getEnvironments, balanceSetting, detailBalance, deleteBalance, deleteBalanceWatch, modifyLb } from 'services/platform/index'
import add from './add.vue'
import editProtect from './editProtect.vue'
import listen from './listen.vue'
import addListen from './addListen.vue'
import vs from './vs/index.vue'
import ListenerDetail from './listenerDetail.vue'
import UnsubscribeService from '@/components/UnsubscribeService.vue'

const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '地址',
    prop: 'vipAddress'
  },
  {
    label: '类型',
    prop: 'scheme',
    scopedSlots: { customRender: 'scheme' }
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
  components: { add, editProtect, listen, addListen, vs, ListenerDetail, UnsubscribeService },
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorType', initValue: 'ALIYUN' }
      ],
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
      total: 0,
      totald: 0,
      addData: {
        dialog: false,
        data: {}
      },
      editProtectData: {
        dialog: false,
        data: {}
      },
      addListenData: {
        dialog: false,
        data: {}
      },
      readListenerData: {
        dialog: false,
        data: {}
      }
    }
  },
  created() {
    // this.getRegion()
    if (this.$route.params.source && this.$route.params.source === 'vs') {
      const row = JSON.parse(sessionStorage.getItem('lbRow'))
      this.getDetail(row)
      this.activeDetail = this.$route.params.source
    }
  },
  mounted() {},
  methods: {
    getListenerDetail(row) {
      this.readListenerData = {
        dialog: true,
        id: row.id
      }
    },
    createListen() {
      this.addListenData = {
        dialog: true,
        title: '添加监听配置',
        name: 'add',
        vendorId: this.activeRow.vendorId,
        regionId: this.activeRow.region,
        lbId: this.activeRow.id,
        data: this.activeRow
      }
    },
    editListen(row) {
      this.addListenData = {
        dialog: true,
        title: '修改监听配置',
        name: 'edit',
        vendorId: this.activeRow.vendorId,
        regionId: this.activeRow.region,
        lbId: this.activeRow.id,
        id: row.id,
        data: {
          ...JSON.parse(row.certificates),
          poolId: row.poolId
        }
        // datas: row.configuration,
      }
    },
    handleOperate(command) {
      switch (command.flag) {
        case 1:
          this.setting(command.row)
          break
        case 2:
          this.editProtectData = {
            dialog: true,
            id: command.row.id,
            data: {
              modificationProtection: command.row.modificationProtection
            }
          }
          break
        case 3:
          // 开启删除保护
          this.$confirm('此操作将开启删除保护, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              modifyLb({
                id: command.row.id,
                action: 'deleteProtection',
                balancer: {
                  deleteProtection: 'on'
                }
              }).then(data => {
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
          break
        case 4:
          // 关闭删除保护
          this.$confirm('此操作将关闭删除保护, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              modifyLb({
                id: command.row.id,
                action: 'deleteProtection',
                balancer: {
                  deleteProtection: 'off'
                }
              }).then(data => {
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
          break
      }
    },
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
    edit(row) {
      this.addData = {
        dialog: true,
        title: '编辑',
        name: 'edit',
        vendorId: row.vendorId,
        data: row
      }
    },
    // 获取域
    getRegion() {
      getRegion({}).then(data => {
        if (data.success) {
          this.searchConfigs[1].data = data.data
        }
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
      detailBalance(row.id).then(data => {
        this.detail = data.data
        this.handleDetailSearch()
        this.detailFlag = true
        sessionStorage.setItem('lbRow', JSON.stringify(row))
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
      delete this.$route.params.source
      this.activeDetail = 'listeners'
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
              this.handleSearch()
            }
          })
        }
      })
    },
    close(form, dialog) {
      this.$refs[form].resetFields()
      this[dialog].dialog = false
    }
  }
}
</script>
