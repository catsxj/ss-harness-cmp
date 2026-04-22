<template>
  <div>
    <AdvanceTable :columns="columns" :data="listData" :search-configs="searchConfigs" :params="params" :get-list="getList" :total="total" @selection-change="selectionChange">
      <template #action>
        <!-- TODO: i18n -->
        <el-button type="primary" @click="handleCreateNew">新增</el-button>
        <!-- TODO: i18n -->
        <el-button type="primary" @click="removeAll">批量删除</el-button>
      </template>
      <template #name="{ val, record }">
        <span class="detail-href" @click="createBind(record)">{{ val }}</span>
      </template>
      <!-- TODO: i18n -->
      <template #isTenant="{ val, record }">{{ val ? '是' : '否' }}</template>
      <template #operate="{ val, record }">
        <!-- TODO: i18n -->
        <el-button text @click="handleEdit(record)">编辑</el-button>
        <!-- TODO: i18n -->
        <el-button text @click="remove(record.id)">删除</el-button>
      </template>
    </AdvanceTable>
    <!-- TODO: i18n -->
    <el-dialog width="960px" v-model="visible" :close-on-click-modal="false" :title="dialogData.id ? '编辑' : '新增'">
      <basic-form :model="dialogData" label-width="200px" ref="formRef">
        <el-row>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="资源名称" prop="name" validate="required">
              <el-input v-model.trim="dialogData.name" type="text"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="资源类型" prop="resourceType" validate="required">
              <el-input v-model.trim="dialogData.resourceType" type="text"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="是否在租户端显示" prop="isTenant">
              <el-switch v-model="dialogData.isTenant"></el-switch>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <template #footer>
        <!-- TODO: i18n -->
        <el-button @click="visible = false">取消</el-button>
        <!-- TODO: i18n -->
        <el-button type="primary" @click="confirmCreate">确定</el-button>
      </template>
    </el-dialog>
    <Metrics v-if="bindData.visible" v-model:visible="bindData.visible" :resourceType="bindData.type" :titleName="bindData.name"></Metrics>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getMonitorSettings, createMonitorSetting, updateMonitorSetting, deleteMonitorSetting, deleteAllMonitorSetting } from 'services/services/monitor'
import { ElMessage, ElMessageBox } from 'element-plus'
import Metrics from './metrics.vue'

interface MonitorRecord {
  id?: number | string
  name?: string
  resourceType?: string
  isTenant?: boolean
  [key: string]: unknown
}

const columns = [
  { type: 'selection' },
  {
    // TODO: i18n
    label: '资源名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    // TODO: i18n
    label: '资源类型',
    prop: 'resourceType'
  },
  {
    // TODO: i18n
    label: '是否租户端展示',
    prop: 'isTenant',
    scopedSlots: { customRender: 'isTenant' }
  },
  {
    // TODO: i18n
    label: '操作',
    scopedSlots: { customRender: 'operate' }
  }
]

const listData = ref<MonitorRecord[]>([])
const params = ref({
  page: 1,
  rows: 10
})
const total = ref(0)
const searchConfigs = ref([
  // TODO: i18n
  { type: 'Input', value: 'name', label: '资源名称' },
  // TODO: i18n
  { type: 'Input', value: 'resourceType', label: '资源类型' },
  {
    type: 'Select',
    // TODO: i18n
    label: '是否在租户端展示',
    value: 'isTenant',
    data: [
      // TODO: i18n
      { name: '是', id: true },
      // TODO: i18n
      { name: '否', id: false }
    ]
  }
])

const getList = async () => {
  const { data, success } = await getMonitorSettings(params.value)
  if (success) {
    listData.value = data.rows
    total.value = data.total
  }
}
getList()

const visible = ref(false)
const dialogData = ref<MonitorRecord>({})
// TODO: type - basic-form 组件实例无公开类型
const formRef = ref<any>(null)

const handleCreateNew = () => {
  visible.value = true
  dialogData.value = {}
}
const handleEdit = (record: MonitorRecord) => {
  visible.value = true
  dialogData.value = { ...record }
}

const confirmCreate = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const fn = dialogData.value.id ? updateMonitorSetting : createMonitorSetting
      const { success, message } = await fn({ ...dialogData.value, isTenant: !!dialogData.value.isTenant }, dialogData.value.id)
      if (success) {
        ElMessage.success(message)
        visible.value = false
        getList()
      }
    }
  })
}

const remove = (id: number | string) => {
  // TODO: i18n
  ElMessageBox.confirm('确定要删除该资源吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    deleteMonitorSetting(id).then(({ success, message }) => {
      if (success) {
        ElMessage.success(message)
        getList()
      }
    })
  })
}

const removeIds = ref<(number | string)[]>([])
const selectionChange = (selection: MonitorRecord[]) => {
  removeIds.value = selection.map((item) => item.id as number | string)
}

const removeAll = () => {
  // TODO: i18n
  ElMessageBox.confirm('确定要删除所选中资源吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(async () => {
    const { success, message } = await deleteAllMonitorSetting({ ids: removeIds.value })
    if (success) {
      ElMessage.success(message)
      getList()
    }
  })
}

interface BindData {
  visible: boolean
  type: string
  name?: string
}
const bindData = ref<BindData>({
  visible: false,
  type: ''
})

const createBind = (record: MonitorRecord) => {
  bindData.value.visible = true
  bindData.value.type = record.resourceType || ''
  bindData.value.name = record.name
}
</script>
