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

// cmp-basic 基准：label 加粗 12px #333，value 13-14px 正文色，冒号分隔
.cdi {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  font-family: $font-body;
  line-height: 1.5;
  padding: 6px 0;
}

.cdi__label {
  font-size: 12px;
  font-weight: 600;
  color: $cmp-text-body;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 85px;

  &::after {
    content: '：';
    margin-left: 2px;
  }
}

.cdi__value {
  margin: 0;
  font-size: 13px;
  color: $cmp-text-body;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
</style>
