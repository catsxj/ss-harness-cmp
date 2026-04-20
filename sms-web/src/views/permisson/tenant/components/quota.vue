<template>
  <div class="wrapper_list">
    <el-transfer :props="transferProps" :titles="['未选择', '已选择']" filterable :filter-method="filterMethod" filter-placeholder="请输入搜索内容" v-model="idList" :data="list"> </el-transfer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPoolConditions } from 'services/platform/pool'

// 保留 props 以兼容调用方（catalog/tenantId）
defineProps<{
  catalog?: string
  tenantId?: number
}>()

interface TransferItem {
  id: number
  name: string
}

const transferProps = {
  key: 'id',
  label: 'name'
}
const list = ref<TransferItem[]>([])
const idList = ref<number[]>([])
function filterMethod(query: string, item: TransferItem) {
  return item.name.indexOf(query) > -1
}

onMounted(() => {
  getPoolConditions({
    page: 1,
    rows: 9999,
    condition: JSON.stringify({ condition: 'listAssignGroups' })
  }).then((data: any) => {
    data.data.forEach((item: any) => {
      list.value.push({ id: item.id, name: item.name })
    })
  })
})

function getPostData() {
  return { groupIds: idList.value }
}

defineExpose({ getPostData })
</script>

<style scoped lang="scss">
.wrapper_list {
  display: flex;
  align-items: center;
  justify-content: center;
  .el-transfer {
    :deep(.el-transfer-panel) {
      width: 310px;
      height: 400px;
      .el-transfer-panel__list {
        height: 296px;
      }
    }
    :deep(.el-transfer__buttons) {
      .el-button {
        margin-left: 0;
      }
    }
  }
}
</style>
