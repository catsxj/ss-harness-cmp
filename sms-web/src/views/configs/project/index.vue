<template>
  <div>
    <!-- TODO: cmp-element - 自研包在 compat 层处理：AdvanceTable / basic-form / basic-form-item -->
    <el-tabs v-model="activeName" @tab-click="tabClick">
      <el-tab-pane :label="'管理' + appStore.systemConfig.projectConfigLabel" name="manage">
        <AdvanceTable
          v-if="activeName === 'manage'"
          :card-border="false"
          :title="appStore.systemConfig.projectConfigLabel + '列表'"
          :search-configs="searchConfigs1"
          :data="list"
          :params="params"
          :columns="columns1"
          :get-list="getList"
          :total="total"
          :loading="loading"
          @selection-change="selectionChange"
        >
          <template #action>
            <el-button type="primary" @click="handleCreate('add')"> <el-icon><Plus /></el-icon> 新增 </el-button>
            <el-button type="" @click="handleDeleteBatch" :disabled="ids.length < 1"> <el-icon><Delete /></el-icon> 删除 </el-button>
            <ImportData url="/api/sms/v1/projects/import" @getData="getList" template-url="/sms/v1/projects/import/template"></ImportData>
            <el-button type="" @click="exportData"> <el-icon><Download /></el-icon> 导出 </el-button>
          </template>
          <template #name="{ val, record }">
            <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
          </template>
          <template #operate="{ val, record }">
            <el-button link @click="handleCreate('edit', record)"> <el-icon><Edit /></el-icon> 编辑 </el-button>
            <div class="action-divider"></div>
            <el-button link @click="remove(record.id)"> <el-icon><Delete /></el-icon> 删除 </el-button>
            <div class="action-divider"></div>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="relateBusiness(record)"> 关联{{ appStore.systemConfig.serviceConfigLabel }} </el-dropdown-item>
                  <el-dropdown-item @click="memberConfig(record)"> 成员配置 </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </AdvanceTable>
      </el-tab-pane>
      <el-tab-pane :label="'租户' + appStore.systemConfig.projectConfigLabel" name="tenant">
        <AdvanceTable
          class="table2"
          v-if="activeName === 'tenant'"
          :card-border="false"
          :title="'租户' + appStore.systemConfig.projectConfigLabel + '列表'"
          :data="list"
          :search-configs="searchConfigs2"
          :params="params"
          :columns="columns2"
          :get-list="getList"
          :total="total"
          :loading="loading"
          @selection-change="selectionChange"
        >
          <template #action>
            <el-button type="" @click="exportData"> <el-icon><Download /></el-icon> 导出 </el-button>
          </template>
          <template #name="{ val, record }">
            <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
          </template>
        </AdvanceTable>
      </el-tab-pane>
    </el-tabs>
    <project-detail v-if="detailData.visible" :detailData="detailData"></project-detail>
    <AddDialog :dialog="addDialog" v-if="addDialog.visible" @clearAddDialog="clearAddDialog">
      <template #first>
        <BasicInfo ref="basicInfo" />
      </template>
      <template #second>
        <memberInfo ref="memberInfo" />
      </template>
    </AddDialog>
    <el-dialog :title="appStore.systemConfig.projectConfigLabel + '编辑'" width="700px" :close-on-click-modal="false" v-if="addDialogVisible" v-model="addDialogVisible">
      <basic-form :model="addData" ref="addFormRef">
        <basic-form-item :label="appStore.systemConfig.projectConfigLabel + '名称：'" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
        <basic-form-item label="资源属性：" prop="visibility" validate="required">
          <el-radio-group v-model="addData.visibility">
            <el-radio-button value="manageable">管理权限</el-radio-button>
            <el-radio-button value="visible">查看权限</el-radio-button>
            <el-radio-button value="invisible">无权限</el-radio-button>
          </el-radio-group>
        </basic-form-item>
        <basic-form-item :label="appStore.systemConfig.projectConfigLabel + '编码：'" prop="code" validate="required">
          <el-input type="input" v-model="addData.code" clearable></el-input>
        </basic-form-item>
        <basic-form-item label="组织机构: ">
          <el-cascader v-model="addData.departs" :props="{ label: 'name', value: 'id', checkStrictly: true }" :options="getDepartLazyData" clearable filterable></el-cascader>
        </basic-form-item>
        <basic-form-item label="预算总量: " prop="money" validate="required" v-if="addData.budget">
          <el-input placeholder="请输入内容" v-model.number="addData.money">
            <template #append>元</template>
          </el-input>
        </basic-form-item>
        <basic-form-item label="预算阈值: " prop="budgetThreshold" validate="required" v-if="addData.budget">
          <el-input placeholder="请输入内容" v-model.number="addData.budgetThreshold">
            <template #append>%</template>
          </el-input>
        </basic-form-item>
        <el-form-item :label="appStore.systemConfig.serviceConfigLabel + '：'">
          <el-select v-model="addData.businessId" placeholder="请选择" clearable>
            <el-option v-for="item in businessList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <basic-form-item :label="appStore.systemConfig.projectConfigLabel + '描述：'" prop="remark">
          <el-input type="textarea" v-model="addData.remark" clearable></el-input>
        </basic-form-item>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="ghost" @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editDialogsubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 关联业务 -->
    <el-dialog :title="'关联' + appStore.systemConfig.serviceConfigLabel" width="700px" :close-on-click-modal="false" v-if="relaDialogData.visibility" v-model="relaDialogData.visibility">
      <basic-form :model="relaDialogData" ref="relaFormRef">
        <el-form-item :label="'关联' + appStore.systemConfig.serviceConfigLabel + '：'">
          <el-select v-model="relaDialogData.businessId" placeholder="请选择" @change="relaBusinessChange" clearable>
            <el-option v-for="item in relaBusinessList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="ghost" @click="relaDialogData.visibility = false">取消</el-button>
          <el-button type="primary" @click="relaBusinessSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <member :config="memberData" v-if="memberData.visibility" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Download, Edit, ArrowDown } from '@element-plus/icons-vue'
