<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="tabClick">
      <el-tab-pane :label="'管理' + $store.getters.systemConfig.projectConfigLabel" name="manage">
        <AdvanceTable
          v-if="activeName === 'manage'"
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
          <template v-slot:action>
            <el-button type="primary" @click="handleCreate('add')"> <i class="el-icon-plus"></i> 新增 </el-button>
            <el-button type="" @click="handleDelete" :disabled="ids.length < 1"> <i class="el-icon-delete"></i> 删除 </el-button>
            <ImportData url="/api/sms/v1/projects/import" @getData="getList" template-url="/sms/v1/projects/import/template"></ImportData>
            <el-button type="" @click="exportData"> <i class="el-icon-download"></i> 导出 </el-button>
          </template>
          <template #name="val, record">
            <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
          </template>
          <template #operate="val, record">
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
      </el-tab-pane>
      <el-tab-pane :label="'租户' + $store.getters.systemConfig.projectConfigLabel" name="tenant">
        <AdvanceTable
          class="table2"
          v-if="activeName === 'tenant'"
          :card-border="false"
          :title="'租户' + $store.getters.systemConfig.projectConfigLabel + '列表'"
          :data="list"
          :search-configs="searchConfigs2"
          :params="params"
          :columns="columns2"
          :get-list="getList"
          :total="total"
          :loading="loading"
          @selection-change="selectionChange"
        >
          <template v-slot:action>
            <el-button type="" @click="exportData"> <i class="el-icon-download"></i> 导出 </el-button>
          </template>
          <template #name="val, record">
            <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
          </template>
        </AdvanceTable>
      </el-tab-pane>
    </el-tabs>
    <project-detail v-if="detailData.visible" :detailData="detailData"></project-detail>
    <AddDialog :dialog="addDialog" v-if="addDialog.visible" @clearAddDialog="clearAddDialog">
      <template v-slot:first>
        <BasicInfo ref="basicInfo" />
      </template>
      <template v-slot:second>
        <memberInfo ref="memberInfo" />
      </template>
    </AddDialog>
    <el-dialog :title="$store.getters.systemConfig.projectConfigLabel + '编辑'" width="700px" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible">
      <basic-form :model="addData" ref="addData">
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '名称：'" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
        <basic-form-item label="资源属性：" prop="visibility" validate="required">
          <el-radio-group v-model="addData.visibility">
            <el-radio-button label="manageable">管理权限</el-radio-button>
            <el-radio-button label="visible">查看权限</el-radio-button>
            <el-radio-button label="invisible">无权限</el-radio-button>
          </el-radio-group>
        </basic-form-item>
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '编码：'" prop="code" validate="required">
          <el-input type="input" v-model="addData.code" clearable></el-input>
        </basic-form-item>
        <basic-form-item label="组织机构: ">
          <el-cascader v-model="addData.departs" :props="{ label: 'name', value: 'id', checkStrictly: true }" :options="getDepartLazyData" clearable filterable></el-cascader>
        </basic-form-item>
        <!-- <basic-form-item label="启用预算: " prop="budget">
          <el-switch v-model="addData.budget"> </el-switch>
        </basic-form-item> -->
        <basic-form-item label="预算总量: " prop="money" validate="required" v-if="addData.budget">
          <el-input placeholder="请输入内容" v-model.number="addData.money">
            <template slot="append">元</template>
          </el-input>
        </basic-form-item>
        <basic-form-item label="预算阈值: " prop="budgetThreshold" validate="required" v-if="addData.budget">
          <el-input placeholder="请输入内容" v-model.number="addData.budgetThreshold">
            <template slot="append">%</template>
          </el-input>
        </basic-form-item>
        <el-form-item :label="$store.getters.systemConfig.serviceConfigLabel + '：'">
          <el-select v-model="addData.businessId" placeholder="请选择" clearable>
            <el-option v-for="item in businessList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="所属租户：">
          <el-select v-model="addData.tenantId" placeholder="请选择" clearable>
            <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item> -->
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '描述：'" prop="remark">
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
    <member :config="memberData" v-if="memberData.visibility" @success="getList" />
  </div>
</template>

<script>
import { getProject, removeProject, getProjectDetailInfo, modifyProject, removeProjectList, exportProjects } from 'services/system/project'

import { getBizs } from 'services/system/bizs'
import { getTenant } from 'services/system/tenant'
import { getUser } from 'services//system/user'

import AddDialog from '../AddDialog.vue'
import BasicInfo from './components/basicinfo.vue'
import member from './components/member.vue'
import memberInfo from './components/memberInfo.vue'
import ProjectDetail from './projectDetail.vue'
import ImportData from '@/common/components/import-data/index.vue'
import { getDepart } from 'services/system/depart'

