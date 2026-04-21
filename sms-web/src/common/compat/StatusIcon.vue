<template>
  <span class="status-icon" :data-type="statusType" :style="customStyle">
    <span class="status-icon__dot" aria-hidden="true"></span>
    <span class="status-icon__label"><slot></slot></span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

type StatusType = 'normal' | 'primary' | 'success' | 'warning' | 'danger' | 'disabled'
const ALLOWED: StatusType[] = ['normal', 'primary', 'success', 'warning', 'danger', 'disabled']

const props = withDefaults(
  defineProps<{ type?: string; bgColor?: string; borderColor?: string }>(),
  { type: 'normal', bgColor: '', borderColor: '' }
)

const statusType = computed<StatusType>(() =>
  (ALLOWED as readonly string[]).includes(props.type as string)
    ? (props.type as StatusType)
    : 'normal'
)

const customStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.bgColor) s.background = props.bgColor
  if (props.borderColor) s.boxShadow = `inset 0 0 0 1px ${props.borderColor}`
  return s
})
</script>

<style lang="scss" scoped>
@import './tokens';

.status-icon {
  --c: #{$status-normal};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px 2px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c) 8%, transparent);
  font-family: $font-body;
  font-size: 12px;
  line-height: 1.4;
  color: var(--c);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'ss01' on, 'cv11' on;
  letter-spacing: 0.01em;
  transition: background $dur-fast $ease-out;
}

.status-icon[data-type='normal']   { --c: #{$status-normal}; }
.status-icon[data-type='primary']  { --c: #{$status-primary}; }
.status-icon[data-type='success']  { --c: #{$status-success}; }
.status-icon[data-type='warning']  { --c: #{$status-warning}; }
.status-icon[data-type='danger']   { --c: #{$status-danger}; }
.status-icon[data-type='disabled'] { --c: #{$status-disabled}; }

.status-icon__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c);
  // 发光环 — 给色点一点灵气
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 14%, transparent);
  flex-shrink: 0;
}

.status-icon__label {
  font-weight: 500;
  white-space: nowrap;
}
</style>