import { handleSearchParam } from 'utils'
import { useAppStore } from '@/stores'
import { getProject, removeProject, getProjectDetailInfo, modifyProject, removeProjectList, exportProjects } from 'services/system/project'
import { getBizs } from 'services/system/bizs'
import { getTenant } from 'services/system/tenant'
import AddDialog from '../AddDialog.vue'
import BasicInfo from './components/basicinfo.vue'
import member from './components/member.vue'
import memberInfo from './components/memberInfo.vue'
import ProjectDetail from './projectDetail.vue'
import ImportData from '@/common/components/import-data/index.vue'
import { getDepart } from 'services/system/depart'

const appStore = useAppStore()

const activeName = ref('manage')
const detailComponent = reactive<{ visible: boolean }>({ visible: false })
const detailData = reactive<Record<string, any>>({ visible: false })

const searchConfigs1 = [
  { label: '名称', value: 'name', type: 'Input' },
  { type: 'Const', value: 'tenantId', sign: 'NUL', initValue: 'null' }
]

const columns1 = computed(() => [
  { type: 'selection' },
  { label: '名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '所属' + appStore.systemConfig.serviceConfigLabel, prop: 'businessName' },
  { label: '预算总量（元）', prop: 'money' },
  { label: '预算余量（元）', prop: 'budgetSurplus' },
  { label: appStore.systemConfig.projectConfigLabel + '经理', prop: 'managerName' },
  { label: appStore.systemConfig.projectConfigLabel + '编号', prop: 'code' },
  { label: '描述', prop: 'remark' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '操作', disabled: true, width: '220px', scopedSlots: { customRender: 'operate' } }
])

const searchConfigs2 = reactive<any[]>([
  { type: 'Input', value: 'name', label: '名称' },
  {
    label: '所属租户',
    value: 'tenantId',
    type: 'Select',
    data: []
  }
])

const columns2 = computed(() => [
  { type: 'selection' },
  { label: '名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '所属' + appStore.systemConfig.serviceConfigLabel, prop: 'businessName' },
  { label: '所属租户', prop: 'tenantName' },
  { label: appStore.systemConfig.projectConfigLabel + '经理', prop: 'managerName' },
  { label: appStore.systemConfig.projectConfigLabel + '编号', prop: 'code' },
  { label: '描述', prop: 'remark' }
])

const loading = ref(false)
// TODO: type - 项目行类型后续补 interface
const list = ref<any[]>([])
const params = reactive<Record<string, any>>({ page: 1, rows: 10 })
const businessList = ref<any[]>([])
const addData = ref<Record<string, any>>({ visibility: '' })
const addDialogVisible = ref(false)
const total = ref(0)

const addDialog = reactive<Record<string, any>>({
  visible: false,
  parentId: 0,
  title: '快速导航',
  des: '您可以通过本向导轻松新增' + appStore.systemConfig.projectConfigLabel + '进行管理',
  leftStepList: ['基本信息', '成员配置'],
  rightContent: [
    { title: '基本信息', ref: 'basicInfo' },
    { title: '成员配置', ref: 'memberInfo' }
  ]
})

const relaDialogData = reactive<Record<string, any>>({
  visibility: false,
  businessId: '',
  row: {}
})
const relaBusinessList = ref<any[]>([])
const memberData = reactive<{ visibility: boolean; id: number | string }>({ visibility: false, id: '' })
const ids = ref<Array<number | string>>([])
const exportSearch = reactive<{ params: any[] }>({ params: [] })
const getDepartLazyData = ref<any[]>([])

// TODO: type - basic-form / 子组件实例类型由 compat 层提供
const addFormRef = ref<any>(null)
const relaFormRef = ref<any>(null)
const basicInfo = ref<any>(null)
const memberInfoRef = ref<any>(null)

function tabClick() {
  ids.value = []
}

function exportData() {
  exportSearch.params = JSON.parse((params as any).params)
  exportSearch.params.push(
    ...JSON.parse(
      handleSearchParam({
        'id:IN': ids.value.join(',')
      })
    )
  )
  exportProjects({ params: JSON.stringify(exportSearch.params) })
}

function selectionChange(val: any[]) {
  ids.value = val.map((item) => item.id)
}

function handleDeleteBatch() {
  ElMessageBox.confirm('您确定要删除所选中' + appStore.systemConfig.projectConfigLabel + '吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    removeProjectList(ids.value).then((res: any) => {
      if (res.success) {
        getList()
      }
    })
  })
}

