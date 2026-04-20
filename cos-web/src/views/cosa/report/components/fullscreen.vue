<template>
  <section class="fullscreen" v-if="visible" :style="{ backgroundColor: backgroundColor ? backgroundColor : '#fff' }">
    <header :style="{ color: backgroundColor ? backgroundColor : '#fff' }">
      <span>
        <span class="back" v-if="!isClose" @click="$emit('update:visible', false)"><i class="el-icon-arrow-left"></i> 返回</span>
        <span class="title">{{ title }}</span>
      </span>
      <i class="el-icon-close" @click="$emit('update:visible', false)" v-if="isClose"></i>
    </header>
    <div class="slot" :style="bodyStyle">
      <slot></slot>
    </div>
  </section>
</template>
<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    isClose: {
      type: Boolean,
      default: true
    },
    bodyStyle: {
      type: Object,
      default: () => ({})
    },
    backgroundColor: {
      type: String,
      default: ''
    }
  }
}
</script>
<style lang="scss" scoped>
section.fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  background: #fff;
  z-index: 99;
  header {
    height: 40px;
    padding: 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: solid 1px rgb(17, 17, 17, 0.1);
    background-color: currentColor;
    & > i {
      // color: #333;
      font-size: 24px;
      cursor: pointer;
      filter: grayscale(1) contrast(999) invert(1);
    }
    // & > i:hover {
    //   color: #46abf1;
    // }
  }
  .back {
    color: #46abf1;
    cursor: pointer;
    padding-right: 10px;
    border-right: solid 1px #b5b5b5;
  }
  .title {
    padding-left: 10px;
  }
  .slot {
    width: 100%;
    height: calc(100% - 40px);
    overflow: auto;
    box-sizing: border-box;
  }
}
</style>
