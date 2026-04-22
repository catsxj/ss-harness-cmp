<template>
  <div>
    <basic-form-item :label="`${item.name}：`" v-for="(item, index) in elements" :key="`${item.serviceCode}${index}`">
      <span>¥ {{getSkuPrice(item).price.toFixed(2)}}元/{{unit}}</span>
      <el-tooltip v-if="item.tip" class="item" effect="dark" :content="item.tip" placement="top-start">
        <span>
          <i class="el-icon-question price-tip"></i>
        </span>
      </el-tooltip>
    </basic-form-item>
    <basic-form-item label="基础总价："> ¥ {{price}}元/{{unit}}</basic-form-item>
    <div v-if="showTotal">
      <discount-display :discount-type="discountType" :elements="elements"></discount-display>
      <basic-form-item label="费用合计："> <span class="total-money">¥ {{totalPrice}}元/{{unit}}</span></basic-form-item>
    </div>
  </div>
</template>
<script>
import priceMixins from '../mixins/price'
import DiscountDisplay from './DiscountDisplay.vue'

export default {
  components: { DiscountDisplay },
  mixins: [priceMixins],
  props: {
    addData: {
      type: Object,
      required: true
    },
    elements: {
      type: Array
    },
    showTotal: {
      type: Boolean,
      default: true
    }
  }
}
</script>
<style lang="scss" scoped>
.price-tip {
  color: #409eff;
  cursor: pointer;
  margin-left: 5px;
}
.total-money {
  font-weight: 400;
  font-size: 16px;
  color: #ff6600;
}
</style>
