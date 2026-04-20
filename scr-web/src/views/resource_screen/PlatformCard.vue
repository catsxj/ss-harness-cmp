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
<script setup lang="ts">
import { onUnmounted, reactive, toRefs } from 'vue'
import { generateKeyframes } from './utils'
import { getVendorTypes } from 'services/screen/resource'

interface Props {
  logo?: string
  used?: number
  total?: number
  unit?: string
}

withDefaults(defineProps<Props>(), {
  logo: '/scr-web/static/img/resource/sip.png',
  used: 50,
  total: 100
})

const emit = defineEmits<{
  changePlatform: [type: string]
}>()

interface VendorItem {
  name: string
  value: string
  icon: string
}

const state = reactive({
  list: [] as VendorItem[]
})

const { list } = toRefs(state)

let style: HTMLStyleElement | null = null

const getVendorsList = async () => {
  const res = await getVendorTypes()
  if (res.success) {
    state.list = res.data
  }
  style = generateKeyframes(state.list.length)
}

onUnmounted(() => {
  style && style.remove()
})

getVendorsList()

function selectPlatform(type: string) {
  emit('changePlatform', type)
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
  .item-wrapper {
    width: 440px;
    height: 440px;
    border-radius: 50%;
    position: absolute;
    top: 32px;
    left: 160px;
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
    }
  }
}
</style>
