<template>
  <div>
    <!-- TODO: cmp-element advance-table -->
    <advance-table title="组织机构" :columns="columns" lazy :load="getList" :tree-props="{ children: 'children', hasChildren: 'isParent' }" row-key="id" :data="list" :loading="loading" :get-list="getList">
      <template #action>
        <el-button type="primary" @click="handleCreate()">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </template>
      <template #pagination><div></div></template>
      <template #status="status">
        <!-- TODO: cmp-element status-icon -->
        <status-icon :type="generalStatusFilter(status, 'color')">
          {{ generalStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #operate="{ val, record }">
        <el-button type="text" @click="handleCreate('add', record)">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleCreate('edit', record)">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
      </template>
    </advance-table>
    <!--新增编辑-->
    <el-dialog :title="addData.id ? '编辑组织' : '新增组织'" :close-on-click-modal="false" v-if="addDialogVisible" v-model="addDialogVisible" width="35%">
      <!-- TODO: cmp-element basic-form -->
      <basic-form :model="addData" ref="formRef">
        <!-- TODO: cmp-element basic-form-item -->
        <basic-form-item label="组织名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <el-form-item label="其他属性：" prop="props">
          <el-input v-model="addData.props" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述：" prop="remark">
          <el-input type="textarea" v-model="addData.remark" auto-complete="off"></el-input>
        </el-form-item>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { IDepart } from '@/models/depart'
import { getDepartLazy, createDepart, modifyDepart, removeDepart } from 'services/system/depart'
import { useDelete } from '@/common/hooks/useTable'
import { generalStatusFilter } from '@/filters/common'

const columns = [
  { label: '名称', prop: 'name', disabled: true },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '其他属性', prop: 'props' },
  { label: '描述', prop: 'remark' },
  { label: '操作', width: '220px', disabled: true, scopedSlots: { customRender: 'operate' } }
]

const loading = ref(false)
const list = ref<IDepart[]>([])
const formRef = ref<any>(null)

async function getList(tree: any = { id: 0 }, _treeNode?: any, resolve?: (data: any[]) => void) {
  const id = tree.id || 0
  if (id === 0) {
    loading.value = true
    list.value = []
    await nextTick()
  }
  const data = await getDepartLazy({ parentId: id }).finally(() => (loading.value = false))
  if (data.success) {
    if (id === 0) {
      list.value = data.data
    } else if (typeof resolve === 'function') {
      tree.children = data.data
      resolve(data.data)
    }
  }
}
getList()

const addDialogVisible = ref(false)
const addData = ref<any>({ id: 0, parentId: 0 })

function handleCreate(type?: string, data?: any) {
  addData.value = { id: 0, parentId: 0 }
  if (type === 'edit') {
    addData.value = Object.assign({}, data)
  } else if (data) {
    addData.value.parentId = data.id
  }
  addDialogVisible.value = true
}

function addSubmit() {
  const service = addData.value.id ? modifyDepart : createDepart
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      const data = await service(addData.value)
      loading.value = false
      if (data.success) {
        ElMessage.success(data.message)
        addDialogVisible.value = false
        getList()
      }
    }
  })
}

const { handleDelete } = useDelete(removeDepart, getList)
</script>
