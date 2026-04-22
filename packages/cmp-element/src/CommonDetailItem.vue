<template>
  <div class="cdi" :style="spanStyle">
    <dt v-if="label" class="cdi__label">{{ label }}</dt>
    <dd class="cdi__value"><slot></slot></dd>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ label?: string; col?: number | string }>(),
  { col: 0 }
)

const spanStyle = computed(() => {
  const n = Number(props.col)
  if (!n || n <= 0) return {}
  const pct = (Math.min(n, 24) / 24) * 100
  return { gridColumn: `span ${Math.ceil(n)}`, flex: `0 0 ${pct}%` }
})
</script>

<style lang="scss" scoped>
@import '@ss-cmp/design-tokens/src/tokens.scss';

.cdi {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  font-family: $font-body;
  line-height: 1.5;
}

.cdi__label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: $tracking-wide;
  text-transform: uppercase;
  color: $text-muted;
  white-space: nowrap;
  flex-shrink: 0;

  &::after {
    content: '';
    display: inline-block;
    width: 12px;
    height: 1px;
    background: $border-solid;
    margin: 0 0 3px 6px;
    vertical-align: middle;
  }
}

.cdi__value {
  margin: 0;
  font-size: 13px;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
</style>
