<template>
  <el-dialog title="用户管理" v-model="props.config.visible" width="800px">
    <el-transfer v-loading="loadLoading" v-model="addData.value" :props="transferProps" :data="addData.data" :titles="['未选择', '已选择']">
      <template #left-footer>
        <div>
          <el-input v-model="name" placeholder="请输入用户名进行搜索">
            <template #append>
              <el-button @click="getLeft">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </template>
    </el-transfer>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="props.config.visible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { tenantCongigUser, getTenantUserTrans } from 'services/system/tenant'
import { getUser } from 'services/system/user'
import { handleSearchParam } from 'utils'

interface TransferConfigItem {
  visible: boolean
  id: number
  value?: any[]
  data?: any[]
}

const props = defineProps<{ config: TransferConfigItem }>()
const emit = defineEmits<{
  success: []
  transferSubmit: [value: any[]]
}>()

const mergeAndDeduplicate = <T extends { id: any }>(arr1: T[], arr2: T[]): T[] => {
  const combined = [...arr1, ...arr2]
  return combined.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
}

const transferProps = { key: 'id', label: 'name' }

const addData = reactive<{ value: any[]; hasData: any[]; data: any[] }>({
  value: [],
  hasData: [],
  data: []
})
const userParams = reactive<any>({ page: 1, rows: 50 })
const name = ref('')
const loadLoading = ref(false)

onMounted(() => {
  getRight()
  getLeft()
})

async function getRight() {
  const res = await getTenantUserTrans(props.config.id, { page: 1, rows: 99999 })
  if (res.success) {
    addData.value = res.data.map((item: any) => item.id)
    addData.hasData = res.data.map(({ id, name }: any) => ({ id, name }))
    addData.data = mergeAndDeduplicate(addData.hasData, addData.data)
  }
}

async function getLeft() {
  userParams.params = handleSearchParam({ 'tenantId:EQ': 0, 'name:LK': name.value })
  loadLoading.value = true
  const res = await getUser(userParams).finally(() => {
    loadLoading.value = false
  })
  if (res.success && res.data) {
    addData.data = mergeAndDeduplicate(
      res.data.rows.map(({ id, name }: any) => ({ id, name })),
      addData.hasData
    )
  }
}

function handleSubmit() {
  const params = { id: props.config.id, ids: addData.value }
  tenantCongigUser(params).then((res: any) => {
    if (res.success) {
      emit('success')
      ElMessage.success(res.message)
      props.config.visible = false
    }
  })
}

function getPostData() {
  return { groupIds: props.config.value }
}

defineExpose({ getPostData })

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
