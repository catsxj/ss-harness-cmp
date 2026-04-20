<template>
  <div class="count-card" :style="{background: color }">
    <div class="card-icon">
      <i class="icon el-icon-tickets" :style="{ color }"></i>
    </div>
    <div class="card-right">
      <div class="title">
        <span>{{title}}</span>
        <span v-if="trend" class="trend-icon">
          <i :class="trend === 'up' ? 'el-icon-caret-top danger' : 'el-icon-caret-bottom success'"></i>
        </span>
      </div>
      <div class="card-count" :class="{success: trend === 'down', danger: trend === 'up'}">
        <slot>
          <span class="count"><span class="count-prefix">{{prefix}}</span>{{count}}</span>
        </slot>
        <span class="time">{{time}}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  color?: string
  title?: string
  count?: string | number
  trend?: string
  time?: string
  prefix?: string
}

withDefaults(defineProps<Props>(), {
  title: '周环比',
  count: '1.21%'
})
</script>
<style scoped lang="scss">
.count-card {
  height: 100px;
  padding: 0 20px;
  box-sizing: border-box;
  background: #1a2a91;
  box-shadow: 0px 5px 10px 0px rgba(5, 16, 41, 0.7);
  display: flex;
  align-items: center;
  .card-icon {
    width: 56px;
    height: 56px;
    background: #ffffff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    .icon {
      color: #1a2a91;
      font-size: 24px;
      font-weight: bold;
    }
  }
  .card-right {
    padding: 0 15px;
    flex: 1;
    .title {
      font-size: 16px;
      color: #fff;
    }
  }
  .trend-icon {
    float: right;
    font-size: 20px;
    margin-top: -10px;
  }
  .success {
    color: #07f7b8 !important;
  }
  .danger {
    color: #f73407 !important;
  }
  .card-count {
    width: 100%;
    display: flex;
    align-items: flex-end;
    .count {
      flex: 1;
      font-size: 30px;
      color: #fff;
    }
    .count-prefix {
      font-size: 20px;
    }
    .time {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
