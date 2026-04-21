<template>
  <div>
    <!-- TODO: cmp-element - 自研包在 compat 层处理：AdvanceTable / basic-form / basic-form-item -->
    <AdvanceTable
      :title="appStore.systemConfig.serviceConfigLabel + '列表'"
      :search-configs="searchConfigs"
      :data="list"
      :params="params"
      :columns="columns"
      :get-list="getList"
      :total="total"
      :loading="loading"
      @selection-change="selectionChange"
    >
      <template #action>
        <el-button type="primary" @click="handle('add')"> <el-icon><Plus /></el-icon> 新增 </el-button>
        <el-button type="" @click="handleDeleteBatch" :disabled="ids.length < 1"> <el-icon><Delete /></el-icon> 删除 </el-button>
        <ImportData url="/api/sms/v1/bizs/import" @getData="getList" template-url="/sms/v1/bizs/import/template"></ImportData>
        <el-button type="" @click="exportData"> <el-icon><Download /></el-icon> 导出 </el-button>
      </template>
      <template #operate="{ val, record }">
        <el-button type="text" @click="handle('edit', record)"> <el-icon><Edit /></el-icon> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)"> <el-icon><Delete /></el-icon> 删除 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="relationProject(record.id)"> <el-icon><Share /></el-icon> 关联{{ appStore.systemConfig.projectConfigLabel }} </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" width="700px" :close-on-click-modal="false" v-if="addDialogVisible" v-model="addDialogVisible">
      <basic-form :model="addData" ref="addFormRef">
        <basic-form-item :label="appStore.systemConfig.serviceConfigLabel + '名称：'" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
        <basic-form-item :label="appStore.systemConfig.serviceConfigLabel + '编码：'" prop="code" validate="required">
          <el-input type="input" v-model="addData.code" clearable></el-input>
        </basic-form-item>
        <el-form-item :label="'关联' + appStore.systemConfig.projectConfigLabel + '：'">
          <el-select v-model="addData.projectIds" multiple placeholder="请选择" clearable :disabled="dialogStatus === 'update'">
            <el-option v-for="item in relationProjectObj.projects" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <basic-form-item :label="appStore.systemConfig.serviceConfigLabel + '描述：'" prop="remark">
          <el-input type="textarea" v-model="addData.remark" clearable></el-input>
        </basic-form-item>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="ghost" @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <relation-project @afterRelation="afterRelation" v-if="relationProjectObj.visible" :config="relationProjectObj"></relation-project>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Download, Edit, Share } from '@element-plus/icons-vue'
import { handleSearchParam } from 'utils'
import { useAppStore } from '@/stores'
import { getBizs, createBizs, getProjectByBizList, pacthRelatioonBiz, removeBizs, modifyBizs, getBizsDetail, removeBizList, exportBizsList } from 'services/system/bizs'
import { getProject } from 'services/system/project'
import RelationProject from './RelationProject.vue'
import ImportData from '@/common/components/import-data/index.vue'

const appStore = useAppStore()

const searchConfigs = [{ label: '名称', value: 'name', type: 'Input' }]
const columns = computed(() => [
  { type: 'selection' },
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: appStore.systemConfig.serviceConfigLabel + '编码',
    prop: 'code'
  },
  {
    label: '关联' + appStore.systemConfig.projectConfigLabel,
    prop: 'projects'
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
    width: '260px',
    scopedSlots: { customRender: 'operate' }
  }
])

const loading = ref(false)
// TODO: type - 业务列表行类型后续补 interface
const list = ref<any[]>([])
const params = reactive<Record<string, any>>({
  page: 1,
  rows: 10
})
const total = ref(0)
// TODO: type - 新增/编辑表单类型后续补 interface
const addData = ref<Record<string, any>>({})
const addDialogVisible = ref(false)
const textMap = computed<Record<string, string>>(() => ({
  update: '编辑' + appStore.systemConfig.serviceConfigLabel,
  create: '新增' + appStore.systemConfig.serviceConfigLabel
}))
const dialogStatus = ref<'create' | 'update'>('create')
const relationProjectObj = reactive<{
  visible: boolean
  value: Array<number | string>
  projects: any[]
  id?: number | string
}>({
  visible: false,
  value: [],
  projects: []
})
const ids = ref<Array<number | string>>([])
const exportSearch = reactive<{ params: any[] }>({ params: [] })

