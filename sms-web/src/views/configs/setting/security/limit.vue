<template>
  <div>
    <advance-table :data="list" :loading="loading" :columns="columns" :search-configs="searchConfigs" :params="params" :get-list="getList" :total="total" @selection-change="handleSelectionChange">
      <template #action>
        <!-- TODO: i18n -->
        <el-button @click="handleCreate()" type="primary">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <!-- TODO: i18n -->
        <el-button @click="handleBatchRemove()" :disabled="!selectedKeys.length">批量删除</el-button>
      </template>
      <template #operate="{ val, record }">
        <!-- TODO: i18n -->
        <el-button text @click="handleDelete(record)">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </template>
    </advance-table>
    <!--新增界面-->
    <!-- TODO: i18n -->
    <el-dialog title="新增限制IP" :close-on-click-modal="false" v-model="dialogFormVisible" v-if="dialogFormVisible" width="35%">
      <basic-form :model="addForm" ref="formRef">
        <!-- TODO: i18n -->
        <basic-form-item label="访问限制：" prop="type" validate="required">
          <el-radio-group v-model="addForm.type" disabled>
            <!-- TODO: i18n -->
            <el-radio value="black">黑名单</el-radio>
            <!-- TODO: i18n -->
            <el-radio value="white">白名单</el-radio>
          </el-radio-group>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="IP地址：" prop="ip" validate="required,ip" required-message="请输入IP地址">
          <el-input v-model="addForm.ip"></el-input>
        </basic-form-item>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <!-- TODO: i18n -->
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <!-- TODO: i18n -->
          <el-button type="primary" @click="addSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getIpAccess, createIpAccess, removeIpAccess, batchRemoveIpAccess } from 'services/system/ip_access'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

interface IpRecord {
  id?: number | string
  ip?: string
  creator?: string
  gmtCreate?: string
  type?: string
}

const props = defineProps<{
  type?: string
}>()

const columns = [
  { type: 'selection' },
  // TODO: i18n
  { label: 'IP地址', prop: 'ip' },
  // TODO: i18n
  { label: '创建人', prop: 'creator' },
  // TODO: i18n
  { label: '创建时间', prop: 'gmtCreate' },
  // TODO: i18n
  { label: '操作', width: '100px', scopedSlots: { customRender: 'operate' } }
]

const state = reactive<{
  list: IpRecord[]
  total: number
  params: { page: number; rows: number }
  dialogFormVisible: boolean
  loading: boolean
  addForm: IpRecord
  selectedKeys: (number | string)[]
}>({
  list: [],
  total: 0,
  params: {
    page: 1,
    rows: 10
  },
  dialogFormVisible: false,
  loading: false,
  addForm: {},
  selectedKeys: []
})

// expose state fields to template via destructured refs
const list = ref(state.list)
const total = ref(state.total)
const params = ref(state.params)
const dialogFormVisible = ref(state.dialogFormVisible)
const loading = ref(state.loading)
const addForm = ref(state.addForm)
const selectedKeys = ref(state.selectedKeys)

const searchConfigs = [
  // TODO: i18n
  { type: 'Input', label: 'IP地址', value: 'ip' },
  { type: 'Const', value: 'type', initValue: props.type }
]

function getList() {
  loading.value = true
  getIpAccess(params.value)
    .then((data) => {
      if (data.success) {
        list.value = data.data.rows
        total.value = data.data.total
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function handleCreate() {
  addForm.value = { type: props.type }
  dialogFormVisible.value = true
}

function handleDelete(record: IpRecord) {
  // TODO: i18n
  ElMessageBox.confirm(`您确定要删除【${record.ip}】吗?`, '提示', {
    type: 'warning'
  }).then(() => {
    removeIpAccess(record.id).then((data) => {
      if (data.success) {
        ElMessage.success(data.message)
        getList()
      }
    })
  })
}

function handleBatchRemove() {
  // TODO: i18n
  ElMessageBox.confirm('您确定要删除这些IP吗?', '提示', {
    type: 'warning'
  }).then(() => {
    batchRemoveIpAccess(selectedKeys.value).then((data) => {
      if (data.success) {
        ElMessage.success(data.message)
        getList()
      }
    })
  })
}

// TODO: type - basic-form 组件实例无公开类型
const formRef = ref<any>(null)

function addSubmit() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      createIpAccess(addForm.value).then((data) => {
        if (data.success) {
          ElMessage.success(data.message)
          dialogFormVisible.value = false
          getList()
        }
      })
    }
  })
}

function handleSelectionChange(selection: IpRecord[]) {
  selectedKeys.value = selection.map((item) => item.id as number | string)
}
</script>
