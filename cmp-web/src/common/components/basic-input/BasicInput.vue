<template>
  <el-input v-bind="$attrs"></el-input>
</template>

<script>
import { computed } from '@vue/composition-api'
const colorMap = {
  normal: {
    bg: '#2E8CF0',
    bc: '#CBE3FB'
  },
  primary: {
    bg: '#5D59B4',
    bc: '#B3B0B4'
  },
  success: {
    bg: '#54C54E',
    bc: '#D5F1D3'
  },
  warning: {
    bg: '#FF9900',
    bc: '#D8EEDD'
  },
  danger: {
    bg: '#DC1A1A',
    bc: '#F6C6C6'
  },
  disabled: {
    bg: '#808490',
    bc: '#E0E1E4'
  }
}
export default {
  props: {
    type: {
      type: String,
      default: 'normal'
    },
    bgColor: {
      type: String
    },
    borderColor: {
      type: String
    }
  },
  setup(props) {
    const colorObj = computed(() => colorMap[props.type] || {})
    return { colorObj }
  }
}
</script>
<style lang="scss" scoped>
.icon-wrapper {
  display: flex;
  align-items: center;
  .icon {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 8px;
    background: #2e8cf0;
    border: 4px solid #cbe3fb;
  }
  .icon-text {
    margin: 3px 0 0 5px;
    display: inline-block;
    width: calc(100% - 21px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
