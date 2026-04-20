<template>
  <div class="icon-wrapper">
    <span class="icon" :style="{ background: colorData.bg, 'border-color': colorData.bc }"></span>
    <span class="icon-text"><slot></slot></span>
  </div>
</template>

<script>
const colorMap = {
  info: {
    bg: '#4EAFF5',
    bc: '#CFFCFC'
  },
  primary: {
    bg: '#FF7F27',
    bc: '#FFE4B5'
  },
  warning: {
    bg: '#FFF200',
    bc: '#FFFACD'
  },
  danger: {
    bg: '#EC1C24',
    bc: '#F6C6C6'
  },
  success: {
    bg: '#54c54e',
    bc: '#d5f1d3'
  }
}
export default {
  props: {
    color: {
      type: String,
      default: 'normal'
    }
  },
  data() {
    return {}
  },
  computed: {
    colorData() {
      return colorMap[this.color]
    }
  },
  methods: {}
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
