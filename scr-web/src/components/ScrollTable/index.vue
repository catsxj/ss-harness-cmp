<template>
  <ul class="scroll-table">
    <li class="table-header">
      <div v-for="(item, index) in columns" :key="item" :title="item" :style="getStyle(index)">
        <span>{{item}}</span></div>
    </li>
    <div class="table-body">
      <vueSeamlessScroll :data="data" :class-option="{singleHeight: 43, ...options}">
        <li class="table-tr" v-for="(item, index) in data" :key="index">
          <slot :row="item"></slot>
        </li>
      </vueSeamlessScroll>
      <NoData v-if="!data.length" ></NoData>
    </div>
  </ul>
</template>
<script>
import { computed } from '@vue/composition-api'
import vueSeamlessScroll from 'vue-seamless-scroll'
import NoData from '../NoData'
export default {
  components: { vueSeamlessScroll, NoData },
  props: {
    options: {
      type: Object,
      default: function () {
        return {}
      }
    },
    columns: {
      type: Array
    },
    columnWidth: {
      type: Array,
      default: function() {
        return []
      }
    },
    data: {
      type: Array
    }
  },
  setup(props) {
    const getStyle = index => {
      const width = props.columnWidth[index];
      return width ? { width: width, flex: 'none' } : {}
    }
    return {
      getStyle
    }
  }
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
