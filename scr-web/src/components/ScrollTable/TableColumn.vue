<template>
  <div class="table-td" :title="String(value)" :style="style">
    <slot>
      <el-tooltip class="item" effect="dark" :content="String(value)" placement="top-start">
        <span>{{value}}</span>
      </el-tooltip>
    </slot>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number],
    default: '',
  },
  width: {
    type: String,
  },
})

const style = computed(() => {
  return props.width ? { width: props.width, flex: 'none' } : {}
})
</script>
<style lang="scss" scoped>
div.table-td {
  flex: 1;
  // width: calc(100% / 7);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 12px 5px;
}
</style>
