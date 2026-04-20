<template>
  <Vue3SeamlessScroll :list="data" class="alarm-wrapper" :step="1" :single-height="46">
    <div class="alarm-list m-t-sm">
      <div class="alarm-item" v-for="(item, index) in data" :key="index">
        <div class="item-time">{{item.time}}</div>
        <div class="item-wrapper">
          <div class="item-node" :style="{background: alarmColorFilter(item.level) }"></div>
          <div class="item-content" :title="`${item.level} ${item.name} ${item.ip} ${item.info}`">{{item.level}} {{item.name}} {{item.ip}} {{item.info}}</div>
        </div>
      </div>
    </div>
    <NoData v-if="!data.length" icon="el-icon-message-solid" text="暂无告警数据"></NoData>
  </Vue3SeamlessScroll>
</template>
<script setup lang="ts">
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'
import NoData from 'components/NoData/index.vue'

interface AlarmItem {
  level: string
  name: string
  ip: string
  info: string
  time: string
}

interface Props {
  data: AlarmItem[]
}

defineProps<Props>()

function alarmColorFilter(value: string): string {
  const map: Record<string, string> = {
    致命: '#F84540',
    严重: '#FF9900',
    警告: '#19BE6B',
    正常: '#2D8CF0'
  }
  return map[value]
}
</script>
<style lang="scss" scoped>
.alarm-wrapper {
  height: 100%;
  overflow: hidden;
}
.alarm-item {
  display: flex;
  // margin-bottom: 6px;
  box-sizing: border-box;
  .item-time {
    color: #fff;
    font-size: 12px;
    width: 100px;
  }
}
.item-wrapper {
  border-left: 2px solid #69799b;
  position: relative;
  padding-left: 20px;
  box-sizing: border-box;
  width: calc(100% - 80px);
  .item-node {
    position: absolute;
    top: 10px;
    left: -7px;
    width: 12px;
    height: 12px;
    box-sizing: border-box;
    border-radius: 50%;
  }
  .item-content {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 36px;
    line-height: 36px;
    padding: 0 11px;
    background: #122043;
    margin-bottom: 10px;
  }
}
</style>
