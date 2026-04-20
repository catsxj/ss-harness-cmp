<template>
  <div style="padding: 10px; background: #fff">
    <AdvanceTable
      v-if="activeName === 'first'"
      :card-border="false"
      :title="$store.getters.systemConfig.projectConfigLabel + '列表'"
      :search-configs="searchConfigs1"
      :data="list"
      :params="params"
      :columns="columns1"
      :get-list="getList"
      :total="total"
      :loading="loading"
      @selection-change="selectionChange"
    >
      <template v-slot:action v-if="!isManager">
        <el-button type="primary" @click="handleCreate('add')">新增 </el-button>
        <el-button type="" @click="handleDelete" :disabled="ids.length < 1"> <i class="el-icon-delete"></i> 删除 </el-button>
        <ImportData url="/api/sms/v1/projects/import" @getData="getList" template-url="/sms/v1/projects/import/template"></ImportData>
        <el-button type="" @click="exportData"> <i class="el-icon-download"></i> 导出 </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #operate="val, record" v-if="isManager">
        <el-button type="text" @click="memberConfig(record)">成员配置</el-button>
      </template>
      <template #operate="val, record" v-else>
        <el-button type="text" @click="handleCreate('edit', record)"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)"> <i class="el-icon-delete"></i> 删除 </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="relateBusiness(record)"> 关联{{ $store.getters.systemConfig.serviceConfigLabel }} </el-dropdown-item>
            <el-dropdown-item @click.native="memberConfig(record)"> 成员配置 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <project-detail v-if="detailComponent.visible" :config="detailComponent" :detailData="detailData"></project-detail>
    <!-- 新增应用系统 -->
    <AddDialog :dialog="addDialog" v-if="addDialog.visible" @clearAddDialog="clearAddDialog">
      <template v-slot:first>
        <BasicInfo ref="basicInfo" />
      </template>
      <template v-slot:second>
        <member ref="member" :data="memberData" />
      </template>
    </AddDialog>
    <!-- 编辑页面 -->
    <el-dialog :title="$store.getters.systemConfig.projectConfigLabel + '编辑'" width="700px" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible">
      <basic-form :model="addData" ref="addData">
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '名称'" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
        <!-- <basic-form-item label="资源属性：" prop="visibility" validate="required">
          <el-radio-group v-model="addData.visibility">
            <el-radio-button label="manageable">管理权限</el-radio-button>
            <el-radio-button label="visible">查看权限</el-radio-button>
            <el-radio-button label="invisible">无权限</el-radio-button>
          </el-radio-group>
        </basic-form-item> -->
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '编码' + ':'" prop="code" validate="required">
          <el-input type="input" v-model="addData.code" clearable></el-input>
        </basic-form-item>
        <el-form-item :label="this.$store.getters.systemConfig.serviceConfigLabel + ': '">
          <el-select v-model="addData.businessId" placeholder="请选择" clearable>
            <el-option v-for="item in businessList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="所属租户：">
          <el-select v-model="addData.tenantId" placeholder="请选择" clearable>
            <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item> -->
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '描述' + ':'" prop="remark">
          <el-input type="textarea" v-model="addData.remark" clearable></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editDialogsubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <!-- 关联业务 -->
    <el-dialog :title="'关联' + $store.getters.systemConfig.serviceConfigLabel" width="700px" :close-on-click-modal="false" v-if="relaDialogData.visibility" :visible.sync="relaDialogData.visibility">
      <basic-form :model="relaDialogData" ref="addData">
        <el-form-item :label="'关联' + $store.getters.systemConfig.serviceConfigLabel + '：'">
          <el-select v-model="relaDialogData.businessId" placeholder="请选择" @change="relaBusinessChange" clearable>
            <el-option v-for="item in relaBusinessList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="relaDialogData.visibility = false">取消</el-button>
        <el-button type="primary" @click.native="relaBusinessSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <!-- 成员配置 -->
    <el-dialog class="member_addDialog" title="成员配置" width="700px" :close-on-click-modal="false" v-if="memberData.visibility" :visible.sync="memberData.visibility">
      <member ref="memberConfig" :data="memberData" :formData="mangerData" />
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="memberData.visibility = false">取消</el-button>
        <el-button type="primary" @click.native="memberConfigSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getProject, removeProject, getProjectDetailInfo, modifyProject, getProjectMemberList, settingProjectUser, removeProjectList, exportProjects } from 'services/system/project'
