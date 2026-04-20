<template>
  <section :style="style" :id="`outer-${element.uuid}`">
    <div v-show="noData" class="noData">
      <img :src="imgUrl" alt="" />
      <p>此图表暂无数据</p>
    </div>
    <div style="height: 100%; width: 100%" :id="`chart-${element.uuid}-${isEdit}`" v-show="!noData"></div>
  </section>
</template>
<script>
import { minxinEchartsBase } from './mixin-echarts-base'
export default {
  mixins: [minxinEchartsBase],
  data() {
    return {}
  },
  computed: {
    imgUrl() {
      return require(`@/assets/designer/alt/gauge${this.element.sub ? '-' + this.element.sub : ''}-alt.png`)
    }
  }
}
</script>
