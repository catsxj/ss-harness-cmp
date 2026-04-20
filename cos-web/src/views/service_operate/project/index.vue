<template>
  <el-card class="wrapper">
    <table-search :onSearch="handleSearch">
      <template v-slot:operate>
        <el-button type="primary" @click="handleCreate()" icon="el-icon-plus">新增</el-button>
        <el-button type="ghost" @click="handleImport()"> 导出 </el-button>
      </template>
    </table-search>
    <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
      <el-table-column :label="$store.getters.systemConfig.projectConfigLabel + '名称'" prop="name" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="detail-href" @click="getDetail(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="合同编码" show-overflow-tooltip></el-table-column>
      <el-table-column prop="tenantName" label="单位" show-overflow-tooltip></el-table-column>
      <el-table-column prop="managerName" label="应用系统经理" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="providerName" label="供应商经理" show-overflow-tooltip></el-table-column>
      <el-table-column prop="gmtCreate" label="创建时间" show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <el-button type="text" @click="handleCreate(scope.row.id)" :disabled="handleOperateAuth(scope.row)"><i class="el-icon-edit"></i> 编辑</el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="handleDelete(scope.row.id)" :disabled="handleOperateAuth(scope.row) || scope.row.visibility === 'DEFAULT_PROJECT'"><i class="el-icon-delete"></i> 删除 </el-button>
          <div class="action-divider"></div>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
            <el-dropdown-menu slot="dropdown">
              <!-- <el-dropdown-item @click.native="handleQuota(scope.row.id)" :disabled="handleOperateAuth(scope.row)">
                应用系统配额
              </el-dropdown-item> -->
              <el-dropdown-item @click.native="handleMember(scope.row)" :disabled="(handleOperateAuth(scope.row) && userData.id !== scope.row.managerId) || scope.row.visibility === 'DEFAULT_PROJECT'"> 成员配置 </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </basic-table>
    <!--详情-->
    <ProjectDetail v-if="detailComponent.visible" :config="detailComponent"></ProjectDetail>
    <SettingMember :dialog="memberDialog" v-if="memberDialog.visible" @getData="getData"></SettingMember>
    <!--新增编辑-->
    <el-dialog :title="title" :close-on-click-modal="false" v-if="addFlag" :visible.sync="addFlag" width="35%">
      <basic-form :model="addData" ref="addData">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="应用系统名称：" prop="name" validate="required">
              <el-input v-model="addData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="合同编号：" prop="code" validate="code">
              <el-input v-model="addData.code"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="所属单位：" prop="tenantIds" validate="required">
              <el-cascader
                popper-class="block"
                v-model="addData.tenantIds"
                :options="departList"
                :show-all-levels="false"
                :props="{ expandTrigger: 'hover', emitPath: false, multiple: true, checkStrictly: true, value: 'id', label: 'name', children: 'children' }"
                clearable
                filterable
                @change="handleManager"
              ></el-cascader>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="应用系统经理：" prop="managerIds" validate="required">
              <el-select v-model="addData.managerIds" multiple filterable placeholder="请选择">
                <el-option v-for="item in userListData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="供应商经理：" prop="providerIds">
              <el-select v-model="addData.providerIds" multiple filterable placeholder="请选择">
                <el-option v-for="item in providerListData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述：" prop="remark">
              <el-input type="textarea" v-model="addData.remark"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addFlag = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <!--配额界面-->
    <QuotaDialog v-if="quotaDialog.visible" :dialog="quotaDialog"></QuotaDialog>
    <AddDialog :dialog="addDialog" v-if="addDialog.visible" @getData="getData" @updateProject="updateGlobalProject"></AddDialog>
  </el-card>
</template>

<script>
import { mapState } from 'vuex'
import ProjectDetail from './projectDetail.vue'
import SettingMember from './settingMemberDialog.vue'
import QuotaDialog from './components/quotaDialog.vue'
import AddDialog from './AddDialog.vue'
import { getBizs } from 'services/system/bizs'
import { getProject, getProjectDetail, createProject, modifyProject, removeProject, exportProject } from 'services/system/project'
import { getAccount } from 'services/system/account'
import { getTenant } from 'services/system/tenant'

