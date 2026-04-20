<template>
  <div class="center-container">
    <div class="item" :style="getItemStyle(index)" v-for="(item, index) in dcList" :key="item.type">
      <dv-decoration-9 class="active" v-if="!dcId || dcId === item.id"></dv-decoration-9>
      <span class="dc-name" @click="select(index)">{{item.name}}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { getDcs } from 'services/screen/outside'

const emit = defineEmits<{
  changeDc: [id: string | number]
}>()

const dcId = ref<string | number>('')
let currentIndex = -1
let timer: ReturnType<typeof setInterval> | null = null

const startTimer = () => {
  if (timer) clearTimer()
  timer = setInterval(() => {
    currentIndex++
    select(currentIndex, 'auto')
    if (currentIndex === dcList.value.length - 1) currentIndex = -1
  }, 1000 * 20)
}

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onUnmounted(() => {
  clearTimer()
})

const select = (index: number, way?: string) => {
  // 手动触发重置定时器
  if (way !== 'auto') startTimer()
  currentIndex = index
  // -1时为全部
  const id = currentIndex === -1 ? '' : dcList.value[index].id
  dcId.value = id
  emit('changeDc', id)
}

// 获取数据中心
interface DcItem {
  id: number | string
  name: string
  type?: string
}

const dcList = ref<DcItem[]>([])

;(async function () {
  const res = await getDcs()
  if (res.success) {
    dcList.value = res.data.rows
    select(currentIndex)
  }
})()

// 获取每个数据中心的样式
function getItemStyle(index: number): Record<string, string> {
  const rows = Math.floor(index / 2)
  const style: Record<string, string> = {}
  return style
}
</script>
<style lang="scss" scoped>
.center-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
@keyframes item-animate {
  0% {
    top: 100px;
    opacity: 1;
  }
  50% {
    opacity: 0.8;
    top: 80px;
  }
  100% {
    opacity: 1;
    top: 100px;
  }
}
.item {
  position: relative;
  width: 430px;
  height: 430px;
  background: url('/scr-web/static/img/sip/bg_bottom.png');
  background-size: 100% 100% ;
  .active{
    width: 350px;
    height: 350px;
    position: absolute;
    bottom: -78px;
    left: 38px;
    transform: rotateX(115deg);
  }
  .dc-name {
    animation: item-animate 1.2s infinite linear;
    position: absolute;
    left: 110px;
    top: 100px;
    width: 50%;
    cursor: pointer;
    text-align: center;
    color: #fff;
    font-size: 30px;
  }

}
</style>
