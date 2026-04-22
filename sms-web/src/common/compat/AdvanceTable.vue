<template>
  <section class="atbl" :class="{ 'atbl--borderless': !cardBorder }">
    <!-- 标题单独一行 -->
    <header v-if="showTools && title" class="atbl__head">
      <h2 class="atbl__title">{{ title }}</h2>
    </header>
    <!-- 操作按钮独立一行 -->
    <div v-if="showTools && $slots.action" class="atbl__actions">
      <slot name="action"></slot>
    </div>

    <!-- 搜索栏：条件 + 按钮同一行，无背景 -->
    <div v-if="showTools && hasSearch" class="atbl__search">
      <template v-for="cfg in searchConfigs" :key="cfg.value">
        <el-input
          v-if="cfg.type === 'Input'"
          v-model="listQuery[cfg.value]"
          :placeholder="cfg.label"
          clearable
          class="atbl__search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-else-if="cfg.type === 'Select'"
          v-model="listQuery[cfg.value]"
          :placeholder="cfg.label"
          clearable
          filterable
          class="atbl__search-input"
          @change="handleSearch"
          @clear="handleSearch"
        >
          <el-option v-for="opt in cfg.data || []" :key="opt.id" :label="opt.name" :value="opt.id" />
        </el-select>
        <el-date-picker
          v-else-if="cfg.type === 'DateRange'"
          v-model="listQuery[cfg.value]"
          type="daterange"
          range-separator="–"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始"
          end-placeholder="结束"
          class="atbl__search-input atbl__search-input--range"
          style="width: 240px"
          @change="handleSearch"
        />
        <el-date-picker
          v-else-if="cfg.type === 'DatePicker'"
          v-model="listQuery[cfg.value]"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="cfg.label"
          class="atbl__search-input"
          @change="handleSearch"
        />
      </template>
      <button type="button" class="atbl__btn atbl__btn--solid" @click="handleSearch">查询</button>
      <button type="button" class="atbl__btn atbl__btn--ghost" @click="handleReset">重置</button>
    </div>

    <!-- 表格主体 -->
    <div class="atbl__body">
      <el-table
        ref="tableRef"
        :data="data"
        v-loading="loading"
        :border="border"
        :height="height"
        :row-key="rowKey"
        :tree-props="treeProps"
        :lazy="lazy"
        :load="load"
        class="atbl__table"
        @selection-change="onSelectionChange"
        @sort-change="onSortChange"
        @row-click="(row: any, column: any, event: Event) => emit('row-click', row, column, event)"
        @cell-click="(row: any, column: any, cell: any, event: Event) => emit('cell-click', row, column, cell, event)"
        @row-contextmenu="(row: any, column: any, event: Event) => emit('row-contextmenu', row, column, event)"
        @current-change="(c: any, o: any) => emit('current-change', c, o)"
        @expand-change="(row: any, expanded: any) => emit('expand-change', row, expanded)"
      >
        <template v-for="(col, idx) in normalizedColumns" :key="(col.prop || col.label || '') + '_' + idx">
          <el-table-column
            v-if="col.type === 'selection'"
            type="selection"
            width="55"
            :reserve-selection="reserveSelection"
          />
          <el-table-column
            v-else-if="col.type === 'index'"
            type="index"
            :width="col.width || 60"
            :label="col.label || '#'"
          />
          <el-table-column
            v-else-if="col.scopedSlots && col.scopedSlots.customRender"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :align="col.align || 'left'"
            :sortable="col.sortable"
            :show-overflow-tooltip="col.showOverflowTooltip !== false"
            :fixed="col.fixed"
          >
            <template #default="scope">
              <slot
                :name="col.scopedSlots.customRender"
                :val="col.prop ? scope.row[col.prop] : undefined"
                :record="scope.row"
                :index="scope.$index"
              >{{ col.prop ? scope.row[col.prop] : '' }}</slot>
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="typeof col.customRender === 'function'"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :align="col.align || 'left'"
            :sortable="col.sortable"
            :show-overflow-tooltip="col.showOverflowTooltip !== false"
            :fixed="col.fixed"
          >
            <template #default="scope">
              {{ col.customRender!(col.prop ? scope.row[col.prop] : undefined, scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            v-else
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :align="col.align || 'left'"
            :sortable="col.sortable"
            :show-overflow-tooltip="col.showOverflowTooltip !== false"
            :fixed="col.fixed"
          />
        </template>
        <slot></slot>

        <!-- 空态插入 -->
        <template #empty>
          <div class="atbl__empty">
            <div class="atbl__empty-mark">∅</div>
            <div class="atbl__empty-text">暂无数据</div>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 分页 -->
    <slot name="pagination">
      <div v-if="showPagination && total > 0" class="atbl__foot">
        <div class="atbl__foot-meta">
          共 <strong>{{ total }}</strong> 条
        </div>
        <div class="atbl__foot-right">
          <div class="atbl__size">
            <span class="atbl__size-label">每页</span>
            <el-select
              v-model="rowSize"
              size="default"
              class="atbl__size-select"
              @change="onSizeChange"
            >
              <el-option v-for="s in [10, 20, 50, 100]" :key="s" :label="String(s)" :value="s" />
            </el-select>
          </div>
          <nav class="atbl__pages" aria-label="分页">
            <button
              class="atbl__page-btn"
              type="button"
              :disabled="pageNum <= 1"
              @click="onPageChange(pageNum - 1)"
              aria-label="上一页"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button
              v-for="p in pageNumbers"
              :key="p.key"
              class="atbl__page-btn"
              :class="{ 'is-active': p.value === pageNum, 'is-ellipsis': p.ellipsis }"
              type="button"
              :disabled="p.ellipsis"
              @click="p.ellipsis ? null : onPageChange(p.value)"
            >{{ p.label }}</button>
            <button
              class="atbl__page-btn"
              type="button"
              :disabled="pageNum >= totalPages"
              @click="onPageChange(pageNum + 1)"
              aria-label="下一页"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </nav>
          <div class="atbl__jump">
            跳至
            <input
              type="text"
              inputmode="numeric"
              class="atbl__jump-input"
              :value="pageNum"
              @keyup.enter="onJumpInput"
              @blur="onJumpInput"
            />
            页
          </div>
        </div>
      </div>
    </slot>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

interface Column {
  type?: 'selection' | 'index' | string
  prop?: string
  label?: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean | 'custom'
  showOverflowTooltip?: boolean
  checked?: boolean
  disabled?: boolean
  fixed?: boolean | 'left' | 'right'
  scopedSlots?: { customRender?: string }
  customRender?: (val: any, row?: any) => any
}

interface SearchConfig {
  type: 'Input' | 'Select' | 'DateRange' | 'DatePicker'
  label?: string
  value: string
  data?: Array<{ id: any; name: string }>
}

interface Params {
  page?: number
  rows?: number
  params?: string
  [key: string]: any
}

const props = withDefaults(
  defineProps<{
    title?: string
    data?: any[]
    columns?: Column[]
    params?: Params
    total?: number
    loading?: boolean
    getList?: (page?: number) => void
    searchConfigs?: SearchConfig[]
    cardBorder?: boolean
    border?: boolean
    showTools?: boolean
    showPagination?: boolean
    reserveSelection?: boolean
    autoLoad?: boolean
    height?: string | number
    rowKey?: string | ((row: any) => string)
    treeProps?: Record<string, any>
    lazy?: boolean
    load?: (row: any, treeNode: any, resolve: (rows: any[]) => void) => void
    beforeSearch?: (ctx: { handleSearch: () => void; listQuery: Record<string, any> }) => void
  }>(),
  {
    data: () => [],
    columns: () => [],
    total: 0,
    loading: false,
    searchConfigs: () => [],
    cardBorder: true,
    border: false,
    showTools: true,
    showPagination: true,
    reserveSelection: false,
    autoLoad: true
  }
)

const emit = defineEmits<{
  'selection-change': [rows: any[]]
  'sort-change': [ctx: { prop: string; order: string }]
  'row-click': [row: any, column: any, event: Event]
  'cell-click': [row: any, column: any, cell: any, event: Event]
  'row-contextmenu': [row: any, column: any, event: Event]
  'current-change': [current: any, oldCurrent: any]
  'expand-change': [row: any, expanded: any]
}>()

const tableRef = ref<any>(null)

const normalizedColumns = computed(() => props.columns || [])
const hasSearch = computed(() => (props.searchConfigs?.length || 0) > 0)

const listQuery = reactive<Record<string, any>>({})
watch(
  () => props.searchConfigs,
  (cfgs) => {
    if (!cfgs) return
    cfgs.forEach((c) => {
      if (listQuery[c.value] === undefined) listQuery[c.value] = ''
    })
  },
  { immediate: true, deep: true }
)

const pageNum = ref(props.params?.page || 1)
const rowSize = ref(props.params?.rows || 10)
const totalPages = computed(() => Math.max(1, Math.ceil((props.total || 0) / (rowSize.value || 10))))

watch(
  () => props.params,
  (p) => {
    if (p?.page && p.page !== pageNum.value) pageNum.value = p.page
    if (p?.rows && p.rows !== rowSize.value) rowSize.value = p.rows
  },
  { deep: true }
)

function buildSearchParams(): void {
  if (!props.params) return
  const eqParam: Record<string, any> = {}
  const extra: Array<{ param: Record<string, any>; sign: string }> = []
  ;(props.searchConfigs || []).forEach((c) => {
    const v = listQuery[c.value]
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) return
    if (c.type === 'DateRange' && Array.isArray(v)) {
      const [start, end] = v
      if (start) extra.push({ param: { [c.value]: start }, sign: 'GE' })
      if (end) extra.push({ param: { [c.value]: end }, sign: 'LE' })
    } else {
      eqParam[c.value] = v
    }
  })
  const arr: Array<{ param: Record<string, any>; sign: string }> = []
  if (Object.keys(eqParam).length > 0) arr.push({ param: eqParam, sign: 'LIKE' })
  arr.push(...extra)
  ;(props.params as any).params = arr.length > 0 ? JSON.stringify(arr) : undefined
}

function doFetch(page?: number): void {
  if (props.params && page !== undefined) (props.params as any).page = page
  props.getList?.(page)
}

function handleSearch(): void {
  buildSearchParams()
  if (props.params) (props.params as any).page = 1
  pageNum.value = 1
  doFetch(1)
}

function handleReset(): void {
  Object.keys(listQuery).forEach((k) => {
    listQuery[k] = ''
  })
  handleSearch()
}

watch(
  () => ({ ...listQuery }),
  () => {
    if (typeof props.beforeSearch === 'function') {
      props.beforeSearch({ handleSearch, listQuery })
    }
  },
  { deep: true }
)

function onPageChange(p: number): void {
  if (props.params) (props.params as any).page = p
  doFetch(p)
}

function onSizeChange(s: number): void {
  if (props.params) {
    ;(props.params as any).rows = s
    ;(props.params as any).page = 1
  }
  pageNum.value = 1
  doFetch(1)
}

// 生成页码按钮数组（带省略号）
const pageNumbers = computed(() => {
  const cur = pageNum.value
  const tot = totalPages.value
  const nums: Array<{ key: string; label: string; value: number; ellipsis?: boolean }> = []
  const push = (n: number) => nums.push({ key: `p${n}`, label: String(n), value: n })
  const gap = (k: string) => nums.push({ key: k, label: '…', value: 0, ellipsis: true })
  if (tot <= 7) {
    for (let i = 1; i <= tot; i++) push(i)
  } else if (cur <= 4) {
    for (let i = 1; i <= 5; i++) push(i)
    gap('g1')
    push(tot)
  } else if (cur >= tot - 3) {
    push(1)
    gap('g1')
    for (let i = tot - 4; i <= tot; i++) push(i)
  } else {
    push(1)
    gap('g1')
    for (let i = cur - 1; i <= cur + 1; i++) push(i)
    gap('g2')
    push(tot)
  }
  return nums
})

function onJumpInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  const n = parseInt(v, 10)
  if (!isNaN(n) && n >= 1 && n <= totalPages.value && n !== pageNum.value) {
    onPageChange(n)
  } else {
    ;(e.target as HTMLInputElement).value = String(pageNum.value)
  }
}

function onSelectionChange(rows: any[]): void { emit('selection-change', rows) }
function onSortChange(ctx: { prop: string; order: string }): void { emit('sort-change', ctx) }

function toggleRowSelection(row: any | any[], selected?: boolean): void {
  if (!tableRef.value) return
  if (Array.isArray(row)) row.forEach((r) => tableRef.value!.toggleRowSelection(r, selected))
  else tableRef.value.toggleRowSelection(row, selected)
}
function clearSelection(): void { tableRef.value?.clearSelection?.() }
function toggleAllSelection(): void { tableRef.value?.toggleAllSelection?.() }
function setCurrentRow(row?: any): void { tableRef.value?.setCurrentRow?.(row) }
function toggleRowExpansion(row: any, expanded?: boolean): void { tableRef.value?.toggleRowExpansion?.(row, expanded) }
function clearSort(): void { tableRef.value?.clearSort?.() }
function clearFilter(columnKeys?: string[]): void { tableRef.value?.clearFilter?.(columnKeys) }
function doLayout(): void { tableRef.value?.doLayout?.() }
function sort(prop: string, order: string): void { tableRef.value?.sort?.(prop, order) }

onMounted(() => {
  if (props.autoLoad && !props.lazy && typeof props.getList === 'function') doFetch()
})

defineExpose({
  tableRef,
  handleSearch,
  handleReset,
  toggleRowSelection,
  clearSelection,
  toggleAllSelection,
  setCurrentRow,
  toggleRowExpansion,
  clearSort,
  clearFilter,
  doLayout,
  sort
})
</script>

<style lang="scss" scoped>
@import './tokens';

.atbl {
  // 统一 Element Plus 令牌到 Technical Precision 体系
  --el-color-primary: #{$accent};
  --el-color-primary-light-3: #{$accent-hover};
  --el-color-primary-light-5: #{$accent-soft};
  --el-color-primary-light-7: #{$accent-soft};
  --el-color-primary-light-9: #{$accent-soft};
  --el-border-color: #{$border-hairline};
  --el-border-color-hover: #{$border-solid};
  --el-border-color-light: #{$border-hairline};
  --el-border-color-lighter: #{$border-hairline};
  --el-fill-color: #{$bg-subtle};
  --el-fill-color-light: #{$bg-subtle};
  --el-fill-color-blank: #{$bg-surface};
  --el-text-color-primary: #{$text-primary};
  --el-text-color-regular: #{$text-secondary};
  --el-text-color-secondary: #{$text-muted};
  --el-text-color-placeholder: #{$text-muted};
  --el-component-size: 32px;
  --el-border-radius-base: 4px;
  --el-font-size-base: 13px;

  background: $bg-surface;
  border: 1px solid $border-hairline;
  border-radius: 6px;
  box-shadow: $shadow-subtle;
  overflow: hidden;
  font-family: $font-body;

  &--borderless {
    border: none;
    box-shadow: none;
    background: transparent;
  }

  // 统一所有输入类组件高度为 32，克制边框，蓝色 focus 环
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select__wrapper),
  :deep(.el-date-editor.el-input),
  :deep(.el-date-editor.el-input__wrapper),
  :deep(.el-date-editor.el-range-editor) {
    box-shadow: 0 0 0 1px $border-hairline inset;
    background: $bg-surface;
    border-radius: 4px;
    min-height: 32px;
    transition: box-shadow $dur-fast $ease-out;

    &:hover {
      box-shadow: 0 0 0 1px $border-solid inset;
    }
    &.is-focus,
    &:focus-within {
      box-shadow: 0 0 0 1px $accent inset, 0 0 0 3px $accent-soft !important;
    }
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-editor) {
    --el-input-height: 32px;
    --el-component-size: 32px;
    height: 32px;
    line-height: 32px;
  }

  :deep(.el-input__inner),
  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item),
  :deep(.el-range-input) {
    font-size: 13px;
    color: $text-primary;
    line-height: 30px;
  }

  :deep(.el-input__inner) {
    height: 30px;
  }

  // el-button 全部样式重做（action slot 用户使用 el-button）
  :deep(.el-button) {
    --el-button-bg-color: #{$bg-surface};
    --el-button-text-color: #{$text-secondary};
    --el-button-border-color: #{$border-hairline};
    --el-button-hover-bg-color: #{$bg-subtle};
    --el-button-hover-text-color: #{$text-primary};
    --el-button-hover-border-color: #{$border-emphasis};
    --el-button-active-bg-color: #{$bg-inset};
    --el-button-active-text-color: #{$text-primary};
    --el-button-active-border-color: #{$border-emphasis};

    height: 32px;
    padding: 0 14px;
    font-family: $font-body;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
    border-radius: 4px;
    transition: all $dur-fast $ease-out;

    &:active { transform: translateY(1px); }

    &.is-text,
    &.el-button--text,
    &.is-link,
    &.el-button.is-link {
      border: none;
      padding: 0 4px;
      height: 28px;
      background: transparent;
      color: $accent;
      font-size: 12px;
      &:hover { color: $accent-hover; background: transparent; }
    }
  }

  :deep(.el-button--primary) {
    --el-button-bg-color: #{$accent};
    --el-button-text-color: #{$text-inverse};
    --el-button-border-color: #{$accent};
    --el-button-hover-bg-color: #{$accent-hover};
    --el-button-hover-text-color: #{$text-inverse};
    --el-button-hover-border-color: #{$accent-hover};
    --el-button-active-bg-color: #{$accent-hover};
    --el-button-active-border-color: #{$accent-hover};
  }

  :deep(.el-button--danger) {
    --el-button-bg-color: #{$status-danger};
    --el-button-border-color: #{$status-danger};
    --el-button-hover-bg-color: #b91c1c;
    --el-button-hover-border-color: #b91c1c;
  }

  // el-dropdown 与 text/link 按钮对齐（同高 28px、同 12px、同蓝色）
  :deep(.el-dropdown) {
    display: inline-flex;
    vertical-align: middle;
    line-height: 28px;
  }

  :deep(.el-dropdown-link) {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: 28px;
    font-size: 12px;
    color: $accent;
    cursor: pointer;
    outline: none;
    transition: color $dur-fast $ease-out;
    &:hover { color: $accent-hover; }
  }

  // 表格中的文本链接（.detail-href）
  :deep(.detail-href) {
    color: $accent;
    cursor: pointer;
    transition: color $dur-fast $ease-out;
    &:hover {
      color: $accent-hover;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  // 表格操作分割线
  :deep(.action-divider) {
    display: inline-block;
    width: 1px;
    height: 12px;
    background: $border-hairline;
    margin: 0 6px;
    vertical-align: middle;
  }
}

// 标题行
.atbl__head {
  padding: 20px 24px 12px;
}

.atbl__title {
  margin: 0;
  font-family: $font-display;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: $tracking-tight;
  color: $text-primary;
}

// 操作按钮行 — 统一小号尺寸
.atbl__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 0 24px 14px;

  :deep(.el-button) {
    height: 28px !important;
    padding: 0 12px !important;
    font-size: 12px !important;
  }
}

