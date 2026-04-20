<template>
  <div class="count-wrapper">
    <div class="count-cell" v-for="item in itemData.data" :key="item.name">
      <div class="count-value">{{ item.value }}</div>
      <div class="count">
        <i class="icon" :class="item.icon || 'el-icon-document'"></i>
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'

export default defineComponent({
  props: {
    itemData: {
      type: Object as PropType<{ config: any }>,
      required: true
    }
  },
  setup(props) {}
})
</script>
<style lang="scss" scoped>
.count-wrapper {
  display: flex;
  .count-cell {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    .icon {
      color: #537ff0;
      font-weight: bold;
      margin-right: 4px;
    }
    .count-value {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .count {
      display: flex;
      align-items: center;
      margin-left: 8px;
    }
  }
}
</style>
