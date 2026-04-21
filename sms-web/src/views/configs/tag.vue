<template>
  <div>
    <!-- TODO: cmp-element - 自研包在 compat 层处理：AdvanceTable / basic-form / basic-form-item -->
    <AdvanceTable title="标签列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #action>
        <el-button type="primary" @click="handleCreate('add')">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
      </template>
      <template #values="values">
        <el-tag type="success" :key="index" v-for="(tag, index) in values" :disable-transitions="false">
          {{ tag }}
        </el-tag>
      </template>
      <template #operate="{ val, record }">
        <el-button type="text" @click="handleCreate('edit', record)" :disabled="record.personal"> <el-icon><Edit /></el-icon> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)" :disabled="record.personal"> <el-icon><Delete /></el-icon> 删除 </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" width="700px" :close-on-click-modal="false" v-if="addDialogVisible" v-model="addDialogVisible">
      <basic-form :model="addData" ref="addFormRef">
        <basic-form-item label="标签名称: " prop="name" validate="required" maxlength="64">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
        <basic-form-item label="标签值: " validate="required">
          <el-tag :key="index" v-for="(tag, index) in addData.values" closable :disable-transitions="false" @close="handleClose(tag)">
            {{ tag }}
          </el-tag>
          <el-input class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small" @keyup.enter="handleInputConfirm" @blur="handleInputConfirm"> </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">新增值</el-button>
        </basic-form-item>
        <basic-form-item label="标签描述: " prop="remark" :maxlength="128">
          <el-input type="textarea" v-model="addData.remark" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="ghost" @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getTags, createTag, modifyTag, removeTag } from 'services/system/tag'

const searchConfigs = [
  { label: '名称', value: 'name', type: 'Input' },
  { type: 'Const', value: 'tenantId', initValue: 0 }
]
const columns = [
  { label: '标签名称', prop: 'name', scopedSlots: { customRender: 'name' }, width: '160px' },
  { label: '标签内容', prop: 'values', scopedSlots: { customRender: 'values' } },
  { label: '标签描述', prop: 'remark' },
  { label: '操作', disabled: true, width: '160px', scopedSlots: { customRender: 'operate' } }
]

const loading = ref(false)
// TODO: type - 标签行类型后续补 interface
const list = ref<any[]>([])
const params = reactive<Record<string, any>>({ page: 1, rows: 10 })
const total = ref(0)
const textMap: Record<string, string> = {
  update: '编辑标签',
  create: '新增标签'
}
const dialogStatus = ref<'create' | 'update'>('create')
const addData = ref<Record<string, any>>({ values: [] })
const addDialogVisible = ref(false)
const inputValue = ref('')
const inputVisible = ref(false)

// TODO: type - basic-form / el-input 实例类型由 compat 层/Element Plus 提供
const addFormRef = ref<any>(null)
const saveTagInput = ref<any>(null)

watch(inputValue, (val) => {
  if (val.length > 50) {
    inputValue.value = val.slice(0, 50)
    ElMessage.error('标签值字符长度不能超过50位')
  }
})

function handleClose(tag: string) {
  const values = addData.value.values as string[]
  values.splice(values.indexOf(tag), 1)
}

function showInput() {
  inputVisible.value = true
  nextTick(() => {
    saveTagInput.value?.$refs?.input?.focus?.()
    // Element Plus 下 el-input 可能直接暴露 focus
    saveTagInput.value?.focus?.()
  })
}

function handleInputConfirm() {
  const val = inputValue.value
  if (val) {
    ;(addData.value.values as string[]).push(val)
  }
  inputVisible.value = false
  inputValue.value = ''
}

async function getList() {
  loading.value = true
  const res = await getTags(params)
  if (res.success) {
    list.value = res.data.rows
    total.value = res.data.total
  }
  loading.value = false
}

function handleCreate(type: string, record?: any) {
  switch (type) {
    case 'add':
      addData.value = { values: [] }
      dialogStatus.value = 'create'
      addDialogVisible.value = true
      break
    case 'edit':
      dialogStatus.value = 'update'
      addDialogVisible.value = true
      addData.value = Object.assign({}, record)
      if (addData.value.content) {
        addData.value.content = JSON.parse(addData.value.content)
      }
      break
  }
}

async function submit() {
  addFormRef.value?.validate((valid: boolean) => {
    if (!valid || !(addData.value.values as string[]).length) {
      ElMessage.warning('缺少必填项！')
      return
    }
    loading.value = true
    if (dialogStatus.value === 'create') {
      const postParams = { ...addData.value, id: 0 }
      createTag(postParams).then((res: any) => {
        if (res.success) {
          getList()
          addDialogVisible.value = false
          ElMessage.success(res.message)
        }
        loading.value = false
      })
    } else {
      addData.value.content = JSON.stringify((addData.value.values as string[]).filter((item) => item))
      modifyTag(addData.value).then((res: any) => {
        if (res.success) {
          getList()
          addDialogVisible.value = false
          ElMessage.success(res.message)
        }
        loading.value = false
      })
    }
  })
}

function remove(id: number | string) {
  ElMessageBox.confirm('您确定要删除该标签吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    removeTag(id as any).then((res: any) => {
      if (res.success) {
        ElMessage.success(res.message)
        getList()
      }
    })
  })
}
</script>

<style lang="scss" scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
