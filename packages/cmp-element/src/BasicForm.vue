<template>
  <el-form
    ref="formRef"
    class="bf"
    :model="model"
    :label-width="labelWidth"
    :label-position="labelPosition"
    :label-suffix="labelSuffix"
    :inline="inline"
    :status-icon="true"
    :disabled="disabled"
    :size="size"
    @validate="(p: any, v: any, m: any) => emit('validate', p, v, m)"
  >
    <slot></slot>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

// cmp-element BasicForm 参数完整覆盖
withDefaults(
  defineProps<{
    model?: Record<string, any>
    labelWidth?: string
    labelPosition?: 'left' | 'right' | 'top'
    labelSuffix?: string
    inline?: boolean
    disabled?: boolean
    size?: 'large' | 'default' | 'small'
  }>(),
  {
    labelWidth: '100px',
    labelPosition: 'right',
    labelSuffix: '',
    inline: false,
    disabled: false
  }
)

const emit = defineEmits<{
  validate: [prop: string, isValid: boolean, msg: string]
}>()

const formRef = ref<FormInstance>()

// 回调式 + Promise 双形态 validate
function validate(callback?: (valid: boolean) => void): Promise<boolean> {
  return new Promise((resolve) => {
    formRef.value?.validate((valid: boolean) => {
      callback?.(valid)
      resolve(valid)
    })
  })
}

function validateField(prop: string | string[], callback?: (ok: boolean) => void): void {
  formRef.value?.validateField(prop as any, callback as any)
}

function resetFields(prop?: string | string[]): void {
  formRef.value?.resetFields(prop as any)
}

function clearValidate(prop?: string | string[]): void {
  formRef.value?.clearValidate(prop as any)
}

function scrollToField(prop: string): void {
  ;(formRef.value as any)?.scrollToField?.(prop)
}

defineExpose({ validate, validateField, resetFields, clearValidate, scrollToField, formRef })
</script>
