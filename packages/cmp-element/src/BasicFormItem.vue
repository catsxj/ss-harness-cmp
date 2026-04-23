<template>
  <el-form-item
    class="bfi"
    :prop="prop"
    :label="displayLabel"
    :label-width="labelWidth"
    :required="isRequired"
    :rules="disabledValidate ? undefined : mergedRules"
    :show-message="showMessage"
    :size="size"
  >
    <slot></slot>
  </el-form-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormItemRule } from 'element-plus'
import validationPresets from './validate'

// cmp-element BasicFormItem 参数
// - label / prop / labelWidth / size
// - validate: String（预设规则名，如 required / email / ip）或 Object/Array（自定义规则）
// - rules: Array          自定义规则（会与 validate 合并）
// - required-message      当 validate="required" 时的自定义 message
// - maxlength             限制输入最大长度 → 自动补 max 校验
// - showOverflowTooltip   label 过长 tooltip（暂未实现）
// - disabledValidate      关闭校验
// - showMessage           是否显示校验错误信息
const props = withDefaults(
  defineProps<{
    prop?: string
    label?: string
    labelWidth?: string
    validate?: string | FormItemRule | FormItemRule[]
    rules?: FormItemRule[]
    requiredMessage?: string
    maxlength?: string | number
    showOverflowTooltip?: boolean
    disabledValidate?: boolean
    showMessage?: boolean
    size?: 'large' | 'default' | 'small'
  }>(),
  { rules: () => [], showOverflowTooltip: false, disabledValidate: false, showMessage: true }
)

const displayLabel = computed(() => props.label || '')

const isRequired = computed(() => {
  const v = props.validate
  if (v === 'required') return true
  if (Array.isArray(v)) return v.some((r: any) => r?.required)
  if (v && typeof v === 'object' && (v as any).required) return true
  return (props.rules || []).some((r: any) => r?.required)
})

const mergedRules = computed<FormItemRule[] | undefined>(() => {
  const list: FormItemRule[] = []
  const v = props.validate
  if (v) {
    if (typeof v === 'string') {
      if (v === 'required') {
        list.push({ required: true, message: props.requiredMessage || '请输入内容', trigger: 'blur' })
      } else {
        const builtin = (validationPresets as Record<string, FormItemRule>)[v]
        if (builtin) list.push(builtin)
      }
    } else if (Array.isArray(v)) {
      list.push(...v)
    } else if (typeof v === 'object') {
      list.push(v as FormItemRule)
    }
  }
  if (props.rules && props.rules.length > 0) list.push(...props.rules)
  // maxlength 自动补 max 校验
  const maxLen = props.maxlength ? Number(props.maxlength) : 0
  if (maxLen > 0) {
    list.push({ max: maxLen, message: `不能超过 ${maxLen} 个字符`, trigger: 'blur' })
  }
  return list.length > 0 ? list : undefined
})
</script>

<style lang="scss" scoped>
@import '@ss-cmp/design-tokens/src/tokens.scss';

// cmp-basic 基准：FormItem 间距 15px
.bfi.el-form-item {
  margin-bottom: $cmp-form-item-spacing;
}

// label 样式 + 溢出省略（cmp-basic 基准 overflow/ellipsis/nowrap）
.bfi :deep(.el-form-item__label) {
  font-family: $font-body;
  font-size: 13px;
  font-weight: 500;
  color: $cmp-text-body;
  letter-spacing: 0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  // 必填 * 保持 Element Plus 默认红色
}
</style>
