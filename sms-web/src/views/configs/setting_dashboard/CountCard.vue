<template>
  <div class="count-wrapper">
    <div class="count-cell" v-for="item in itemData.data" :key="item.name">
      <div class="count-value">{{ item.value }}</div>
      <div class="count">
        <!-- TODO: cmp-element - 旧 el-icon 字符串图标保留，需后续用 @element-plus/icons-vue 替换 -->
        <i class="icon" :class="item.icon || 'el-icon-document'"></i>
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
interface CountItem {
  name: string
  value: number | string
  icon?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineProps<{
  itemData: { data?: CountItem[]; config?: any }
}>()
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