// 搜索：单行，无背景色，按钮紧跟在条件后
.atbl__search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  padding: 14px 24px;
  border-bottom: 1px solid $border-hairline;
}

.atbl__search-input {
  width: 180px;
  flex-shrink: 0;

  &--range {
    width: 240px !important;
  }
}

// el-date-picker daterange：覆盖 Element Plus CSS 变量 + 穿透内部
.atbl__search {
  --el-date-editor-daterange-width: 240px;
  --el-date-editor-monthrange-width: 240px;
}

.atbl__search :deep(.el-date-editor.el-input),
.atbl__search :deep(.el-date-editor.el-input__wrapper),
.atbl__search :deep(.el-date-editor.el-range-editor),
.atbl__search :deep(.el-date-editor--daterange),
.atbl__search :deep(.el-date-editor--datetimerange) {
  width: 240px !important;
  min-width: 0 !important;
  max-width: 240px !important;
  padding-left: 8px;
  padding-right: 8px;
}

.atbl__search :deep(.el-range-editor .el-range-input) {
  min-width: 0 !important;
  width: 88px !important;
  font-size: 12px;
}
.atbl__search :deep(.el-range-editor .el-range-separator) {
  padding: 0 2px;
  line-height: 28px;
  color: $text-muted;
  flex-shrink: 0;
  width: 12px;
  min-width: 12px;
}
.atbl__search :deep(.el-range-editor .el-range__close-icon),
.atbl__search :deep(.el-range-editor .el-range__icon) {
  width: 14px;
  margin-left: 0;
  flex-shrink: 0;
}

