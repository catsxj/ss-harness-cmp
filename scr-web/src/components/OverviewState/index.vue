<template>
  <el-row class="stat-container">
      <div class="stat-border" style="top: -2px"></div>
      <div class="stat-border" style="top: -2px; right: 1px"></div>
      <div class="stat-border" style="bottom: 0; right: 1px"></div>
      <div class="stat-border" style="bottom: 0;"></div>
      <el-col :span="24/configs.length" class="stat-part" v-for="item in configs" :key="item.title">
        <div class="title">
          <i class="icon" :class="item.icon"></i>
          <span>{{item.title}}</span>
        </div>
        <div class="stat-count" v-for="(cell,index) in item.data" :key="index">
          <template v-if="item.type === 'COUNT'">
            <div>{{cell.title}}</div>
            <div class="number" :class="cell.className" :style="cell.style">{{cell.value}} {{cell.unit}}</div>
          </template>
          <template v-if="item.type === 'PROGRESS'">
            <div :style="item.titleStyle">{{cell.title}}</div>
            <div class="progress-wrap">
              <Progress :used="cell.used" :total="cell.total" :unit="cell.unit" :color="cell.color"></Progress>
            </div>
          </template>
        </div>
      </el-col>
  </el-row>
</template>
<script setup lang="ts">
import Progress from 'components/progress/index.vue'

interface ConfigCell {
  title: string
  value?: string | number
  unit?: string
  className?: string
  style?: Record<string, string>
  used?: number
  total?: number
  color?: string
}

interface ConfigItem {
  title: string
  icon: string
  type: string
  titleStyle?: Record<string, string>
  data: ConfigCell[]
}

defineProps({
  configs: {
    type: Array as () => ConfigItem[],
    required: true,
  },
})
</script>
<style lang="scss" scoped>
.stat-container {
  position: relative;
  height: 74px;
  width: 100%;
  background: url('@/assets/img/stat_bg.png');
  border-bottom: 1px solid #0391d8;
  border-top: 1px solid #0391d8;
  margin: 10px 0;
  .stat-border {
    position: absolute;
    width: 14px;
    height: 2px;
    background: #009ce0;
  }
  .stat-part {
    display: flex;
    align-items: center;
    color: #fff;
    height: 72px;
    overflow: hidden;
    .stat-count {
      font-size: 17px;
      flex: 1;
      padding-left: 20px;
      padding-right: 10px;
      .number {
        font-size: 25px;
        font-weight: bold;
        &.lgreen {
          color: #42edf8;
        }
        &.green {
          color: #39db3c;
        }
        &.purple {
          color: #b34ef9;
        }
        &.yellow {
          color: #ffc400;
        }
      }
    }
    .progress-wrap {
      margin-top: 10px;
    }
    .title {
      color: #fff;
      height: 68px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 17px;
      width: 140px;
      background: #1b3c88;
      .icon {
        font-size: 28px;
        margin-right: 5px;
      }
      span{
        max-width: 90px;
      }
    }
  }
}
</style>
