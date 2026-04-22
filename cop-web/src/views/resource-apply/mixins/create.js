import { getShoppingCartDetail } from 'services/system/shop_cart'
export default {
  props: {
    itemData: {
      type: [Object, Boolean]
    }
  },
  data() {
    return {
      retention: false
    }
  },
  async created () {
    if (this.itemData) {
      this.retention = this.itemData
      this.handleShowData()
    } else if (this.$route.query.id) {
      const res = await getShoppingCartDetail(this.$route.query.id)
      if (res.success) {
        this.retention = JSON.parse(res.data.inventory)
        this.handleShowData()
      }
    }
  }
}
