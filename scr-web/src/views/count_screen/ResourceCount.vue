<template>
  <div class="cell">
    <img :src="icon" alt="" class="icon">
    <div>
      <div class="title">{{title}}</div>
      <div class="count" :style="{color}">{{value}}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
  value?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  title: '云主机总数',
  icon: '/scr-web/static/img/sip/vm.png',
  value: 0
})
</script>
<style lang="scss" scoped>
.cell {
  height: 120px;
  display: flex;
  align-items: center;
  margin-top: 10px;
  .title {
    font-size: 14px;
    font-weight: bold;
    color: #bbefff;
    margin-bottom: 5px;
  }
  .count {
    font-weight: bold;
    color: #6bf2fd;
    font-size: 28px;
  }
  .icon {
    width: 85px;
    height: 130px;
  }
}
</style>
