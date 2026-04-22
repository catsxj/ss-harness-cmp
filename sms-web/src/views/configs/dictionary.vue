<template>
  <div>
    <!-- TODO: cmp-element - 自研包在 compat 层处理：advance-table / basic-form / basic-form-item -->
    <advance-table title="字典列表" :columns="columns" :tree-props="{ children: 'children', hasChildren: 'hasChidren' }" row-key="id" :data="list" :loading="loading" :get-list="getList">
      <template #action>
        <el-button type="primary" @click="handleCreate()">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
      </template>
      <template #pagination><div></div></template>
      <template #operate="{ val, record }">
        <el-button link @click="handleCreate('create', record)"><el-icon><Plus /></el-icon> 新增</el-button>
        <div class="action-divider"></div>
        <el-button link @click="handleCreate('edit', record)"><el-icon><Edit /></el-icon> 编辑</el-button>
        <div class="action-divider"></div>
        <el-button link @click="handleDelete(record)"><el-icon><Delete /></el-icon> 删除</el-button>
      </template>
    </advance-table>
    <!--新增编辑-->
    <el-dialog :title="addData.id ? '编辑字典' : '新增字典'" :close-on-click-modal="false" v-if="addDialogVisible" v-model="addDialogVisible" width="35%">
      <basic-form :model="addData" ref="formRef">
        <basic-form-item label="名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="权重：" prop="weight" validate="required">
          <el-input-number v-model="addData.weight" auto-complete="off"></el-input-number>
        </basic-form-item>
        <basic-form-item label="内容：" prop="value" validate="required">
          <el-input :disabled="!!addData.id" v-model="addData.value" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="loading" @click="addSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getDict, removeDict, modifyDict, createDict } from 'services/system/dictionary'
import { useDelete } from '@/common/hooks/useTable'

interface DictRecord {
  id: number
  name: string
  value: string
  pid: number
  weight: number
  [key: string]: unknown
}

const columns = [
  {
    label: '名称',
    prop: 'name',
    disabled: true
  },
  {
    label: '内容',
    prop: 'value'
  },
  {
    label: '操作',
    width: '240px',
    disabled: true,
    scopedSlots: { customRender: 'operate' }
  }
]

const loading = ref(false)
// TODO: type - 字典行类型可共享 DictRecord
const list = ref<DictRecord[]>([])

async function getList() {
  loading.value = true
  const data = await getDict({ pid: 0 })
  loading.value = false
  if (data.success) {
    list.value = data.data
  }
}
getList()

const addData = ref<DictRecord>({
  id: 0,
  name: '',
  value: '',
  pid: 0,
  weight: 1
})
const addDialogVisible = ref(false)

function handleCreate(type?: string, data?: DictRecord) {
  addData.value = {
    id: 0,
    pid: 0,
    name: '',
    value: '',
    weight: 1
  }
  if (type === 'edit') {
    addData.value = Object.assign({}, data) as DictRecord
  } else {
    if (data) {
      addData.value.pid = data.id
    }
  }
  addDialogVisible.value = true
}

// TODO: type - basic-form 实例类型由 compat 层提供
const formRef = ref<any>(null)

function addSubmit() {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      const http = addData.value.id ? modifyDict : createDict
      const data = await http(addData.value)
      loading.value = false
      if (data.success) {
        ElMessage.success(data.message)
        addDialogVisible.value = false
        getList()
      }
    }
  })
}

const { handleDelete } = useDelete(removeDict, getList)
</script>
