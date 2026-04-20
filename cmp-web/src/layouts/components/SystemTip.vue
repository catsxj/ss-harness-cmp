<template>
  <div class="tip-container" v-show="tipText">{{ tipText }}，为了避免影响您的正常使用，请尽快激活</div>
</template>
<script>
import { onUnmounted, ref } from '@vue/composition-api'
import { getLicense } from 'services/system/license'
import dayjs from 'utils/day'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const unit = 1000 * 60 * 60 * 24
export default {
  setup(props, context) {
    const tipText = ref()
    const interval = unit * 7
    const getInfo = async () => {
      const res = await getLicense()
      if (res.success) {
        const { expireDate } = res.data
        const nowTimer = dayjs().valueOf()
        const expireTimer = dayjs(expireDate).valueOf()
        const { commit } = context.root.$store
        if (expireTimer - nowTimer <= interval) {
          const time = dayjs(expireDate).fromNow(true)
          if (expireTimer - nowTimer >= 0) {
            tipText.value = `您的证书即将过期，还剩 ${time} 时间可以进行证书激活`
          } else {
            tipText.value = `您的证书已经过期 ${time} `
          }
          commit('SET_EXPIRE', true)
        } else {
          commit('SET_EXPIRE', false)
        }
        // 当证书有效期大于等于30天时直接销毁定时器
        if (expireTimer - nowTimer > unit * 30) {
          clearInterval(timer)
        }
      }
    }
    getInfo()
    const timer = setInterval(() => {
      getInfo()
    }, 1000 * 60 * 60)
    onUnmounted(() => {
      clearInterval(timer)
    })
    return {
      tipText
    }
  }
}
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
