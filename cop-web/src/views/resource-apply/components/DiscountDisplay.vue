<template>
  <div>
    <Discount v-if="discountType === 'Tenant'" :discount="discount" name="折扣率"></Discount>
    <div v-else v-for="(item, index) in elements" :key="`${item.serviceCode}${index}`">
      <div v-if="item.elements">
        <basic-form-item :label="`${item.name}折扣率：`">
          <Discount v-for="(cell, index) in item.elements" :key="index" :name='`${item.name}${index + 1}`' :discount="cell.discount" label-width="70px"></Discount>
          <div v-if="!item.elements.length">--</div>
        </basic-form-item>
      </div>
      <Discount v-else :name='`${item.name}折扣率`' :discount="item.discount"></Discount>
    </div>
  </div>
</template>
<script>
import Discount from './Discount.vue'

export default {
  components: { Discount },
  props: {
    elements: {
      type: Array
    },
    discountType: {
      type: String
    }
  },
  computed: {
    discount() {
      return this.$store.getters.userData.discount
    }
  }
}
</script>