// TODO: type - basic-form 实例类型后续由 compat 层提供
const addFormRef = ref<any>(null)

function exportData() {
  exportSearch.params = JSON.parse((params as any).params)
  exportSearch.params.push(
    ...JSON.parse(
      handleSearchParam({
        'id:IN': ids.value.join(',')
      })
    )
  )
  exportBizsList({ params: JSON.stringify(exportSearch.params) })
}

function selectionChange(val: any[]) {
  ids.value = val.map((item) => item.id)
}

function handleDeleteBatch() {
  ElMessageBox.confirm('您确定要删除所选中' + appStore.systemConfig.serviceConfigLabel + '吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    removeBizList(ids.value).then((res: any) => {
      if (res.success) {
        getList()
      }
    })
  })
}

async function getProjectList(listParams: string) {
  const res = await getProject({ page: 1, rows: 100000, params: listParams })
  if (res.success) {
    relationProjectObj.projects = res.data.rows
  }
}

async function afterRelation(resultIds: Array<number | string>) {
  const res = await pacthRelatioonBiz(relationProjectObj.id as any, resultIds)
  if (res.success) {
    ElMessage.success(res.message)
    getList()
  }
}

async function getList() {
  loading.value = true
  const res = await getBizs(params)
  if (res.success) {
    list.value = res.data.rows
    total.value = res.data.total
  }
  loading.value = false
}

function handle(type: string, record?: any) {
  switch (type) {
    case 'add':
      addData.value = {}
      dialogStatus.value = 'create'
      getProjectList(handleSearchParam({ 'businessId:NUL': 'null' }))
      addDialogVisible.value = true
      break
    case 'delete':
      remove(record.id)
      break
    case 'edit':
      getrelationProjectList(record.id)
      getBizsDetail(record.id).then((res: any) => {
        if (res.success) {
          addData.value = res.data
        }
      })
      dialogStatus.value = 'update'
      addDialogVisible.value = true
      break
  }
}

function remove(id: number | string) {
  ElMessageBox.confirm('您确定要删除该' + appStore.systemConfig.serviceConfigLabel + '吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    removeBizs(id as any).then((res: any) => {
      if (res.success) {
        ElMessage.success(res.message)
        getList()
      }
    })
  })
}

function submit() {
  if (dialogStatus.value === 'create') {
    addSubmit()
  } else if (dialogStatus.value === 'update') {
    editSubmit()
  }
}

function addSubmit() {
  addFormRef.value?.validate((valid: boolean) => {
    if (!valid) {
      ElMessage.error('缺少必填项')
      return
    }
    createBizs(addData.value)
      .then((res: any) => {
        if (res.success) {
          ElMessage.success(res.message)
        }
      })
      .finally(() => {
        addDialogVisible.value = false
        getList()
        addData.value = {}
      })
  })
}

function editSubmit() {
  addFormRef.value?.validate((valid: boolean) => {
    if (!valid) {
      ElMessage.error('缺少必填项')
      return
    }
    modifyBizs(addData.value)
      .then((res: any) => {
        if (res.success) {
          ElMessage.success(res.message)
        }
      })
      .finally(() => {
        addDialogVisible.value = false
        getList()
        addData.value = {}
      })
  })
}

function relationProject(id: number | string) {
  relationProjectObj.value = []
  getrelationProjectList(id)
  relationProjectObj.visible = true
}

async function getrelationProjectList(id: number | string) {
  relationProjectObj.id = id
  const res = await getProjectByBizList(id as any)
  if (res.success) {
    relationProjectObj.projects = res.data
    relationProjectObj.value = res.data.filter((item: any) => item.check).map((item: any) => item.id)
  }
}
</script>

<style>
.import {
  margin-left: 10px;
}
</style>
