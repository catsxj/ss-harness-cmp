<template>
  <div>
    <common-detail v-if="visible1" :setting="{ type: 'host' }" :title="titleName" @goBack="goBack">
      <template #item_container>
        <AdvanceTable :data="tableData" :search-configs="searchConfigs" :params="params" :columns="columns" :get-list="getData" :total="total" ref="tableRef" @selection-change="handleSelectionChange">
          <template #action>
            <!-- TODO: i18n -->
            <el-button type="primary" @click="open()">新增</el-button>
            <!-- TODO: i18n -->
            <el-button type="primary" @click="confirmBind">关联</el-button>
          </template>
          <!-- TODO: i18n -->
          <template #isEvent="val"> {{ !!val ? '是' : '否' }} </template>
          <template #operate="val, record">
            <!-- TODO: i18n -->
            <el-button text @click="open(record)">编辑</el-button>
            <!-- TODO: i18n -->
            <el-button text @click="delMetric(record.id)">删除</el-button>
          </template>
        </AdvanceTable>
      </template>
    </common-detail>
    <!-- TODO: i18n -->
    <el-dialog width="960px" v-model="dialogVisible" :close-on-click-modal="false" title="指标">
      <basic-form :model="dialogData" label-width="150px" ref="formRef">
        <el-row>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="指标名称" prop="name" validate="required">
              <el-input type="text" v-model="dialogData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="资源类型" prop="resourceType">
              <el-input type="text" :model-value="props.resourceType" disabled></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <!-- TODO: i18n -->
            <basic-form-item label="表达式" prop="expr" validate="required">
              <el-input type="text" v-model="dialogData.expr"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="是否是事件告警" prop="isEvent" validate="required">
              <el-switch v-model="dialogData.isEvent"></el-switch>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="告警名称" prop="alarmName">
              <el-input type="text" v-model="dialogData.alarmName"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="指标分组标签" prop="tag" validate="required">
              <el-input type="text" v-model="dialogData.tag"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="单位" prop="unit">
              <el-input type="text" v-model="dialogData.unit"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <!-- TODO: i18n -->
            <basic-form-item label="规则范围" prop="fun" validate="required">
              <el-checkbox-group v-model="dialogData.fun">
                <el-checkbox v-for="func in funcs" :value="func.value" :key="func.value">{{ func.label }}</el-checkbox>
              </el-checkbox-group>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <template #footer>
        <!-- TODO: i18n -->
        <el-button @click="dialogVisible = false">取消</el-button>
        <!-- TODO: i18n -->
        <el-button type="primary" @click="confirmCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { getMonitorList, getMonitorIds, bindMonitorList, createMetric, updateMetric, deleteMetric } from 'services/services/monitor'
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce } from 'lodash-es'

interface MetricRecord {
  id?: number | string
  name?: string
  expr?: string
  isEvent?: boolean
  alarmName?: string
  tag?: string
  unit?: string
  fun?: string[]
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    visible?: boolean
    resourceType?: string
    titleName?: string
  }>(),
  {
    visible: false,
    resourceType: '',
    titleName: ''
  }
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const columns = [
  { type: 'selection' },
  // TODO: i18n
  { label: '名称', prop: 'name' },
  // TODO: i18n
  { label: '表达式', prop: 'expr' },
  // TODO: i18n
  { label: '是否是事件告警', prop: 'isEvent', scopedSlots: { customRender: 'isEvent' } },
  // TODO: i18n
  { label: '告警名称', prop: 'alarmName' },
  // TODO: i18n
  { label: '标签', prop: 'tag' },
  // TODO: i18n
  { label: '单位', prop: 'unit' },
  // TODO: i18n
  { label: '操作', width: '150px', scopedSlots: { customRender: 'operate' } }
]

const funcs = [
  // TODO: i18n
  { label: '最小值', value: 'min' },
  // TODO: i18n
  { label: '最大值', value: 'max' },
  // TODO: i18n
  { label: '平均值', value: 'avg' }
]

const visible1 = ref(props.visible)
// TODO: type - AdvanceTable 组件实例无公开类型
const tableRef = ref<any>(null)

const state = reactive<{
  tableData: MetricRecord[]
  params: { page: number; rows: number }
  total: number
  dialogData: MetricRecord
  dialogVisible: boolean
}>({
  tableData: [],
  params: {
    page: 1,
    rows: 10
  },
  total: 0,
  dialogData: {},
  dialogVisible: false
})

const selectIds = ref<(number | string)[]>([])

onMounted(async () => {
  getSelectedIds()
})

const getSelectedIds = async () => {
  const { data, success } = await getMonitorIds({ resourceType: props.resourceType })
  if (success) {
    selectIds.value = data
  }
}

const getData = async () => {
  const { data, success } = await getMonitorList(state.params)
  if (success) {
    state.tableData = data.rows
    state.total = data.total
    state.tableData.forEach(async (rows) => {
      if (selectIds.value.includes(rows.id as number | string)) {
        await nextTick()
        tableRef.value?.toggleRowSelection(rows)
      }
    })
  }
}

const handleSelectionChange = debounce((selection: MetricRecord[]) => {
  const selectionIds = selection.map((item) => item.id)
  state.tableData
    .map((item) => item.id)
    .forEach((item) => {
      const idx = selectIds.value.findIndex((el) => el == item)
      if (selectionIds.includes(item)) {
        if (idx < 0) selectIds.value.push(item as number | string)
      } else {
        if (idx >= 0) selectIds.value.splice(idx, 1)
      }
    })
}, 300)

const goBack = () => {
  emit('update:visible', false)
}

const open = (record?: MetricRecord) => {
  state.dialogData = record ?? { fun: [] }
  state.dialogVisible = true
}

// TODO: type - basic-form 组件实例无公开类型
const formRef = ref<any>(null)
const confirmCreate = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const fn = state.dialogData.id ? updateMetric : createMetric
      const { success, message } = await fn(
        { ...state.dialogData, strFun: JSON.stringify(state.dialogData.fun), resourceType: props.resourceType },
        state.dialogData.id
      )
      if (success) {
        ElMessage.success(message)
        state.dialogVisible = false
        getData()
      }
    }
  })
}

const delMetric = async (id: number | string) => {
  // TODO: i18n
  ElMessageBox.confirm('您确定要删除该指标吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    deleteMetric(id).then(({ success, message }) => {
      if (success) {
        ElMessage.success(message)
        getData()
      }
    })
  })
}

const confirmBind = async () => {
  const params = {
    metricIds: selectIds.value,
    resourceType: props.resourceType
  }
  const { success, message } = await bindMonitorList(params)
  if (success) {
    ElMessage.success(message)
  }
}

const searchConfigs = [{ type: 'Const', value: 'resourceType', initValue: props.resourceType }]

defineExpose({ visible1 })
</script>
