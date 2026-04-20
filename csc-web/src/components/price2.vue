<template>
  <div>
    <span v-if="priceData.unitPrice">{{ (priceData.unitPrice * disCount.name).toFixed(3) }}<slot name="unit"></slot></span>
  </div>
</template>

<script>
/* global $ */
import { getDict } from 'services/platform/index'
export default {
  props: {
    priceData: {
      type: Object
    }
  },
  data() {
    return {
      disCount: {
        name: '1'
      },
      filter: {
        Minutes: '分钟',
        Hours: '小时',
        Months: '月'
      },
      price: 0
    }
  },
  // watch: {
  //   'priceData.unitPrice' () {
  //     this.$watch()
  //   }
  // },
  methods: {
    getDisCount() {
      getDict().then(data => {
        if (data.success) {
          this.disCount = data.data.find(item => item.value == 'PARITIES')
          // this.getPrice()
        }
      })
    },
    getPrice() {
      this.price = 0
      if (this.priceData.period == 'Minutes') {
        this.price = this.priceData.unitPrice * 60 * 24 * 30
      } else if (this.priceData.period == 'Hours') {
        this.price = this.priceData.unitPrice * 24 * 30
      } else if (this.priceData.period == 'Months') {
        this.price = this.priceData.unitPrice
      }
    }
  },
  created() {
    this.getDisCount()
  }
}
</script>

<style scoped></style>
