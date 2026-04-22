<template>
  <div class="tbls">
    <div v-if="isOperateTop && $slots.operate" class="tbls__operate tbls__operate--top">
      <slot name="operate" />
    </div>
    <div class="tbls__bar">
      <template v-for="cfg in configs" :key="cfg.value">
        <el-input
          v-if="cfg.type === 'Input'"
          v-model="query[cfg.value]"
          :placeholder="cfg.label"
          clearable
          class="tbls__input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-else-if="cfg.type === 'Select'"
          v-model="query[cfg.value]"
          :placeholder="cfg.label"
          clearable
          filterable
          class="tbls__input"
          @change="(val: unknown) => handleFieldChange(cfg, val)"
          @clear="handleSearch"
        >
          <el-option
            v-for="opt in (cfg.data || []) as Record<string, unknown>[]"
            :key="optKey(opt, cfg)"
            :label="optLabel(opt, cfg)"
            :value="optValue(opt, cfg)"
          />
        </el-select>
        <el-date-picker
          v-else-if="cfg.type === 'Date'"
          v-model="query[cfg.value]"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="cfg.label"
          class="tbls__input"
          @change="handleSearch"
        />
        <el-date-picker
          v-else-if="cfg.type === 'DateRange'"
          v-model="query[cfg.value]"
          type="daterange"
          range-separator="–"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始"
          end-placeholder="结束"
          class="tbls__input tbls__input--range"
          @change="handleSearch"
        />
        <el-cascader
          v-else-if="cfg.type === 'Cascade'"
          v-model="query[cfg.value]"
          :options="cfg.data || []"
          :props="cascaderProps(cfg)"
          clearable
          filterable
          class="tbls__input"
          @change="(val: unknown) => handleFieldChange(cfg, val)"
        />
        <!-- Const: 不渲染 UI，固定值仅参与搜索参数 -->
      </template>
      <button type="button" class="tbls__btn tbls__btn--solid" @click="handleSearch">查询</button>
      <button type="button" class="tbls__btn tbls__btn--ghost" @click="handleReset">重置</button>
      <div v-if="!isOperateTop && $slots.operate" class="tbls__operate tbls__operate--inline">
        <slot name="operate" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'

type SearchType = 'Input' | 'Select' | 'Date' | 'DateRange' | 'Cascade' | 'Const'

interface ServiceConfig {
  api?: (params: Record<string, unknown>) => Promise<{ success?: boolean; data?: unknown }>
  params?: Record<string, unknown>
  attr?: string
}

interface FieldPropsConfig {
  label?: string
  value?: string
}

interface SearchConfig {
  type: SearchType
  label?: string
  value: string
  initValue?: unknown
  data?: unknown[]
  onChange?: (ctx: { val: unknown; listQuery: Record<string, unknown> }) => void
  service?: ServiceConfig
  sign?: string
  props?: FieldPropsConfig
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    configs?: SearchConfig[]
    onSearch?: (params: string | undefined) => void
    isInitSearch?: boolean
    isOperateTop?: boolean
  }>(),
  {
    configs: () => [],
    onSearch: undefined,
    isInitSearch: true,
    isOperateTop: false
  }
)

const emit = defineEmits<{ search: [params: string | undefined] }>()

const query = reactive<Record<string, unknown>>({})

function fieldProps(cfg: SearchConfig): { label: string; value: string } {
  return {
    label: cfg.props?.label || 'name',
    value: cfg.props?.value || 'id'
  }
}

function optKey(opt: Record<string, unknown>, cfg: SearchConfig): string {
  return String(opt[fieldProps(cfg).value])
}

function optLabel(opt: Record<string, unknown>, cfg: SearchConfig): string {
  return String(opt[fieldProps(cfg).label])
}

function optValue(opt: Record<string, unknown>, cfg: SearchConfig): string | number {
  const v = opt[fieldProps(cfg).value]
  return typeof v === 'number' ? v : String(v)
}

function cascaderProps(cfg: SearchConfig) {
  const fp = fieldProps(cfg)
  return { label: fp.label, value: fp.value, children: 'children', checkStrictly: false }
}