import { getBizs } from 'services/system/bizs'
// import { getTenant } from 'services/system/tenant'
import { getUser } from 'services//system/user'

import AddDialog from './AddDialog.vue'
import BasicInfo from './components/basicInfo.vue'
import member from './components/member.vue'
import ProjectDetail from './projectDetail.vue'
import ImportData from '@/common/components/import-data/index.vue'

export default {
  components: {
    AddDialog,
    BasicInfo,
    member,
    ProjectDetail,
    ImportData
  },
  data() {
    return {
      activeName: 'first',
      detailComponent: {
        visible: false
      },
      detailData: {},
      searchConfigs1: [{ label: '名称', value: 'name', type: 'Input' }],
      columns1: [
        { type: 'selection' },
        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: this.$store.getters.systemConfig.serviceConfigLabel,
          prop: 'businessName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel + '经理',
          prop: 'managerName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel + '编号',
          prop: 'code'
        },
        {
          label: '描述',
          prop: 'remark'
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        },
        {
          label: '操作',
          disabled: true,
          width: '220px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      searchConfigs2: [{ type: 'Const', value: 'tenantId', sign: 'UEQ', initValue: 'null' }],
      columns2: [
        { type: 'selection' },
        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: this.$store.getters.systemConfig.serviceConfigLabel,
          prop: 'businessName'
        },
        {
          label: '所属租户',
          prop: 'tenantName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel + +'经理',
          prop: 'managerName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel + '编号',
          prop: 'code'
        },
        {
          label: '描述',
          prop: 'remark'
        }
      ],
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      businessList: [],
      tenantList: [],
      addData: {
        visibility: ''
      },
      addDialogVisible: false,
      total: 0,
      addDialog: {
        visible: false,
        parentId: 0,
        title: '快速导航',
        des: `您可以通过本向导轻松新增${this.$store.getters.systemConfig.projectConfigLabel}进行管理`,
        leftStepList: ['基本信息', '成员配置'],
        rightContent: [
          { title: '基本信息', ref: 'basicInfo' },
          { title: '成员配置', ref: 'member' }
        ]
      },
      relaDialogData: {
        visibility: false,
        businessId: '',
        row: {}
      },
      relaBusinessList: [],
      tenantConfigList: [],
      memberData: {
        value: [],
        visibility: false,
        list: [],
        memberId: null,
        props: {
          key: 'id',
          label: 'name'
        }
      },
      mangerData: {
        value: []
      },
      ids: [],
      exportSearch: {
        params: []
      }
    }
  },
  computed: {
    isManager() {
      return this.$store.state.permission.projectManager
    }
  },
  methods: {
    exportData() {
      this.exportSearch.params = JSON.parse(this.params.params)
      this.exportSearch.params.push(
        ...JSON.parse(
          this.$tools.handleSearchParam({
            'id:IN': this.ids.join(',')
          })
        )
      )
      exportProjects({ params: JSON.stringify(this.exportSearch.params) })
    },
    selectionChange(val) {
      this.ids = val.map(item => item.id)
    },
    handleDelete() {
      this.$confirm(`您确定要删除所选中${this.$store.getters.systemConfig.projectConfigLabel}吗？`, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeProjectList(this.ids).then(res => {
          if (res.success) {
            this.getList()
          }
        })
      })
    },
    handleClick(tab, event) {},
    async getDetail(id) {
      this.detailComponent.id = id
      this.detailComponent.visible = true
      const res = await getProjectDetailInfo(id)
      if (res.success) {
        this.detailData = res.data
      }
    },
    relaBusinessChange(val) {
      this.relaDialogData.businessId = val
    },
    // 关联业务
    async relaBusinessSubmit() {
      const { businessId, row } = this.relaDialogData
      const { name, code, visibility, managerId, tenantId, remark, id } = row
      const res = await modifyProject({ businessId, name, code, visibility, managerId, tenantId, remark, id })
      if (res.success) {
        this.$message.success(res.message)
        this.getList()
      }
      this.relaDialogData.visibility = false
    },
    async editDialogsubmit() {
      const { name, code, visibility, managerId, businessId, tenantId, remark, id } = this.addData
      const res = await modifyProject({ name, code, visibility, managerId, businessId, tenantId, remark, id })
      if (res.success) {
        this.$message.success(res.message)
        this.getList()
      }
      this.addDialogVisible = false
    },
    // 关联业务
    async relateBusiness(record) {
      this.relaDialogData.row = record
      this.getBizsList()
      const res = await getProjectDetailInfo(record.id)
      if (res.success) {
        this.relaDialogData.businessId = res.data.businessId
      }
      this.relaDialogData.visibility = true
    },
    // 成员配置
    async memberConfig(record) {
      this.memberData.memberId = record.id
      const res = await getProjectMemberList(record.id)
      if (res.success) {
        this.memberData.list = res.data
        this.memberData.value = this.memberData.list
          .filter(item => {
            return item.checked
          })
          .map(it => it.id)
      }
      this.mangerData.value = this.memberData.list.filter(item => item.projectManager).map(item => item.id)
      this.memberData.visibility = true
    },
    // 成员配置提交
    async memberConfigSubmit() {
      const { userIds, managerIds } = this.$refs.memberConfig.getPostData()
      userIds.forEach((user, index) => {
        managerIds.forEach(manger => {
          if (user === manger) {
            userIds.splice(index, 1)
          }
        })
      })
      const res = await settingProjectUser(this.memberData.memberId, { userIds, managerIds })
      if (res.success) {
        this.$message.success(res.message)
        this.getList()
      }
      this.memberData.visibility = false
      this.memberData.value = []
      this.memberData.list = []
      this.mangerData = {
        value: []
      }
    },
    remove(id) {
      this.$confirm(`您确定要删除该${this.$store.getters.systemConfig.projectConfigLabel}吗？`, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeProject(id).then(res => {
          if (res.success) {
            this.$message.success(res.message)
            this.getList()
          }
        })
      })
    },
    async getList() {
      const res = await getProject(this.params)
      if (res.success) {
        this.list = res.data.rows
        this.total = res.data.total
      }
    },
    handleCreate(type, record) {
      switch (type) {
        case 'add':
          this.addDialog.visible = true
          this.memberData.list = []
          this.memberData.value = []
          getUser({ page: 1, rows: 9999 }).then(res => {
            if (res.success) {
              this.memberData.list = res.data.rows
            }
          })
          break
        case 'edit':
          this.getBizsList()
          // this.getTenantList()
          getProjectDetailInfo(record.id).then(res => {
            this.addData = res.data
          })
          this.addDialogVisible = true
          break
      }
    },
    clearAddDialog(type) {
      this.addDialog.visible = false
      this.memberData.list = []
      this.memberData.value = []
      if (type !== 'clear') {
        this.getList()
      }
    },
    // 获取业务列表
    async getBizsList() {
      const res = await getBizs({ page: 1, rows: 100000 })
      if (res.success) {
        this.businessList = res.data.rows
        this.relaBusinessList = res.data.rows
      }
    }
    // 获取租户列表
    // async getTenantList() {
    //   const res = await getTenant({ page: 1, rows: 100000 })
    //   if (res.success) {
    //     this.tenantList = res.data.rows
    //     this.tenantConfigList = res.data.rows
    //   }
    // }
  }
}
</script>

<style lang="scss" scoped>
.member_addDialog {
  ::v-deep .el-dialog__body {
    padding: 30px 3px 0;
  }
}
.table2 {
  ::v-deep .search-col {
    display: none;
  }
  ::v-deep .search {
    border-bottom: none !important;
  }
}
.el-tabs {
  padding: 0 10px;
  background-color: #fff;
}
.table-container {
  border-top: 0;
}
</style>
