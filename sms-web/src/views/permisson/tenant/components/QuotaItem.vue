<template>
  <div class="m-b">
    <!-- TODO: cmp-element basic-table -->
    <basic-table ref="tableRef" :data="props.quotaData">
      <el-table-column show-overflow-tooltip label="配额属性" prop="name"> </el-table-column>
      <el-table-column label="配额值">
        <template #default="scope">
          <el-input-number v-model="scope.row.quota" :min="scope.row.minQuota" :max="scope.row.maxQuota"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="配额范围">
        <template #default="scope">
          <span>{{ scope.row.minQuota }} - {{ scope.row.maxQuota }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="单位" prop="unit"> </el-table-column>
      <template #pagination><div></div></template>
    </basic-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  quotaData: any[]
}>()

const tableRef = ref<any>(null)

function getPostData() {
  return props.quotaData
}

defineExpose({ getPostData })
</script>
