<template>
  <div class="icon-wrapper">
    <span class="icon" :style="{background: colorMap[level].bg, 'border-color': colorMap[level].bc}"></span>
    <span class="icon-text">{{levelMap[level]}}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  level: string
}

defineProps<Props>()

const levelMap: Record<string, string> = {
  REMIND: '提示告警',
  PRIMARY: '重要告警',
  SECONDARY: '次要告警',
  URGENT: '紧急告警'
}

const colorMap: Record<string, { bg: string; bc: string }> = {
  REMIND: {
    bg: '#4EAFF5',
    bc: '#CFFCFC'
  },
  PRIMARY: {
    bg: '#FF7F27',
    bc: '#FFE4B5'
  },
  SECONDARY: {
    bg: '#FFF200',
    bc: '#FFFACD'
  },
  URGENT: {
    bg: '#EC1C24',
    bc: '#F6C6C6'
  },
  DANGER: {
    bg: '#54C54E',
    bc: '#D5F1D3'
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
        background: #2E8CF0;
        border: 4px solid #CBE3FB;
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
