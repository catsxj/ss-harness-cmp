<template>
  <div class="progress" :class="{'progress-2': type === '2'}">
    <div class="content" :style="{ background: color, width: percent }"></div>
    <template v-if="type === '2'">
      <div class="text">剩余{{`${unUsed}${unit}`}}</div>
      <div class="total-text">{{`${totalLabel}${total}${unit}`}}</div>
      <div class="used-text">{{`${usedLabel}${used}${unit}`}}</div>
    </template>
    <div v-else class="text">{{`${total}/${usedRes}${unit}`}}</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#FFC400',
  },
  type: {
    type: String,
    default: '',
  },
  used: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  totalLabel: {
    type: String,
    default: '可交付',
  },
  usedLabel: {
    type: String,
    default: '已交付',
  },
  unUsed: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    default: '',
  },
})

const usedRes = computed(() => {
  if (props.used < 0) return 0
  return props.used
})

const percent = computed(() => {
  if (props.total) {
    const res = (usedRes.value / props.total) * 100
    return res > 100 ? '100%' : `${res}%`
  }
  return '0%'
})
</script>
<style lang="scss" scoped>
.progress {
  width: 100%;
  height: 17px;
  position: relative;
  background: #434b51;
  .content {
    position: absolute;
    top: 0;
    left: 0;
    height: 17px;
  }
  .text {
    position: absolute;
    right: 0;
    color: #42edf8;
    margin-right: 2px;
    font-size: 12px;
    font-family: Microsoft YaHei;
    font-weight: bold;
    color: #fff;
  }
  &.progress-2 {
    height: 21px;
    margin-bottom: 21px;
    .content {
      height: 21px;
    }
    .text {
      position: absolute;
      top: 2px
    }
    .total-text {
      position: absolute;
      left: 0;
      top: 22px;
      margin-right: 2px;
      font-size: 14px;
      font-family: Microsoft YaHei;
      color: #fff;
    }
    .used-text {
      position: absolute;
      right: 0;
      top: 22px;
      margin-right: 5px;
      font-size: 14px;
      font-family: Microsoft YaHei;
      color: #fff;
    }
  }
}
</style>
