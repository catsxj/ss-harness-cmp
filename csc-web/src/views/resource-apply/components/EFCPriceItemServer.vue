<template>
  <span class="price-wrapper">
    <span class="m-r">原价: ￥ {{ price }}元</span>
    <span class="m-r">折扣率: <Discount :discount="discount" /></span>
    <span class="text-info m-r">实际金额: ￥ {{ discountPrice }}</span>
  </span>
</template>
<script>
import Discount from './Discount.vue'
const decimalPrecision = 5
export default {
  components: { Discount },
  props: {
    showParamList: {}
  },
  computed: {
    price() {
      return this.showParamList.reduce((prev, cur) => {
        const { osPrice = 0, cpuPrice = 0, memPrice, disks = [], otherParts = [] } = cur.configs
        const diskPrice = disks.reduce((prev, cur) => {
          return prev + (cur.price || 0)
        }, 0)
        const otherPartsPrice = otherParts.reduce((prev, cur) => {
          return prev + (cur.price || 0)
        }, 0)
        return prev + osPrice + cpuPrice + memPrice + diskPrice + otherPartsPrice
      }, 0)
    },
    discount() {
      return this.$store.state.app.userData.discount
    },
    discountPrice() {
      return (this.price * this.discount).toFixed(decimalPrecision)
    }
  }
}
</script>
