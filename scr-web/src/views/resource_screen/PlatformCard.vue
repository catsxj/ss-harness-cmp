<template>
  <div class="platform-card">
    <div class="platform-card-title">云资源</div>
    <div class="item-wrapper">
      <div class="item" :style="{animation: `move${i} 20s infinite linear`}" @click="selectPlatform(item.value)" v-for="(item, i) in list" :key="item.name">
        <div class="item-animate"></div>
        <div class="item-content">
          <img :src="item.icon" alt="">
          <span>{{item.name}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { onUnmounted, reactive, toRefs } from '@vue/composition-api'
import { generateKeyframes } from './utils'
import { getVendorTypes } from 'services/screen/resource'

export default {
  props: {
    logo: {
      type: String,
      default: '/scr-web/static/img/resource/sip.png'
    },
    used: {
      type: Number,
      default: 50
    },
    total: {
      type: Number,
      default: 100
    },
    unit: {
      type: String
    }
  },
  setup(props, context) {
    const state = reactive({
      list: []
    })
    let style;
    const getVendorsList = async () => {
      const res = await getVendorTypes();
      if (res.success) {
        state.list = res.data
      }
      style = generateKeyframes(state.list.length)
    }
    onUnmounted(() => {
      style && style.remove()
    });
    getVendorsList()
    function selectPlatform(type) {
      context.emit('changePlatform', type)
    }
    return {
      ...toRefs(state),
      selectPlatform
    }
  }
}
</script>
<style lang="scss" scoped>
.platform-card {
  height: 500px;
  background: url('/scr-web/static/img/resource/center_bg.png');
  // background-size: 100%;
  position: relative;
  .platform-card-title {
    font-size: 26px;
    font-weight: bold;
    color: #fff;
    padding-left: 5px;
    margin-bottom: 20px;
  }
  @keyframes item-animate {
    0% {
      box-shadow: 0 0 0 transparent;
    }
    50% {
      box-shadow: 0 0 20px #04d4fa;
    }
    100% {
      box-shadow: 0 0 0 transparent;
    }
  }
  // $translateX: 200px;
  // $rotateY: -57deg;
  // @for $i from 1 through 5 {
  //   $unit: 360/5 * ($i - 1) * 1deg;
  //   @keyframes move#{$i} {
  //     from {
  //       transform: rotateZ(-$unit) translateX($translateX) rotateZ($unit)
  //         rotateY($rotateY);
  //     }
  //     to {
  //       transform: rotateZ(360deg - $unit) translateX($translateX)
  //         rotateZ($unit - 360deg) rotateY($rotateY);
  //     }
  //   }
  // }
  .item-wrapper {
    width: 440px;
    height: 440px;
    border-radius: 50%;
    position: absolute;
    top: 32px;
    left: 160px;
    // border: 2px #fff solid;
    transform-style: preserve-3d;
    transform: rotateZ(62deg) rotateY(57deg);
    .item {
      background: url('/scr-web/static/img/resource/item_bg.png');
      background-size: 100%;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      position: absolute;
      .item-content {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
         transform: rotateZ(-62deg);
        img {
          width: 80px;
        }
        span {
          font-size: 16px;
          color: #fff;
        }
      }
      .item-animate {
        position: absolute;
        width: 100px;
        height: 100px;
        text-align: center;
        border-radius: 50%;
        animation: item-animate 1s infinite linear;
      }
      // @for $i from 1 through 5 {
      //   &:nth-child(#{$i}) {
      //     animation: move#{$i} 20s infinite linear;
      //   }
      // }
    }
  }
}
</style>
