<template>
  <div class="basic-table-compat">
    <el-table
      ref="tableRef"
      :data="data"
      v-bind="$attrs"
      v-loading="loading"
      header-cell-class-name="custom-header"
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

<style lang="scss" scoped>
@import '@ss-cmp/design-tokens/src/tokens.scss';

.basic-table-compat {
  // cmp-basic 基准：仅顶部边框
  border-top: 1px solid $cmp-table-border;
  background: #fff;
}

// 表头：custom-header class（对齐 cmp-basic 写法）
.basic-table-compat :deep(.el-table th.el-table__cell.custom-header),
.basic-table-compat :deep(.el-table th.el-table__cell) {
  background: $cmp-table-header-bg;
  color: $cmp-text-body;
  border-bottom: 1px solid $cmp-table-border;

  & > .cell {
    color: $cmp-text-body;
    font-weight: 600;
    font-size: 13px;
  }
}

// 行 hover：cmp-basic 特征色 #EAF3FD
.basic-table-compat :deep(.el-table__body tr:hover > td.el-table__cell),
.basic-table-compat :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: $cmp-table-row-hover-bg !important;
}

// 单元格禁换行
.basic-table-compat :deep(.el-table .cell) {
  white-space: nowrap;
}

// 分页：字号 12px + 右对齐
.basic-table-pagination {
  margin-top: 10px;
  text-align: right;
}

.basic-table-pagination :deep(.el-pagination),
.basic-table-pagination :deep(.el-pagination .el-pagination__total),
.basic-table-pagination :deep(.el-pagination .el-pagination__sizes),
.basic-table-pagination :deep(.el-pagination .el-pagination__jump),
.basic-table-pagination :deep(.el-pagination button),
.basic-table-pagination :deep(.el-pagination .el-pager li) {
  font-size: $cmp-pagination-font-size;
}
</style>