export default {
  components: {
    ProjectDetail,
    SettingMember,
    QuotaDialog,
    AddDialog
  },
  data() {
    return {
      loading: false,
      detailComponent: {},
      memberDialog: {},
      params: {
        page: 1,
        rows: 10
      },
      paramsBusiness: {
        page: 1,
        rows: 10000
      },
      paramsManager: {
        page: 1,
        rows: 999
      },
      tableData: [],
      total: 0,
      userTotal: 0,
      detailData: {},
      // 新增数据
      title: '',
      addFlag: false,
      addData: {},
      departList: [],
      userListData: [],
      providerListData: [],
      quotaDialog: {},
      businessData: [],
      addDialog: { visible: false }
    }
  },
  computed: {
    ...mapState({
      userData: (state) => state.app.userData,
      projectId: (state) => state.project.projectId
    })
  },
  created() {
    this.getDepartData()
    this.getProviderData()
  },
  methods: {
    // 只有租户管理员并且是当前租户下的应用系统才可以进行操作 默认应用系统不可进行任何操作
    handleOperateAuth(data) {
      return false
      // return !(this.userData.admin && this.userData.tenantId === data.tenantId);
    },
    getData() {
      getProject(this.params).then((data) => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    getDepartData() {
      getTenant({
        condition: JSON.stringify({ isTree: true, condition: 'listTopOrganization' })
      }).then((data) => {
        if (data.success) {
          this.departList = data.data
        }
      })
    },
    getManagerData() {
      const deptId = this.addData.tenantIds
      getAccount({
        page: this.paramsManager.page,
        rows: this.paramsManager.rows,
        condition: JSON.stringify({
          condition: 'listTenantUsers',
          deptId
        })
      }).then((data) => {
        if (data.success) {
          this.userListData = data.data.rows
        }
      })
    },
    getProviderData() {
      getAccount({
        page: this.paramsManager.page,
        rows: this.paramsManager.rows,
        condition: JSON.stringify({
          condition: 'listProviderUser'
        })
      }).then((data) => {
        if (data.success) {
          this.providerListData = data.data.rows
        }
      })
    },
    handleManager(val) {
      this.departList.forEach((item) => {
        for (let i = 0; i < val.length; i++) {
          if (item.id === val[i]) {
            this.$message.warning('部门不能选择类型')
            this.addData.tenantIds = []
          }
        }
      })
      this.getManagerData()
    },
    getBusinessData() {
      getBizs(this.paramsBusiness).then((data) => {
        if (data.success) {
          this.businessData = data.data.rows
        }
      })
    },
    handleImport() {
      exportProject(this.params.params)
    },
    handleSearch(params = this.params.params) {
      this.params.page = 1
      this.params.params = params
      this.getData()
    },
    getDetail(data) {
      const { id, visibility } = data
      this.detailComponent = {
        id,
        visibility,
        visible: true
      }
    },
    handleCreate(id) {
      this.title = '新增应用系统'
      this.addData = {
        tenantId: this.userData.tenantId
      }
      if (id) {
        this.title = '编辑应用系统'
        getProjectDetail(id).then((data) => {
          if (data.success) {
            this.addData = data.data
            this.addData.tenantIds = JSON.parse(this.addData.tenantIds)
            this.getManagerData()
            this.addData.managerIds = JSON.parse(this.addData.managerIds)
            this.addData.providerIds = JSON.parse(this.addData.providerIds)
          }
        })
        this.addFlag = true
      } else {
        this.addDialog.visible = true
      }
    },
    updateGlobalProject() {
      this.$store.dispatch('project/GetProject')
    },
    addSubmit() {
      const service = this.title === '编辑应用系统' ? modifyProject : createProject
      this.$refs.addData.validate((valid) => {
        if (valid) {
          this.loading = true
          service(this.addData).then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              this.getData()
              this.updateGlobalProject()
              this.addFlag = false
            }
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    handleQuota(id) {
      this.quotaDialog = {
        id: id,
        visible: true,
        type: 'PROJECT'
      }
    },
    // 操作
    handleDelete(id) {
      this.$confirm('您确定要删除该应用系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          removeProject(id).then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              this.updateGlobalProject()
              this.handleSearch()
            }
          })
        })
        .catch((_) => {})
    },
    handleMember(row) {
      this.memberDialog = {
        visible: true,
        projectId: row.id,
        managerIds: JSON.parse(row.managerIds),
        providerIds: JSON.parse(row.providerIds),
        deptId: JSON.parse(row.tenantIds)
      }
    }
  }
}
</script>

<style scoped></style>
