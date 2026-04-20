<template>
  <div class="outside-header">
    <span>
      <router-link to="/screen/list" v-if="logo">
        <img class="logo" title="返回" :src="logo" alt="">
      </router-link>
    </span>
    <span class="screen-title">
      {{title}}
    </span>
    <span class="time"><span @click="operateScreen" title="全屏">{{currentTime}}</span></span>
  </div>
</template>

<script setup lang="ts">
import useHeader from './useHeader'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
})

const { currentTime, operateScreen, logo, title } = useHeader(props.code)
</script>
<style lang="scss" scoped>
.outside-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 93px;
  background: url('~assets/img/header.gif');
  background-size: 100% 100%;
  display: flex;
  & > span {
    flex: 1;
  }
  .logo {
    margin-left: 253px;
    margin-top: 9px;
  }
  .screen-title {
    text-align: center;
    margin-left: 25px;
    margin-top: 2px;
    font-size: 48px;
    color: #6Fffff;
  }
  .time {
    font-size: 18px;
    color: #fafbfd;
    display: inline-block;
    margin-top: 20px;
    span {
      cursor: pointer;
      margin-left: 110px;
    }
  }
}
</style>