async function getDetail(id: number | string) {
  const res = await getProjectDetailInfo(id as any)
  if (res.success) {
    Object.keys(detailData).forEach((k) => delete detailData[k])
    Object.assign(detailData, { ...res.data, id, visible: true })
  }
}

function relaBusinessChange(val: any) {
  relaDialogData.businessId = val
}

async function relaBusinessSubmit() {
  const { businessId, row } = relaDialogData
  const { name, code, visibility, managerId, tenantId, remark, id } = row
  const res = await modifyProject({ businessId, name, code, visibility, managerId, tenantId, remark, id })
  if (res.success) {
    ElMessage.success(res.message)
    getList()
  }
  relaDialogData.visibility = false
}

async function editDialogsubmit() {
  const { name, code, visibility, managerId, businessId, tenantId, remark, id, departs, budgetThreshold, money, budget } = addData.value
  if (budget) {
    const res = await modifyProject({ name, code, visibility, managerId, businessId, tenantId, remark, id, departs, budgetThreshold, money, budget })
    if (res.success) {
      ElMessage.success(res.message)
      getList()
    }
  } else {
    const res = await modifyProject({ name, code, visibility, managerId, businessId, tenantId, remark, id, departs, budget })
    if (res.success) {
      ElMessage.success(res.message)
      getList()
    }
  }
  addDialogVisible.value = false
}

async function relateBusiness(record: any) {
  relaDialogData.row = record
  getBizsList()
  const res = await getProjectDetailInfo(record.id)
  if (res.success) {
    relaDialogData.businessId = res.data.businessId
  }
  relaDialogData.visibility = true
}

async function memberConfig(record: any) {
  memberData.id = record.id
  memberData.visibility = true
}

function remove(id: number | string) {
  ElMessageBox.confirm('您确定要删除该' + appStore.systemConfig.projectConfigLabel + '吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    removeProject(id as any).then((res: any) => {
      if (res.success) {
        ElMessage.success(res.message)
        getList()
      }
    })
  })
}

async function getList() {
  const res = await getProject(params)
  if (res.success) {
    list.value = res.data.rows
    total.value = res.data.total
  }
}

function handleCreate(type: string, record?: any) {
  switch (type) {
    case 'add':
      addDialog.visible = true
      break
    case 'edit':
      getBizsList()
      getProjectDetailInfo(record.id).then((res: any) => {
        addData.value = res.data
        if (addData.value.departs) {
          addData.value.departs = JSON.parse(addData.value.departs)
        }
        getDepartLazyList()
      })
      addDialogVisible.value = true
      break
  }
}

function getDepartLazyList() {
  getDepart({ parentId: 0 }).then((res: any) => {
    if (res.success) {
      getDepartLazyData.value = res.data
    }
  })
}

function clearAddDialog(type?: string) {
  addDialog.visible = false
  if (type !== 'clear') {
    getList()
  }
}

async function getBizsList() {
  const res = await getBizs({ page: 1, rows: 9999 })
  if (res.success) {
    businessList.value = res.data.rows
    relaBusinessList.value = res.data.rows
  }
}

async function getTenantList() {
  const res = await getTenant({ page: 1, rows: 100000 })
  if (res.success) {
    ;(searchConfigs2[1] as any).data = res.data.rows
  }
}

onMounted(() => {
  getTenantList()
})
</script>

<style lang="scss" scoped>
.member_addDialog {
  :deep(.el-dialog__body) {
    padding: 30px 3px 0;
  }
}
.el-tabs {
  padding: 0 10px;
  background-color: #fff;
}
</style>
