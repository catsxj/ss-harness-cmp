<template>
  <div class="progress" >
    <div class="content" :style="{ background: color, width: `${percent}%` }"></div>
    <div class="text">{{percent}}%</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percent?: number
}

const props = withDefaults(defineProps<Props>(), {
  percent: 0
})

const color = computed(() => {
  if (props.percent > 90) {
    return '#F84540'
  } else if (props.percent > 75) {
    return '#FF9900'
  } else if (props.percent > 50) {
    return '#2D8CF0'
  }
  return '#19BE6B'
})
</script>
<style lang="scss" scoped>
.progress {
  width: 100%;
  height: 12px;
  position: relative;
  background: #061330;
  .content {
    background: #19BE6B;
    position: absolute;
    top: 0;
    left: 0;
    height: 12px;
  }
  .text {
    position: absolute;
    right: 0;
    top: -2px;
    // margin-right: 2px;
    font-size: 8px;
    font-family: Microsoft YaHei;
    color: #fff;
  }
}
</style>
