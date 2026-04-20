<template>
  <div class="cell">
    <div class="title">{{title}}</div>
    <div>
      <span class="count">{{value}}</span>
      <span class="unit">{{unit}}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  title?: string
  unit?: string
  value?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  title: '云主机总数',
  unit: '台',
  value: 0
})
</script>
<style lang="scss" scoped>
.cell {
  padding: 20px 15px;
  box-sizing: border-box;
  background: url('/static/img/sip/card_bg.png');
  background-size: 100% 100%;
  font-size: 18px;
  color: #ffffff;
  .title {
    font-weight: bold;
    margin-bottom: 10px;
  }
  .count {
    font-family: Haettenschweiler;
    font-weight: bold;
    color: #6ffbff;
    font-size: 60px;
    letter-spacing: 7px;
  }
  .unit {
    margin-left: 5px;
    color: #ffffff;
  }
}
</style>