export default {
  components: {
    AddDialog,
    BasicInfo,
    member,
    ProjectDetail,
    ImportData,
    memberInfo
  },
  data() {
    return {
      activeName: 'manage',
      detailComponent: {
        visible: false
      },
      detailData: {
        visible: false
      },
      searchConfigs1: [
        { label: '名称', value: 'name', type: 'Input' },
        { type: 'Const', value: 'tenantId', sign: 'NUL', initValue: 'null' }
        // {
        //   label: '资源属性',
        //   value: 'visibility',
        //   type: 'Select',
        //   data: [
        //     { id: 'visible', name: '查看权限' },
        //     { id: 'invisible', name: '无权限' },
        //     { id: 'manageable', name: '管理权限' }
        //   ]
        // }
      ],
      columns1: [
        { type: 'selection' },
        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: '所属' + this.$store.getters.systemConfig.serviceConfigLabel,
          prop: 'businessName'
        },
        {
          label: '预算总量（元）',
          prop: 'money'
        },
        {
          label: '预算余量（元）',
          prop: 'budgetSurplus'
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
      searchConfigs2: [
        { type: 'Input', value: 'name', label: '名称' },
        {
          label: '所属租户',
          value: 'tenantId',
          type: 'Select',
          data: []
        }
        // { type: 'Const', value: 'tenantId', sign: 'UEQ', initValue: 'null' }
      ],
      columns2: [
        { type: 'selection' },
        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: '所属' + this.$store.getters.systemConfig.serviceConfigLabel,
          prop: 'businessName'
        },
        {
          label: '所属租户',
          prop: 'tenantName'
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
        }
      ],
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      businessList: [],
      addData: {
        visibility: ''
      },
      addDialogVisible: false,
      total: 0,
      addDialog: {
        visible: false,
        parentId: 0,
        title: '快速导航',
        des: '您可以通过本向导轻松新增' + this.$store.getters.systemConfig.projectConfigLabel + '进行管理',
        leftStepList: ['基本信息', '成员配置'],
        rightContent: [
          { title: '基本信息', ref: 'basicInfo' },
          { title: '成员配置', ref: 'memberInfo' }
        ]
      },
      relaDialogData: {
        visibility: false,
        businessId: '',
        row: {}
      },
      relaBusinessList: [],
      memberData: {
        visibility: false,
        id: ''
      },
      ids: [],
      exportSearch: {
        params: []
      },
      getDepartLazyData: []
    }
  },
  methods: {
    tabClick() {
      this.ids = []
    },
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
      this.ids = val.map((item) => item.id)
    },
    handleDelete() {
      this.$confirm('您确定要删除所选中' + this.$store.getters.systemConfig.projectConfigLabel + '吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeProjectList(this.ids).then((res) => {
          if (res.success) {
            this.getList()
          }
        })
      })
    },
    async getDetail(id) {
      const res = await getProjectDetailInfo(id)
      if (res.success) {
        this.detailData = {
          ...res.data,
          id,
          visible: true
        }
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
      const { name, code, visibility, managerId, businessId, tenantId, remark, id, departs, budgetThreshold, money, budget } = this.addData
      if (budget) {
        const res = await modifyProject({ name, code, visibility, managerId, businessId, tenantId, remark, id, departs, budgetThreshold, money, budget })
        if (res.success) {
          this.$message.success(res.message)
          this.getList()
        }
      } else {
        const res = await modifyProject({ name, code, visibility, managerId, businessId, tenantId, remark, id, departs, budget })
        if (res.success) {
          this.$message.success(res.message)
          this.getList()
        }
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
      this.memberData.id = record.id
      this.memberData.visibility = true
    },
    remove(id) {
      this.$confirm('您确定要删除该' + this.$store.getters.systemConfig.projectConfigLabel + '吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeProject(id).then((res) => {
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
          break
        case 'edit':
          this.getBizsList()
          // this.getTenantList()
          getProjectDetailInfo(record.id).then((res) => {
            this.addData = res.data
            this.addData.departs = JSON.parse(this.addData.departs)
            this.getDepartLazyList()
          })
          this.addDialogVisible = true
          break
      }
    },
    // 获取组织机构
    getDepartLazyList() {
      getDepart({ parentId: 0 }).then((res) => {
        if (res.success) {
          this.getDepartLazyData = res.data
        }
      })
    },
    postAddData() {},
    getBasicPostData(a) {
      console.log(a)
    },
    clearAddDialog(type) {
      this.addDialog.visible = false
      if (type !== 'clear') {
        this.getList()
      }
    },
    // 获取业务列表
    async getBizsList() {
      const res = await getBizs({ page: 1, rows: 9999 })
      if (res.success) {
        this.businessList = res.data.rows
        this.relaBusinessList = res.data.rows
      }
    },
    // 获取租户列表
    async getTenantList() {
      const res = await getTenant({ page: 1, rows: 100000 })
      if (res.success) {
        this.searchConfigs2[1].data = res.data.rows
      }
    }
  },
  created() {
    this.getTenantList()
    // this.getDepartLazyList()
  }
}
</script>

<style lang="scss" scoped>
.member_addDialog {
  ::v-deep .el-dialog__body {
    padding: 30px 3px 0;
  }
}
// .table2 {
//   ::v-deep .search-col {
//     display: none;
//   }
//   ::v-deep .search {
//     border-bottom: none !important;
//   }
// }
.el-tabs {
  padding: 0 10px;
  background-color: #fff;
}
</style>
