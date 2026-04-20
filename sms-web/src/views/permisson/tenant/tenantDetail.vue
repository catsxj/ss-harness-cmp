<template>
  <div class="detail">
    <common-detail class="common" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="账号">{{ detailData.account }}</common-detail-item>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="状态">{{ generalStatusFilter(detailData.status) }}</common-detail-item>
        <common-detail-item label="开启流程自管">{{ detailData.openFlow ? '是' : '否' }}</common-detail-item>
        <common-detail-item label="开启软件安装">{{ detailData.isInstallSoftware ? '是' : '否' }}</common-detail-item>
        <common-detail-item label="付费模式">
          <span v-if="Array.isArray(detailData.paymentMode)">{{ detailData.paymentMode.map((item) => paymentModeFilter(item)).join('，') }}</span>
          <span v-else>--</span>
        </common-detail-item>
        <common-detail-item label="所属组织">{{ detailData.departmentName }}</common-detail-item>
        <common-detail-item label="集团编码">{{ detailData.groupCode }}</common-detail-item>
        <common-detail-item label="联系人姓名">{{ detailData.contactName }}</common-detail-item>
        <common-detail-item label="联系人电话">{{ detailData.contactPhone }}</common-detail-item>
        <common-detail-item label="联系人邮箱">{{ detailData.contactEmail }}</common-detail-item>
        <common-detail-item label="折扣系数">{{ detailData.discount }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <common-detail-item label="描述">{{ detailData.remark }}</common-detail-item>
      </template>
      <el-tabs :value="currentValue" @tab-click="handleDetailTab">
        <el-tab-pane name="quota" v-if="detailData.quotaAble">
          <span slot="label">资源使用情况 </span>
          <el-row :gutter="10">
            <empty v-if="chartsList.length === 0"> </empty>
            <el-col :span="8" v-for="item in chartsList" :key="item.name">
              <el-card class="box-card m-t-sm">
                <div slot="header" class="clearfix">
                  <span>{{ item.name }}：</span>
                </div>
                <pie-charts :theme="item.name" height="200px" width="100%" :data="item.data" :id="item.name" :unit="item.unit"></pie-charts>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane name="user">
          <span slot="label">用户列表 </span>
          <AdvanceTable :card-border="false" title="用户列表" :search-configs="userSearchConfigs" :data="userList" :params="params" :columns="userColumns" :get-list="getTenantUser" :total="userTotal" :loading="loading">
            <template v-slot:action>
              <el-button @click="handleUserConfig()" icon="el-icon-setting">用户管理</el-button>
              <ImportData url="/api/sms/v1/users/import" @getData="getTenantUser" template-url="/sms/v1/users/import/template" :params="{ tenantId: detailData.id }"></ImportData>
            </template>
            <template #status="status">
              <status-icon :type="generalStatusFilter(status, 'color')">
                {{ generalStatusFilter(status, 'status') }}
              </status-icon>
            </template>
            <template #operate="val, record">
              <el-button type="text" @click="removeUser(record.id)" icon="el-icon-delete">移除</el-button>
            </template>
          </AdvanceTable>
        </el-tab-pane>
        <el-tab-pane name="service">
          <span slot="label"> 服务列表 </span>
          <AdvanceTable :card-border="false" title="服务列表" :data="serviceList" :columns="serverColumns" :loading="loading" :showTools="false">
            <div slot="pagination"></div>
          </AdvanceTable>
        </el-tab-pane>
        <el-tab-pane label="登录记录" name="login">
          <AdvanceTable :card-border="false" :show-tools="false" :data="loginList" :params="loginParams" :columns="loginColumns" :get-list="getLogin" :total="loginTotal" :loading="loading"> </AdvanceTable>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <Transfer :key="1" @transferSubmit="transferSubmit" v-if="userConfig.visible" :config="userConfig"></Transfer>
  </div>
</template>

<script>
import { getTenantInfo, getQuotaTenant, getTenantService, getTenantBus, getTrack, getUser, tenantRemoveUser, getTenantUserTrans, tenantCongigUser } from 'services/system/tenant'
import { getPool } from 'services/platform/pool'
import Transfer from './components/transfer.vue'
import ImportData from '@/common/components/import-data/index.vue'
import { generalStatusFilter, paymentModeFilter } from '@/filters/common'

export default {
  components: {
    Transfer,
    ImportData
  },
  props: {
    config: {
      type: Object
    }
  },
  data() {
    return {
      generalStatusFilter,
      paymentModeFilter,
      loading: false,
      chartsList: {},
      detailData: {},
      params: {
        page: 1,
        rows: 10
      },
      userParams: {
        page: 1,
        rows: 9999
      },
      userList: [],
      userTotal: 0,
      serviceList: [],
      poolList: [],
      businessList: [],
      // 登陆日志
      loginList: [],
      loginParams: {
        page: 1,
        rows: 10
      },
      loginTotal: 0,
      userColumns: [
        { label: '登录账号', prop: 'account' },
        { label: '用户姓名', prop: 'name' },
        { label: '邮箱', prop: 'email' },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '操作',
          disabled: true,
          width: '220px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      serverColumns: [
        {
          label: '服务名称',
          prop: 'name'
        },
        {
          label: '服务描述',
          prop: 'remark'
        }
      ],
      loginColumns: [
        { label: '登录账号', prop: 'account' },
        { label: '登录IP', prop: 'requestIp' },
        { label: '响应地址', prop: 'responseIp' },
        {
          label: '登录结果',
          prop: 'detail'
        },
        { label: '登录时间', prop: 'gmtCreate' }
      ],
      adminColumns: [
        { label: '登录账号', prop: 'account' },
        { label: '用户姓名', prop: 'name' },
        { label: '邮箱', prop: 'email' },
        { label: '联系方式', prop: 'mobile' }
      ],
      columns: [
        {
          text: '租户名称',
          dataIndex: 'name'
        },
        {
          text: '管理邮箱',
          dataIndex: 'email'
        },
        {
          text: '创建时间',
          dataIndex: 'gmtCreate'
        },
        {
          text: '描述',
          dataIndex: 'remark'
        }
      ],
      dataSource: [],
      // 重置密码
      resetDialogVisible: false,
      resetData: {},
      userConfig: {
        visible: false,
        value: [],
        data: []
      },
      userSearchConfigs: [{ type: 'Const', value: 'tenantId', initValue: '' }]
    }
  },
  computed: {
    currentValue() {
      return this.detailData.quotaAble ? 'quota' : 'user'
    },
    pwdRule() {
      return this.$store.state.app.systemConfig.pwdStrength
    }
  },
  created() {
    this.getTenantInfo()
    this.userSearchConfigs[0].initValue = this.config.id
  },
  methods: {
    async transferSubmit(value) {
      const params = {
        id: this.config.id,
        ids: value
      }
      tenantCongigUser(params).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.getTenantUser()
        }
      })
    },
    async handleUserConfig() {
      this.userConfig.id = this.config.id
      this.userConfig.visible = true
    },
    // 导入
    handleImport() {},
    removeUser(id) {
      this.$confirm('您确定要移除该用户吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        tenantRemoveUser(id).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.getTenantUser()
          }
        })
      })
    },
    type(value) {
      const obj = {
        category: '单位类型',
        topOrganization: '单位',
        department: '部门'
      }
      return obj[value]
    },
    goBack() {
      this.config.visible = false
    },
    handleDetailTab(tab) {
      switch (tab.name) {
        case 'quota':
          this.getQuotaTenant()
          break
        case 'user':
          this.params.page = 1
          this.getTenantUser()
          break
        case 'login':
          this.loginParams.page = 1
          this.getLogin()
          break
        case 'service':
          this.getTenantService()
          break
        case 'pool':
          this.getTenantPool()
          break
        case 'business':
          this.getTenantBusiness()
          break
      }
    },
    getTenantInfo() {
      getTenantInfo(this.config.id).then((data) => {
        if (data.success) {
          this.detailData = data.data
          this.detailData.isInstallSoftware = !!this.detailData.isInstallSoftware
          this.detailData.paymentMode = JSON.parse(this.detailData.paymentMode || '["Hour","Month"]')
          if (this.detailData.quotaAble) {
            this.getQuotaTenant()
          }
        }
      })
    },
    getLogin() {
      this.loading = true
      this.loginParams.params = JSON.stringify([{ param: { account: this.detailData.account }, sign: 'EQ' }])
      getTrack(this.loginParams)
        .then((data) => {
          if (data.success) {
            this.loginList = data.data.rows
            this.loginTotal = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getQuotaTenant() {
      const params = {
        type: 'ringDiagram'
      }
      getQuotaTenant(this.config.id, params).then((data) => {
        if (data.success) {
          this.chartsList = data.data
        }
      })
    },
    getTenantUser() {
      this.loading = true
      getUser(this.params)
        .then((data) => {
          if (data.success) {
            this.userList = data.data.rows
            this.userTotal = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getTenantService() {
      this.loading = true
      getTenantService(this.config.id)
        .then((data) => {
          if (data.success) {
            this.serviceList = data.data
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getTenantPool() {
      getPool({
        condition: 'listByTenantId',
        tenantId: this.config.id
      }).then((data) => {
        if (data.success) {
          this.poolList = data.data
        }
      })
    },
    getTenantBusiness() {
      getTenantBus(this.config.id).then((data) => {
        if (data.success) {
          this.businessList = data.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.common-detail {
  bottom: 0;
}
</style>
