<template>
  <ul class="scroll-table">
    <li class="table-header">
      <div v-for="(item, index) in columns" :key="item" :title="item" :style="getStyle(index)">
        <span>{{item}}</span></div>
    </li>
    <div class="table-body">
      <Vue3SeamlessScroll :list="data" :single-height="43" v-bind="options">
        <li class="table-tr" v-for="(item, index) in data" :key="index">
          <slot :row="item"></slot>
        </li>
      </Vue3SeamlessScroll>
      <NoData v-if="!data.length" ></NoData>
    </div>
  </ul>
</template>
<script setup lang="ts">
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'
import NoData from '../NoData/index.vue'

const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
  columns: {
    type: Array as () => string[],
  },
  columnWidth: {
    type: Array as () => string[],
    default: () => [],
  },
  data: {
    type: Array as () => Record<string, unknown>[],
    default: () => [],
  },
})

const getStyle = (index: number) => {
  const width = props.columnWidth[index]
  return width ? { width: width, flex: 'none' } : {}
}
</script>
<style lang="scss" scoped>
.scroll-table {
  height: 100%;
  color: #fff;
  font-size: 12px;
  padding: 0;
  list-style: none;
  .table-header {
    background: #152e6a;
    color: #fff;
    display: flex;
    div {
      flex: 1;
      // width: calc(100% / 7);
      padding: 10px 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .table-body {
    height: calc(100% - 37px);
    overflow: hidden;
    .table-tr {
      display: flex;
      &:nth-child(odd) {
        background: #06153b;
      }
      &:nth-child(even) {
        background: rgba(60, 126, 241, 0.2);
      }
    }
  }
}
</style>
