<template>
  <div class="top-container">
    <div class="top-cell" v-for="(item, index) in data" :key="`item.name${index}`">
      <div class="cell-icon" :class="`icon-${index}`">{{ index + 1 }}</div>
      <el-tooltip :content="item.name">
        <div class="cell-title">{{ item.name }}</div>
      </el-tooltip>
      <div class="cell-progress">
        <div :style="{ width: `${item.percent}%` }"></div>
      </div>
      <div class="cell-number">{{ item.value }}</div>
    </div>
  </div>
</template>
<script setup>
import { reactive } from '@vue/composition-api'
export default {
  props: {
    data: {
      type: Array,
      default: function () {
        return []
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.top-container {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  .top-cell {
    display: flex;
    align-items: center;
    .cell-icon {
      width: 16px;
      height: 16px;
      border-radius: 8px;
      background: #cacaca;
      text-align: center;
      color: #fff;
      font-size: 12px;
      line-height: 16px;
      margin-right: 15px;
      &.icon-0 {
        background: #e03b3b;
      }
      &.icon-1 {
        background: #f09c2b;
      }
      &.icon-2 {
        background: #4076e2;
      }
    }
    .cell-title {
      color: #393b3e;
      width: 95px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cell-progress {
      height: 15px;
      background: #f2f4f8;
      border-radius: 8px;
      flex: 1;
      margin: 0 12px;
      position: relative;
      div {
        height: 100%;
        border-radius: 8px;
        position: absolute;
        top: 0;
        left: 0;
        background: #3e74f8;
      }
    }
    .cell-number {
      color: #707274;
    }
  }
}
</style>