.atbl__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  font-family: $font-body;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all $dur-fast $ease-out;
  border: 1px solid transparent;

  &:active { transform: translateY(1px); }

  &--solid {
    background: $accent;
    color: $text-inverse;
    border-color: $accent;
    &:hover { background: $accent-hover; border-color: $accent-hover; }
  }
  &--ghost {
    background: transparent;
    color: $text-secondary;
    border-color: $border-solid;
    &:hover { background: $bg-subtle; color: $text-primary; border-color: $border-emphasis; }
  }
}

// 表格主体
.atbl__body {
  padding: 0;
}

.atbl__table :deep(.el-table) {
  --el-table-border-color: #{$border-hairline};
  --el-table-header-bg-color: #{$bg-surface};
  --el-table-header-text-color: #{$text-muted};
  --el-table-row-hover-bg-color: #{$bg-subtle};
  --el-table-text-color: #{$text-primary};
  background: $bg-surface;
  font-family: $font-body;
  font-size: 13px;
  color: $text-primary;
}

.atbl__table :deep(.el-table th.el-table__cell) {
  background: $bg-subtle;
  border-bottom: 1px solid $border-solid;
  padding: 14px 0;

  & > .cell {
    font-family: $font-body;
    font-size: 12px;
    font-weight: 600;
    color: $text-secondary;
    line-height: 1.4;
  }
}

