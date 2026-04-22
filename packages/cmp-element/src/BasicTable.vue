<template>
  <div class="basic-table-compat">
    <el-table
      ref="tableRef"
      :data="data"
      v-bind="$attrs"
      v-loading="loading"
      @select="(sel: any[], row: any) => emit('select', sel, row)"
      @select-all="(sel: any[]) => emit('select-all', sel)"
      @selection-change="(sel: any[]) => emit('selection-change', sel)"
    >
      <slot></slot>
    </el-table>
    <slot name="pagination">
      <div v-if="showPagination" class="basic-table-pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="rowSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="onPageChange"
          @size-change="onSizeChange"
          background
          size="small"
        />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    data?: any[]
    params?: { page?: number; rows?: number; [key: string]: any }
    total?: number
    loading?: boolean
    getList?: (page?: number) => void
    showPagination?: boolean
  }>(),
  { data: () => [], total: 0, loading: false, showPagination: true }
)

const emit = defineEmits<{
  select: [selection: any[], row: any]
  'select-all': [selection: any[]]
  'selection-change': [selection: any[]]
}>()

const tableRef = ref<any>(null)
const pageNum = ref(props.params?.page || 1)
const rowSize = ref(props.params?.rows || 10)

watch(
  () => props.params,
  (p) => {
    if (p?.page) pageNum.value = p.page
    if (p?.rows) rowSize.value = p.rows
  },
  { deep: true }
)

function onPageChange(p: number) {
  if (props.params) (props.params as any).page = p
  props.getList?.(p)
}

function onSizeChange(s: number) {
  if (props.params) {
    ;(props.params as any).rows = s
    ;(props.params as any).page = 1
  }
  props.getList?.(1)
}

// 转发 el-table 原生方法
defineExpose({
  tableRef,
  basicTable: tableRef, // cmp-element 文档：通过 $refs.xx.$refs.basicTable 访问
  setCurrentRow: (row?: any) => tableRef.value?.setCurrentRow?.(row),
  toggleRowSelection: (row: any, selected?: boolean) => tableRef.value?.toggleRowSelection?.(row, selected),
  clearSelection: () => tableRef.value?.clearSelection?.(),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection?.(),
  toggleRowExpansion: (row: any, expanded?: boolean) => tableRef.value?.toggleRowExpansion?.(row, expanded),
  clearSort: () => tableRef.value?.clearSort?.(),
  clearFilter: (columnKeys?: string[]) => tableRef.value?.clearFilter?.(columnKeys),
  doLayout: () => tableRef.value?.doLayout?.(),
  sort: (prop: string, order: string) => tableRef.value?.sort?.(prop, order)
})
</script>

<style scoped>
.basic-table-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
