<template>
  <div class="outside-header">
    <span>
      <router-link to="/screen/list">
        <img class="logo" title="返回" src="/static/img/logo.png" alt="">
      </router-link>
    </span>
    <span class="screen-title">
      <img src="/static/img/outside/title.png" alt="">
    </span>
    <span class="time"><span @click="operateScreen" title="全屏">{{currentTime}}</span></span>
  </div>
</template>

<script setup lang="ts">
import useHeader from 'components/ScreenWrapper/useHeader.ts'

const { currentTime, operateScreen } = useHeader()
</script>
<style lang="scss" scoped>
.outside-header {
  position: absolute;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 112px;
  background: url('/static/img/outside/header.gif');
  display: flex;
  align-items: center;
  & > span {
    flex: 1;
  }
  .logo {
    margin-left: 375px;
  }
  .screen-title {
    text-align: center;
    margin-left: 28px;
  }
  .time {
    font-size: 25px;
    color: #fafbfd;
    display: inline-block;
    margin-top: -5px;
    span {
      cursor: pointer;
      margin-left: 193px;
    }
  }
}
</style>
