<template>
  <div>
    <AdvanceTable title="租户列表" :search-configs="searchConfigs" :data="listData" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @selection-change="selectionChange">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()" slot="operate" icon="el-icon-plus">新增</el-button>
        <ImportData url="/api/sms/v1/tenants/import" @getData="getList" template-url="/sms/v1/tenants/import/template"></ImportData>
        <el-button slot="operate" icon="el-icon-download" @click="exportData">导出</el-button>
        <el-button slot="operate" icon="el-icon-lock" @click="handleLock('lock')" :disabled="!tenantIds.length">批量冻结</el-button>
        <el-button slot="operate" icon="el-icon-unlock" @click="handleLock('active')" :disabled="!tenantIds.length">批量解冻</el-button>
        <el-button slot="operate" icon="el-icon-delete" @click="handleLock('remove')" :disabled="!tenantIds.length">批量删除</el-button>
      </template>
      <template #account="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="generalStatusFilter(status, 'color')">
          {{ generalStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #openFlow="val">
        {{ val | booleanFilter }}
      </template>
      <template #isInstallSoftware="val">
        {{ val | booleanFilter }}
      </template>
      <template #paymentMode="val">
        <span v-if="Array.isArray(val)">{{ val.map((item) => paymentModeFilter(item)).join('，') }}</span>
        <span v-else>--</span>
      </template>

      <template #operate="val, record">
        <el-button type="text" @click="handleCreate('edit', record)" icon="el-icon-edit">编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleRemove(record.id)" :disabled="record.status !== 'LOGOUT'" icon="el-icon-delete">删除</el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            更多
            <svg-icon iconName="el-icon-arrow-down" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="assignPool(record)"> 资源分配 </el-dropdown-item>
            <el-dropdown-item @click.native="handleService(record)"> 服务授权 </el-dropdown-item>
            <el-dropdown-item @click.native="handlePermission(record)"> 权限设置 </el-dropdown-item>
            <el-dropdown-item @click.native="handleReset(record.id)"> 密码重置 </el-dropdown-item>
            <el-dropdown-item @click.native="handleUserConfig(record)"> 用户管理 </el-dropdown-item>
            <el-dropdown-item @click.native="handleRecharge(record)"> 账户授权 </el-dropdown-item>
            <el-dropdown-item v-if="record.status === 'NORMAL'" @click.native="handleOperate(record.id, 'lock')"> 账户冻结 </el-dropdown-item>
            <el-dropdown-item v-if="record.status === 'ABNORMAL'" @click.native="handleOperate(record.id, 'active')"> 账户解冻 </el-dropdown-item>
            <el-dropdown-item v-if="record.status !== 'LOGOUT'" @click.native="handleOperate(record.id, 'logout')"> 账户注销 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <!--详情界面-->
    <TenantDetail v-if="detailComponent.visible" :config="detailComponent"></TenantDetail>
    <AddDialog :dialog="addDialog" v-if="addDialog.visible" @getData="getList" @clearAddDialog="clearAddDialog">
      <template v-slot:first>
        <BasicInfo ref="basicInfo" />
      </template>
      <template v-slot:second>
        <Quota catalog="TENANT" ref="quota" />
      </template>
      <template v-slot:third>
        <service-item ref="service" />
      </template>
    </AddDialog>
    <!--新增编辑-->
    <el-dialog title="编辑租户" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible">
      <BasicInfo :info-data="addData" ref="basicInfo"></BasicInfo>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <!--重置密码-->
    <el-dialog title="重置密码" :visible.sync="resetDialogVisible" width="35%">
      <basic-form :model="resetData" ref="resetForm">
        <el-row>
          <el-col :span="24">
            <basic-form-item label="登录密码：" prop="password" :validate="pwdRule">
              <el-input v-model="resetData.password" auto-complete="off" show-password></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="resetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="resetSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <!--服务界面-->
    <ServiceDialog v-if="serviceDialog.visible" :dialog="serviceDialog" @serviceSuccess="getList"></ServiceDialog>
    <!--权限设置-->
    <PermissionDialog v-if="permissionDialog.visible" :dialog="permissionDialog" @success="getList"></PermissionDialog>
    <assignPool :add-data="assignPoolData" v-if="assignPoolData.dialog"></assignPool>
    <!--授信账户-->
    <el-dialog title="授信账户" :visible.sync="rechargeDialogVisible" width="600px">
      <basic-form label-width="150px">
        <el-row>
          <el-col :span="12">
            <basic-form-item label="信用额度：">
              <span>{{ rechargeData.accountTotal }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="已用额度：">
              <span>{{ rechargeData.accountUsed }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="已分配：">
              <span>{{ rechargeData.accountAllocated }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="可用额度：">
              <span>{{ rechargeData.balanceFree }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="账户余额：">
              <span>{{ rechargeData.balance }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="是否超支：">
              <el-switch v-model="rechargeData.overdraft" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="授信额度(元)：">
              <el-input-number :min="rechargeData.minBalance" :max="rechargeData.maxBalance" v-model="rechargeData.accountTotal"></el-input-number>
              <span class="tip m-l">最小值为：{{ rechargeData.minBalance }},最大值为：{{ rechargeData.maxBalance }}</span>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="rechargeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="rechargeSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="API授权" :close-on-click-modal="false" v-if="apiGrantVisible" :visible.sync="apiGrantVisible" width="70%">
      <basic-form>
        <el-select v-model="apiGrantData.module" placeholder="请选择服务" :loading="loading" @change="changeModule">
          <el-option v-for="item in modulesData" :key="item.value" :label="item.name" :value="item.value"> </el-option>
        </el-select>
        <el-row class="m-t" :gutter="10" v-loading="loading">
          <el-col :span="12">
            <el-checkbox v-model="apiGrantData.selectAll" @change="selectAll">全选</el-checkbox>
            <el-tree ref="apitree" :expand-on-click-node="false" :data="modulesList" node-key="pattern" :props="{ label: 'label', children: 'value' }" show-checkbox @check-change="changeCheckApi">
              <span slot-scope="{ node }">
                <span :class="node.label.indexOf(':') > -1 ? 'custom-tree-node' : ''">{{ node.label.split(':')[0] }}</span
                ><span>: {{ node.label.split(':')[1] }}</span>
              </span>
            </el-tree>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="apiGrantVisible = false">取消</el-button>
        <el-button type="primary" @click.native="apiGrantSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <!--用户管理-->
    <Transfer :key="2" ref="transfer" @success="getList" v-if="userConfig.visible" :config="userConfig"></Transfer>
  </div>
</template>
<script>
import crypto from 'utils/crypto'
import TenantDetail from './tenantDetail.vue'
import ServiceDialog from './ServiceDialog.vue'
import PermissionDialog from './permissionDialog.vue'
import AddDialog from './AddDialog.vue'
import BasicInfo from './components/basicInfo.vue'
import Quota from './components/quota.vue'
import ServiceItem from './components/ServiceItem.vue'
import assignPool from './assignPool.vue'
import { getTenant, modifyTenant, removeTenant, tenantCongigUser, operateTenant, exportTenantList, lockTenant, resetTenantPsw, getTenantAccount, createTenantAccount, getApiById, updateApi, getTenantUserTrans } from 'services/system/tenant'
import { getModules, getModulesByName } from 'services/system/role'
import { columns, searchConfigs } from './config'
import Transfer from './components/transfer.vue'
import ImportData from '@/common/components/import-data/index.vue'
import { generalStatusFilter, booleanFilter, paymentModeFilter } from '@/filters/common'

export default {
  components: {
    TenantDetail,
    ServiceDialog,
    PermissionDialog,
    AddDialog,
    BasicInfo,
    assignPool,
    Quota,
    ServiceItem,
    Transfer,
    ImportData
  },
  filters: {
    booleanFilter
  },
  data() {
    return {
      generalStatusFilter,
      searchConfigs,
      columns,
      listData: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      addDialogVisible: false,
      detailComponent: {},
      loading: false,
      dialogStatus: '',
      textMap: {
        update: '编辑租户',
        create: '新增租户'
      },
      userConfig: {
        visible: false,
        id: ''
      },
      addData: {},
      quotaDialog: {},
      serviceDialog: {},
      businessDialog: {},
      poolDialog: {},
      addDialog: {
        visible: false,
        parentId: 0,
        title: '快速导航',
        des: '您可以通过本向导轻松新增租户进行管理',
        leftStepList: ['基本信息', '资源分配', '服务授权'],
        rightContent: [
          { title: '基本信息', ref: 'basicInfo' },
          { title: '资源分配', ref: 'quota' },
          { title: '服务授权', ref: 'service' }
        ]
      },
      // 重置密码
      resetDialogVisible: false,
      resetData: {},
      assignPoolData: {
        dialog: false,
        data: {}
      },
      // 充值
      rechargeDialogVisible: false,
      rechargeData: {
        accountTotal: 0,
        accountUsed: 0
      },
      apiGrantVisible: false,
      apiGrantData: {
        apis: []
      },
      modulesData: [], // 服务列表
      modulesList: [], // 服务下api列表
      apisById: [], // 当前角色已授权api,
      permissionDialog: {
        visible: false,
        record: {}
      },
      tenantIds: []
    }
  },
  computed: {
    pwdRule() {
      return this.$store.state.app.systemConfig.pwdStrength
    },
    ids() {
      return this.tenantIds.join(',')
    }
  },

  methods: {
    paymentModeFilter,
    exportData() {
      const params = JSON.parse(this.params.params)
      params.push(
        ...JSON.parse(
          this.$tools.handleSearchParam({
            'id:IN': this.ids
          })
        )
      )
      exportTenantList({ params: JSON.stringify(params) })
    },
    selectionChange(val) {
      this.tenantIds = val.map((item) => item.id)
    },
    // 冻结
    handleLock(action) {
      let title = ''
      switch (action) {
        case 'lock':
          title = '冻结'
          break
        case 'active':
          title = '解冻'
          break
        case 'remove':
          title = '删除'
          break
      }
      this.$confirm(`您确定要${title}所选租户吗？`, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        lockTenant({ ids: this.tenantIds, action: action }).then((data) => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    async handleUserConfig(record) {
      this.userConfig.id = record.id
      this.userConfig.visible = true
    },
    clearAddDialog() {
      this.addDialog.visible = false
    },
    type(value) {
      const obj = {
        category: '单位类型',
        topOrganization: '单位',
        department: '部门'
      }
      return obj[value]
    },
    assignPool(data) {
      this.assignPoolData = {
        dialog: true,
        data: {
          id: data.id
        }
      }
    },
    assgin() {
      this.$router.push({ name: 'assignCoupons' })
    },
    handleRemove(id) {
      this.$confirm('您确定要删除该租户吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeTenant(id).then((data) => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    getList() {
      this.loading = true
      getTenant(this.params)
        .then((data) => {
          if (data.success) {
            this.listData = data.data.rows.map((item) => {
              item.openFlow = !!item.openFlow
              item.isInstallSoftware = !!item.isInstallSoftware
              item.paymentMode = JSON.parse(item.paymentMode || '["Hour","Month"]')
              return item
            })
            this.total = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSortChange({ prop, order }) {
      if (order) {
        this.params.sorter = JSON.stringify({
          [prop]: order === 'ascending' ? '0' : '1'
        })
      } else {
        delete this.params.sorter
      }
      this.getList()
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleCreate(type, data) {
      if (type === 'edit') {
        console.log(data)
        this.addData = Object.assign({}, data)
        this.dialogStatus = 'update'
        this.addDialogVisible = true
      } else {
        this.addDialog.visible = true
      }
    },
    async addSubmit() {
      const data = await this.$refs.basicInfo.getPostData()
      if (data) {
        this.loading = true
        modifyTenant(data)
          .then((data) => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              this.addDialogVisible = false
              this.getList()
            }
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    handleService(record) {
      this.serviceDialog = {
        id: record.id,
        quotaAble: record.quotaAble,
        visible: true
      }
    },
    handlePermission(record) {
      this.permissionDialog = {
        record: { ...record },
        visible: true
      }
    },
    getDetail(id) {
      this.detailComponent = {
        id: id,
        visible: true
      }
    },
    // 重置密码
    handleReset(id) {
      this.resetDialogVisible = true
      this.resetData = { id }
    },
    resetSubmit() {
      this.$refs.resetForm.validate((valid) => {
        if (valid) {
          const { id, password } = this.resetData
          this.loading = true
          resetTenantPsw(id, { password: crypto.encrypt(password) })
            .then((data) => {
              if (data.success) {
                this.resetDialogVisible = false
                this.$message({
                  message: data.message,
                  type: 'success'
                })
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    handleOperate(id, action, record) {
      let tip
      switch (action) {
        case 'lock':
          tip = '是否冻结该租户？'
          break
        case 'active':
          tip = '是否解冻该租户？'
          break
        case 'logout':
          tip = '是否注销该租户？'
          break
      }
      this.$confirm(tip, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          operateTenant(id, action).then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    // 授信
    async handleRecharge(row) {
      const data = await getTenantAccount(row.id)
      if (data.success) {
        this.rechargeData = data.data
        this.rechargeDialogVisible = true
      }
    },
    rechargeSubmit() {
      if (this.rechargeData.accountTotal !== 0 && !this.rechargeData.accountTotal) return this.$message.error('授信额度不能为空')
      this.loading = true
      createTenantAccount(this.rechargeData)
        .then((data) => {
          if (data.success) {
            this.rechargeDialogVisible = false
            this.$message({
              message: data.message,
              type: 'success'
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 切换树形
    goTree() {
      this.$emit('goTree')
    },
    async getModules() {
      this.loading = true
      const data = await getModules()
      if (data.success) {
        this.loading = false
        this.modulesData = data.data
        if (this.modulesData.length) {
          this.$set(this.apiGrantData, 'module', this.modulesData[0].value)
          this.changeModule(this.apiGrantData.module)
        }
      }
    },
    async changeModule(value) {
      this.modulesList = []
      this.apiGrantData.selectAll = false
      this.apiGrantData.apis = []
      this.loading = true
      const data = await getApiById(this.apiGrantData.id, { module: value })
      if (data.success) {
        this.apisById = data.data
      }
      getModulesByName(value).then((data) => {
        if (data.success) {
          this.loading = false
          this.modulesList = data.data
          this.modulesList.forEach((item) => {
            // item.disabled = true
            item.label = item.name
            item.value.forEach((target) => {
              target.label = `${target.method}: ${target.operation} (${target.url})`
              if (this.apisById.indexOf(target.operation) > -1) {
                this.apiGrantData.apis.push(target)
              }
              this.$refs.apitree.setCheckedKeys(this.apisById)
            })
          })
        }
      })
    },
    changeCheckApi(obj, isChecked, data3) {
      if (isChecked) {
        this.apiGrantData.apis.push(obj)
      } else {
        const index = this.apiGrantData.apis.indexOf(obj.pattern)
        if (index != -1) {
          this.apiGrantData.apis.splice(index, 1)
        }
      }
    },
    selectAll(value) {
      const arr = []
      if (value) {
        this.modulesList.forEach((item) => {
          item.value.forEach((target) => {
            arr.push(target.pattern)
          })
        })
      }
      this.$refs.apitree.setCheckedKeys(arr)
    },
    apiGrantSubmit() {
      const that = this
      const nodes = this.$refs.apitree.getCheckedNodes()
      const { id, module } = that.apiGrantData
      const apis = []
      nodes.forEach((item) => {
        if (!item.value) {
          apis.push(item)
        }
      })
      this.loading = true
      updateApi(id, { apis: JSON.stringify(apis), module: module }).then((data) => {
        if (data.success) {
          this.$message({
            message: data.message,
            type: 'success'
          })
          this.apiGrantVisible = false
          // 更新路由
          this.$store.dispatch('permission/ChangeRoutes')
          this.getList()
        }
        this.loading = false
      })
    }
  }
}
</script>
<style scoped>
.custom-tree-node {
  color: #409eff;
}
</style>
