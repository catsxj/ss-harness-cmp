<template>
  <section :style="style" :id="`outer-${element.uuid}`">
    <div v-show="noData" class="noData">
      <img :src="imgUrl" alt="" />
      <p>此图表暂无数据</p>
    </div>
    <div style="height: 100%; width: 100%" :id="`chart-${element.uuid}-${isEdit}`" v-show="!noData"></div>
    <div class="infos" :style="{ right: infoPadding + 10 + 'px' }" v-if="chartData.length" v-show="!noData">
      <p v-for="(item, index) in chartData" :key="index">
        <span>{{ item[axis[0]] }}：</span>
        <span>{{ item[axis[1]] }}</span>
      </p>
      <p v-show="calcAll">
        <span>合计：</span>
        <span>{{ total }}</span>
      </p>
    </div>
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
    infoPadding() {
      const { padding } = this.element.style
      return padding?.indexOf && padding.indexOf('px') >= 0 ? Number(padding.replace('px', '')) : padding
    },
    axis() {
      const { dropList } = this.element.data
      const [[{ alias: xAlias }], [{ alias: yAlias }]] = dropList
      return [xAlias, yAlias]
    },
    total() {
      return this.chartData.map(item => Number(item[this.axis[1]])).reduce((prev, curr) => prev + curr)
    },
    imgUrl() {
      return require(`@/assets/designer/alt/liquidfill${this.element.sub ? '-' + this.element.sub : ''}-alt.png`)
    },
    calcAll() {
      const { config } = this.element.options
      return config?.calcAll ?? false
    }
  },
  mounted() {
    console.log(this.element)
  }
}
</script>
<style lang="scss" scoped>
// .wrapper {
//   position: relative;
// }
.infos {
  width: 70%;
  height: 100px;
  position: absolute;
  top: 50%;
  transform: translateY(-50px);
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: center;
  p {
    margin: 0;
    color: var(--d-text-color);
    display: flex;
    justify-content: flex-end;
    span:last-child {
      width: 40px;
    }
  }
}
</style>
