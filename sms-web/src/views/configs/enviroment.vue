<template>
  <el-card class="wrapper">
    <!-- TODO: cmp-element - 自研包在 compat 层处理：AdvanceTable / basic-form / basic-form-item / basic-table / common-detail / common-detail-item -->
    <AdvanceTable title="环境列表" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template #action>
        <el-button type="primary" @click="handleCreate()">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ record.name }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate('edit', record)"> <el-icon><Edit /></el-icon> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)"> <el-icon><Delete /></el-icon> 删除 </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" v-if="addFlag" v-model="addFlag" width="600px">
      <basic-form :model="addData" ref="addFormRef">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required">
              <el-input v-model="addData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="描述：" prop="remark" maxlength="128">
              <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="addData.remark"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="ghost" @click="addFlag = false">取消</el-button>
          <el-button type="primary" @click="addSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <common-detail v-if="detailFlag" :setting="{ type: 'host' }" :title="detail.name" @goBack="goBack">
      <template #item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="描述">{{ detail.remark }}</common-detail-item>
      </template>
      <el-tabs value="3" class="detail">
        <el-tab-pane label="云平台" name="3">
          <basic-table class="basic-table-detail" :data="vendorData" :params="paramt" :get-list="getVendor" :total="vendorTotal">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
            <el-table-column prop="type" label="平台类型" show-overflow-tooltip></el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getCloudVendor, getEnvironments, removeEnvironments, modifyEnvironments, createEnvironments, detailEnvironments } from 'services/platform/index'

const loading = ref(false)
const detailFlag = ref(false)
const searchConfigs = [{ label: '名称', value: 'name', type: 'Input' }]
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '操作',
    disabled: true,
    width: '200px',
    scopedSlots: { customRender: 'operate' }
  }
]

// TODO: type - 环境详情行类型后续补 interface
const detail = ref<Record<string, any>>({})
const paramt = reactive<Record<string, any>>({ page: 1, rows: 10 })
const vendorData = ref<any[]>([])
const vendorTotal = ref(0)
const params = reactive<Record<string, any>>({ page: 1, rows: 10 })
const tableData = ref<any[]>([])
const total = ref(0)
const addFlag = ref(false)
const addData = ref<Record<string, any>>({})
const textMap: Record<string, string> = {
  update: '编辑所属环境',
  create: '添加所属环境'
}
const dialogStatus = ref<string>('')

// TODO: type - basic-form 实例类型由 compat 层提供
const addFormRef = ref<any>(null)

// 保留计算属性（原代码未使用但保留以防外部引用）
const detailData = computed(() => {
  const data = detail.value
  return Object.assign({}, data.server, data.serverConfig)
})
void detailData

function getDetail(id: number | string) {
  detailEnvironments(id as any).then((data: any) => {
    if (data.success) {
      detail.value = data.data
      detailFlag.value = true
      getVendor()
    }
  })
}

function goBack() {
  detailFlag.value = false
}

function getVendor(page?: number) {
  paramt.page = page || paramt.page
  const vendorParams: Record<string, any> = {
    page: paramt.page,
    rows: paramt.rows
  }
  vendorParams.params = JSON.stringify([
    {
      param: { envId: detail.value.id },
      sign: 'EQ'
    }
  ])
  getCloudVendor(vendorParams).then((data: any) => {
    if (data.success) {
      vendorData.value = data.data.rows
      vendorTotal.value = data.data.total
    }
  })
}

function addSubmit() {
  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      const http = addData.value.id ? modifyEnvironments : createEnvironments
      http(addData.value)
        .then((data: any) => {
          if (data.success) {
            ElMessage.success(data.message)
            addFlag.value = false
            getData()
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
    addData.value = Object.assign({}, data)
    dialogStatus.value = 'update'
    addFlag.value = true
  } else {
    addData.value = {}
    dialogStatus.value = 'create'
    addFlag.value = true
  }
}

function remove(id: number | string) {
  ElMessageBox.confirm('确定删除该环境吗?', '提示', {
    type: 'warning'
  }).then(() => {
    removeEnvironments(id as any).then((data: any) => {
      if (data.success) {
        ElMessage.success(data.message)
        handleSearch()
      }
    })
  })
}

function getData() {
  loading.value = true
  getEnvironments(params)
    .then((data: any) => {
      if (data.success) {
        tableData.value = data.data.rows
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
  getData()
}
</script>

<style scoped lang="scss">
.wrapper :deep(.el-card__body) {
  padding: 0 !important;
}
.detail {
  padding: 20px;
}
</style>
