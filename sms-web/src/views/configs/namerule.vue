<template>
  <el-card class="wrapper">
    <!-- TODO: cmp-element - 自研包在 compat 层处理：AdvanceTable / basic-form / basic-form-item -->
    <AdvanceTable title="命名规则" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #action>
        <el-button type="primary" @click="handleCreate()">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
      </template>
      <template #composition="val, record">
        {{ record.hasUser ? '用户' : '' }} {{ record.customize ? '自定义' : '' }} {{ record.hasProject ? appStore.systemConfig.projectConfigLabel + '名称' : '' }} {{ record.hasProjectCode ? appStore.systemConfig.projectConfigLabel + '编号' : '' }} {{ record.hasIp ? 'IP地址' : '' }}
        {{ record.hasProjectAbbreviation ? appStore.systemConfig.projectConfigLabel + '简称' : '' }}
      </template>
      <template #suffixType="val, record">
        {{ suffixTypeFilter(record.suffixType) }}
      </template>
      <template #suffixLength="val, record">
        {{ record.suffixType === 'RandomString' ? record.suffixLength : '无' }}
      </template>
      <template #currentNum="val, record">
        {{ record.suffixType === 'Number' ? record.currentNum : '无' }}
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate('edit', record)"> <el-icon><Edit /></el-icon> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)"> <el-icon><Delete /></el-icon> 删除 </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" width="1000px" :close-on-click-modal="false" v-if="addDialogVisible" v-model="addDialogVisible">
      <basic-form :model="addData" ref="addFormRef">
        <basic-form-item label="规则名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="组合选项：" prop="type" validate="required">
          <el-checkbox-group v-model="addData.type">
            <el-checkbox v-for="item in typeList" :label="item.value" :key="item.value" border>{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </basic-form-item>
        <basic-form-item label="自定义值：" prop="customize" v-if="addData.type && addData.type.includes('customize')" validate="required">
          <el-input v-model="addData.customize"></el-input>
        </basic-form-item>
        <el-form-item label="后缀类型：">
          <el-radio-group v-model="addData.suffixType">
            <el-radio v-for="item in suffixTypeList" :key="item.value" :label="item.value" border>{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="后缀长度：" prop="suffixLength" v-if="addData.suffixType === 'RandomString'">
          <el-tooltip content="请输入10-20之间的数值" placement="top">
            <el-input-number v-model="addData.suffixLength" :min="10" :max="20" :controls="false" style="width: 100%"></el-input-number>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="当前编号：" prop="currentNum" v-if="addData.suffixType === 'Number'" :disabled="addData.id">
          <el-input-number v-model="addData.currentNum" :min="1" :controls="false" style="width: 100%"></el-input-number>
        </el-form-item>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="ghost" @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores'
import { getNameRule, removeNameRule, createNameRule, modifyNameRule } from 'services/platform/index'

const appStore = useAppStore()

const params = reactive<Record<string, any>>({ page: 1, rows: 10 })
const searchConfigs = [{ label: '名称', value: 'name', type: 'Input' }]
const columns = [
  { label: '名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '组合选项', scopedSlots: { customRender: 'composition' } },
  { label: '自定义值', prop: 'customize', scopedSlots: { customRender: 'customize' } },
  { label: '后缀类型', prop: 'suffixType', scopedSlots: { customRender: 'suffixType' } },
  { label: '后缀长度', prop: 'suffixLength', scopedSlots: { customRender: 'suffixLength' } },
  { label: '当前编号', prop: 'currentNum', scopedSlots: { customRender: 'currentNum' } },
  { label: '操作', disabled: true, width: '160px', scopedSlots: { customRender: 'operate' } }
]

// TODO: type - 命名规则行类型后续补 interface
const list = ref<any[]>([])
const total = ref(0)
const addDialogVisible = ref(false)
const addData = ref<Record<string, any>>({})
const textMap: Record<string, string> = {
  update: '编辑规则',
  create: '添加规则'
}
const dialogStatus = ref<string>('')

const typeList = computed(() => [
  { name: '用户', value: 'hasUser' },
  { name: 'IP地址', value: 'hasIp' },
  { name: appStore.systemConfig.projectConfigLabel + '名称', value: 'hasProject' },
  { name: appStore.systemConfig.projectConfigLabel + '编号', value: 'hasProjectCode' },
  { name: appStore.systemConfig.projectConfigLabel + '简称', value: 'hasProjectAbbreviation' },
  { name: '自定义', value: 'customize' }
])

const suffixTypeList = [
  { name: '毫秒数', value: 'Millis' },
  { name: '随机字符串', value: 'RandomString' },
  { name: '顺序编号', value: 'Number' }
]

const loading = ref(false)
// TODO: type - basic-form 实例类型由 compat 层提供
const addFormRef = ref<any>(null)

function suffixTypeFilter(value: string): string {
  const map: Record<string, string> = {
    Millis: '毫秒数',
    RandomString: '随机字符串',
    Number: '顺序编号'
  }
  return map[value]
}

function handlePostData() {
  const { id, name, type, suffixType, suffixLength, currentNum, customize } = addData.value
  const data: Record<string, any> = {
    id,
    name,
    suffixType,
    suffixLength,
    currentNum,
    hasTenant: false,
    hasUser: false,
    hasBusiness: false,
    hasProject: false,
    hasProjectCode: false,
    hasIp: false,
    hasProjectAbbreviation: false
  }
  ;(type as string[]).forEach((item) => {
    if (item !== 'customize') data[item] = true
  })
  if ((type as string[]).includes('customize')) data.customize = customize
  return data
}

function addSubmit() {
  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      const data = handlePostData()
      const service = data.id ? modifyNameRule : createNameRule
      service(data)
        .then((res: any) => {
          if (res.success) {
            ElMessage.success(res.message)
            addDialogVisible.value = false
            getList()
          }
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}

function handleCreate(type?: string, data?: any) {
  if (type === 'edit') {
    addData.value = Object.assign({}, data, { type: [] })
    ;['hasTenant', 'hasUser', 'hasBusiness', 'hasProject', 'hasProjectCode', 'hasIp', 'hasProjectAbbreviation', 'customize'].forEach((item) => {
      if (addData.value[item]) {
        ;(addData.value.type as string[]).push(item)
      }
    })
    dialogStatus.value = 'update'
    addDialogVisible.value = true
  } else {
    addData.value = {
      suffixLength: 10,
      currentNum: 1,
      suffixType: 'Millis',
      type: []
    }
    dialogStatus.value = 'create'
    addDialogVisible.value = true
  }
}

function remove(id: number | string) {
  ElMessageBox.confirm('此操作将永久删除该规则, 是否继续?', '提示', {
    type: 'warning'
  }).then(() => {
    removeNameRule(id as any).then((data: any) => {
      if (data.success) {
        ElMessage.success(data.message)
        getList()
      }
    })
  })
}

function getList() {
  loading.value = true
  getNameRule(params)
    .then((data: any) => {
      if (data.success) {
        list.value = data.data.rows
        total.value = data.data.total
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function handleSearch(searchParams?: any) {
  params.page = 1
  params.params = searchParams
  getList()
}
void handleSearch
</script>

<style scoped lang="scss">
.wrapper :deep(.el-card__body) {
  padding: 0 !important;
}
.table-container {
  margin-bottom: 0;
}
</style>