.atbl__table :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid $border-hairline;
  padding: 16px 0;
  font-variant-numeric: tabular-nums;
  transition: background $dur-fast $ease-out;
}

.atbl__table :deep(.el-table__row):hover > td.el-table__cell {
  background: $bg-subtle !important;
}

.atbl__table :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background: $bg-subtle;
}

.atbl__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  color: $text-muted;
}

.atbl__empty-mark {
  font-family: $font-display;
  font-size: 48px;
  color: $border-solid;
  line-height: 1;
  margin-bottom: 8px;
}

.atbl__empty-text {
  font-size: 12px;
  letter-spacing: $tracking-wide;
  text-transform: uppercase;
}

// 分页区
.atbl__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid $border-hairline;
  background: $bg-surface;
  gap: 24px;
  font-family: $font-body;
  font-size: 13px;
  color: $text-secondary;
}

.atbl__foot-meta {
  strong {
    font-family: $font-mono;
    font-weight: 600;
    color: $text-primary;
    margin: 0 2px;
    font-variant-numeric: tabular-nums;
  }
}

.atbl__foot-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

// 每页 select
.atbl__size {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: $text-secondary;
}
.atbl__size-label { color: $text-muted; }
.atbl__size-select {
  width: 78px;
}

// 自定义页码
.atbl__pages {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.atbl__page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid $border-hairline;
  background: $bg-surface;
  color: $text-secondary;
  font-family: $font-mono;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  border-radius: 4px;
  cursor: pointer;
  transition: all $dur-fast $ease-out;

  &:hover:not(:disabled):not(.is-ellipsis) {
    border-color: $accent;
    color: $accent;
    background: $accent-soft;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    color: $text-muted;
    background: $bg-subtle;
    cursor: not-allowed;
    opacity: 0.5;
  }

  &.is-active {
    background: $accent !important;
    border-color: $accent !important;
    color: $text-inverse !important;
    cursor: default;
  }

  &.is-ellipsis {
    border: none;
    background: transparent;
    cursor: default;
    color: $text-muted;
  }
}

// 跳转
.atbl__jump {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: $text-muted;
}
.atbl__jump-input {
  width: 44px;
  height: 32px;
  border: 1px solid $border-hairline;
  border-radius: 4px;
  background: $bg-surface;
  color: $text-primary;
  text-align: center;
  font-family: $font-mono;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  outline: none;
  transition: border-color $dur-fast $ease-out;

  &:focus {
    border-color: $accent;
    box-shadow: 0 0 0 2px $accent-soft;
  }

  &:hover:not(:focus) {
    border-color: $border-solid;
  }
}

</style>
