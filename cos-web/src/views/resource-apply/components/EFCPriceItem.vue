<template>
  <span class="price-wrapper">
    <span class="m-r">原价: ￥ {{ price }}元</span>
    <span class="m-r">折扣率: <Discount :discount="discount" /></span>
    <span class="text-info m-r">实际金额: ￥ {{ discountPrice }}</span>
  </span>
</template>
<script>
import Discount from './Discount.vue'
// 小数精度
import priceMixin from '../mixins/EFCprice'
export default {
  components: { Discount },
  props: {
    showParamList: {},
    addData: {}
  },
  mixins: [priceMixin]
}
</script>
<style scoped>
/* .price-wrapper{
  display: flex;
} */
</style>