function defaultSignFor(type: SearchType): string {
  // 默认保持和 AdvanceTable 一致的后端协议（LIKE / GE / LE）
  // 官方 TableSearch 支持的 LK / EQ / LET / RANGE / UEQ / NUL 可通过 cfg.sign 覆盖
  return type === 'DateRange' ? 'RANGE' : 'LIKE'
}

watch(
  () => props.configs,
  (cfgs) => {
    if (!cfgs) return
    cfgs.forEach((c) => {
      if (query[c.value] === undefined) {
        query[c.value] = c.initValue !== undefined ? c.initValue : ''
      }
      if (c.service?.api) {
        void loadServiceData(c)
      }
    })
  },
  { immediate: true, deep: true }
)

async function loadServiceData(cfg: SearchConfig): Promise<void> {
  if (!cfg.service?.api) return
  try {
    const resp = await cfg.service.api(cfg.service.params || {})
    if (resp && resp.success !== false) {
      const attr = cfg.service.attr || 'data'
      const raw: unknown = (resp.data as Record<string, unknown>)?.[attr] ?? resp.data
      if (Array.isArray(raw)) cfg.data = raw
    }
  } catch {
    // 静默失败，不阻塞表单渲染
  }
}

function handleFieldChange(cfg: SearchConfig, val: unknown): void {
  if (typeof cfg.onChange === 'function') {
    cfg.onChange({ val, listQuery: query })
  }
  handleSearch()
}

function buildSearchParams(): string | undefined {
  const eqParam: Record<string, unknown> = {}
  const extra: Array<{ param: Record<string, unknown>; sign: string }> = []
  ;(props.configs || []).forEach((c) => {
    const v = query[c.value]
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) return
    const sign = c.sign || defaultSignFor(c.type)
    if (c.type === 'DateRange' && Array.isArray(v)) {
      const [start, end] = v
      if (start) extra.push({ param: { [c.value]: start }, sign: 'GE' })
      if (end) extra.push({ param: { [c.value]: end }, sign: 'LE' })
    } else if (c.sign) {
      // 用户显式指定 sign 时单独成项
      extra.push({ param: { [c.value]: v }, sign })
    } else {
      eqParam[c.value] = v
    }
  })
  const arr: Array<{ param: Record<string, unknown>; sign: string }> = []
  if (Object.keys(eqParam).length > 0) arr.push({ param: eqParam, sign: 'LIKE' })
  arr.push(...extra)
  return arr.length > 0 ? JSON.stringify(arr) : undefined
}

function handleSearch(): void {
  const params = buildSearchParams()
  props.onSearch?.(params)
  emit('search', params)
}

function handleReset(): void {
  ;(props.configs || []).forEach((c) => {
    query[c.value] = c.initValue !== undefined ? c.initValue : ''
  })
  handleSearch()
}

onMounted(() => {
  if (props.isInitSearch) handleSearch()
})
</script>

<style lang="scss" scoped>
@import './tokens';

.tbls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tbls__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;

  --el-date-editor-daterange-width: 240px;
  --el-date-editor-monthrange-width: 240px;
}

.tbls__input {
  width: 180px;
  flex-shrink: 0;

  &--range {
    width: 240px !important;
  }
}

.tbls :deep(.el-date-editor.el-input),
.tbls :deep(.el-date-editor.el-input__wrapper),
.tbls :deep(.el-date-editor.el-range-editor),
.tbls :deep(.el-date-editor--daterange),
.tbls :deep(.el-date-editor--datetimerange) {
  width: 240px !important;
  min-width: 0 !important;
  max-width: 240px !important;
  padding-left: 8px;
  padding-right: 8px;
}

.tbls :deep(.el-range-editor .el-range-input) {
  min-width: 0 !important;
  width: 88px !important;
  font-size: 12px;
}
.tbls :deep(.el-range-editor .el-range-separator) {
  padding: 0 2px;
  line-height: 28px;
  color: $text-muted;
  flex-shrink: 0;
  width: 12px;
  min-width: 12px;
}
.tbls :deep(.el-range-editor .el-range__close-icon),
.tbls :deep(.el-range-editor .el-range__icon) {
  width: 14px;
  margin-left: 0;
  flex-shrink: 0;
}

.tbls__btn {
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

.tbls__operate {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;

  &--top {
    justify-content: flex-end;
  }

  &--inline {
    margin-left: 4px;
  }
}
</style>
