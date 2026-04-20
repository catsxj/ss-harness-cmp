<template>
  <full-screen-container class="container" :loading="loading" @getScale="(scale: number) => $emit('getScale', scale)">
    <div class="header">
      <span>
        <router-link to="/screen/list" v-if="logo">
          <img class="logo" title="返回" :src="logo" alt="">
        </router-link>
      </span>
      <img :src="animateImg" alt="" class="left-animate">
      <img :src="animateImg" alt="" class="right-animate">
      <span class="screen-title">
        {{title}}
      </span>
      <span class="time"><span @click="operateScreen" title="全屏">{{currentTime}}</span></span>
    </div>
    <div class="body">
      <slot></slot>
    </div>
  </full-screen-container>
</template>

<script setup lang="ts">
import useHeader from './useHeader'
import animateImgUrl from 'assets/img/animate.gif'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits<{
  (e: 'getScale', scale: number): void
}>()

const { currentTime, operateScreen, logo, title } = useHeader(props.code)
const animateImg = animateImgUrl
</script>
<style lang="scss" scoped>
.left-animate {
  position: absolute;
  left: 40px;
  top: 100px;
}
.right-animate {
  position: absolute;
  right: 40px;
  top: 100px;
}
.container {
  width: 100vw;
  height: 100vh;
  min-height: 700px;
  background: url('~assets/img/screen_bg.png') no-repeat;
  background-size: 100% 100%;
  overflow: hidden;
  .header {
    display: flex;
    align-items: center;
    height: 75px;
    & > span {
      flex: 1;
    }
    .logo {
      margin-left: 210px;
    }
    .screen-title {
      text-align: center;
      margin-left: 25px;
      margin-top: -2px;
      font-size: 40px;
      color: #6fffff;
    }
    .time {
      font-size: 20px;
      color: #fafbfd;
      display: inline-block;
      margin-top: -5px;
      span {
        cursor: pointer;
        margin-left: 140px;
      }
    }
  }
  .body {
    color: #fff;
    padding: 40px 115px;
    height: calc(100% - 100px);
    box-sizing: border-box;
    // display: flex;
  }
}
</style>
