<template>
  <div class="table-td" :title="value" :style="style">
    <slot>
      <el-tooltip class="item" effect="dark" :content="value.toString()" placement="top-start">
        <span>{{value}}</span>
      </el-tooltip>
    </slot>
  </div>
</template>
<script>
import { computed } from '@vue/composition-api'
export default {
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    width: {
      type: String
    }
  },
  setup(props) {
    return {
      style: props.width ? { width: props.width, flex: 'none' } : {}
    }
  }
}
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
