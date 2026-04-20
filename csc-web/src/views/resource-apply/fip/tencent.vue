/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="network" :add-data="addData" ref="common" :elements="elements" :item-data="retention" :disabled="disabled" v-if="isLoadData"> </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue'
import { add, element } from './../data/publicInit'
import { cloneDeep } from 'lodash-es'
import { getShoppingCartDetail } from 'services/system/shop_cart'

export default {
  components: { CommonWrapper },
  props: {
    type: {
      type: String
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      elements: [
        {
          ...element,
          name: 'EIP',
          serviceCode: 'network.tencent.eip',
          main: true
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'network.tencent.eip',
        configs: {
          resourceLabel: []
        }
      },
      retention: false,
      isLoadData: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    }
  },
  created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.addData = cloneDeep(this.retention)
      const { elements } = this.retention
      const [first, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first
        }
      ]
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then(data => {
        if (data.success) {
          this.retention = JSON.parse(data.data.inventory)
          this.addData = cloneDeep(this.retention)
          const { elements } = this.retention
          const [first, ...others] = elements
          this.elements = [
            {
              ...element,
              ...first
            }
          ]
        }
      })
    } else {
      this.addData = {
        ...add,
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'network.tencent.eip',
        configs: {
          resourceLabel: []
        }
      }
    }
    this.isLoadData = true
  },
  methods: {
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    }
  }
}
</script>

<style scoped lang="scss"></style>
