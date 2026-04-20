<template>
  <div v-show="tipText" class="tip-container">{{ tipText }}，为了避免影响您的正常使用，请尽快激活</div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { getLicense } from 'services/system/license'
import dayjs from 'utils/day'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAppStore } from '@/stores'

dayjs.extend(relativeTime)

const unit = 1000 * 60 * 60 * 24
const interval = unit * 7

const tipText = ref<string>('')
const appStore = useAppStore()

let timer: number | null = null

async function getInfo(): Promise<void> {
  const res = await getLicense()
  if (res.success) {
    const { expireDate } = res.data as { expireDate: string | number }
    const nowTimer = dayjs().valueOf()
    const expireTimer = dayjs(expireDate).valueOf()
    if (expireTimer - nowTimer <= interval) {
      const time = dayjs(expireDate).fromNow(true)
      if (expireTimer - nowTimer >= 0) {
        tipText.value = `您的证书即将过期，还剩 ${time} 时间可以进行证书激活`
      } else {
        tipText.value = `您的证书已经过期 ${time} `
      }
      appStore.setExpire(true)
    } else {
      appStore.setExpire(false)
    }
    if (expireTimer - nowTimer > unit * 30 && timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }
}

getInfo()
timer = window.setInterval(() => {
  getInfo()
}, 1000 * 60 * 60)

onUnmounted(() => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped lang="scss">
.tip-container {
  text-align: center;
  background: #c92100;
  color: #fff;
  font-weight: bold;
  padding: 5px 0;
}
</style>
