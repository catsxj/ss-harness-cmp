<template>
  <div class="no-data">
    <i class="icon" :class="icon"></i>
    <span class="text">{{text}}</span>
  </div>
</template>
<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: 'el-icon-s-order',
  },
  text: {
    type: String,
    default: '暂无数据',
  },
})
</script>
<style lang="scss" scoped>
.no-data {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  .icon {
    color: #1a84e6;
    font-size: 50px;
    margin-bottom: 10px;
  }
  .text {
    color: #b3b5c3;
  }
}
</style>
