<template>
  <!-- TODO: cmp-element - 自研包在 compat 层处理：basic-form / basic-form-item -->
  <div>
    <el-row>
      <el-transfer v-loading="loadLoading" v-model="addData.value" :props="transferProps" :data="addData.data" :titles="['未选择', '已选择']">
        <template #left-footer>
          <el-input v-model="name" placeholder="请输入用户名进行搜索">
            <template #append>
              <el-button @click="getLeft">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </template>
      </el-transfer>
    </el-row>
    <el-row style="margin: 30px 0 0">
      <el-col :span="12">
        <basic-form :model="addData" ref="addFormRef">
          <basic-form-item :label="appStore.systemConfig.projectConfigLabel + '经理: '" validate="required" prop="mangerIds">
            <el-select v-model="addData.mangerIds" multiple placeholder="请选择" collapse-tags clearable>
              <el-option v-for="item in getProjectManger" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
        </basic-form>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { handleSearchParam } from 'utils'
import { useAppStore } from '@/stores'
import { getUser } from 'services/system/user'
import { settingProjectUser } from 'services/system/project'

interface MemberItem {
  id: number | string
  name: string
}
interface MemberConfig {
  visibility: boolean
  id: number | string
}

const props = defineProps<{ config?: MemberConfig }>()
const emit = defineEmits<{ success: [] }>()
void emit

const appStore = useAppStore()

const mergeAndDeduplicate = (arr1: MemberItem[], arr2: MemberItem[]) => {
  const combined = [...arr1, ...arr2]
  return combined.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
}

const transferProps = { key: 'id', label: 'name' }

const addData = reactive<{
  value: Array<number | string>
  hasData: MemberItem[]
  data: MemberItem[]
  mangerIds: Array<number | string>
}>({
  value: [],
  hasData: [],
  data: [],
  mangerIds: []
})

const userParams = reactive<Record<string, any>>({ page: 1, rows: 50 })
const name = ref('')
const loading = ref(false)
const loadLoading = ref(false)

// TODO: type - basic-form 实例类型由 compat 层提供
const addFormRef = ref<any>(null)

const getProjectManger = computed<MemberItem[]>(() =>
  addData.data.filter(({ id }) => addData.value.includes(id))
)

async function getLeft() {
  userParams.params = handleSearchParam({ 'name:LK': name.value })
  loadLoading.value = true
  const res = await getUser(userParams).finally(() => {
    loadLoading.value = false
  })
  if (res.success && res.data) {
    addData.data = mergeAndDeduplicate(
      res.data.rows.map(({ id, name }: MemberItem) => ({ id, name })),
      addData.hasData
    )
  }
}

function getPostData(): { managerIds: Array<number | string>; userIds: Array<number | string> } | false {
  let data: { managerIds: Array<number | string>; userIds: Array<number | string> } | false = false
  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      const managerIds = addData.mangerIds
      const userIds = addData.value.filter((item) => !managerIds.includes(item))
      data = { managerIds, userIds }
    }
  })
  return data
}

async function handleSubmit() {
  if (!props.config) return
  const managerIds = addData.mangerIds
  const userIds = addData.value.filter((item) => !managerIds.includes(item))
  loading.value = true
  const res = await settingProjectUser(props.config.id as any, { userIds, managerIds }).finally(() => {
    loading.value = false
  })
  if (res.success) {
    ElMessage.success(res.message)
    emit('success')
    props.config.visibility = false
  }
}
void handleSubmit

onMounted(() => {
  getLeft()
})

defineExpose({ getPostData, addData })
</script>

<style scoped lang="scss">
.el-transfer {
  display: flex;
  justify-content: center;
  align-items: center;
  :deep(.el-transfer__buttons) {
    width: 50px;
    box-sizing: content-box;
    .el-button {
      margin-left: 0;
    }
  }
  :deep(.el-transfer-panel) {
    width: 250px;
    .is-with-footer {
      padding-top: 50px;
      padding-bottom: 0;
    }
    .el-transfer-panel__item {
      z-index: 10;
    }
    .el-transfer-panel__footer {
      position: absolute;
      top: 50px;
      border: none;
      margin: 0 15px;
      width: auto;
      text-align: center;
      display: block;
      .el-input__inner {
        height: 32px;
        width: 100%;
        font-size: 12px;
        display: inline-block;
      }
    }
  }
}
</style>
