/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" ref="common" :elements="elements"> </common-wrapper>
</template>

<script>
import CommonWrapper from '../components/PublicCommonWrapper.vue'
import sku from '../mixins/sku'
import { add, element } from '../data/publicInit'
import { getNetwork } from 'services/platform/index'
import { cloneDeep } from 'lodash-es'
export default {
  components: { CommonWrapper },
  mixins: [sku],
  data() {
    return {
      elements: [
        {
          ...element,
          name: 'EIP',
          serviceCode: 'network.azure.eip',
          main: true
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'network.azure.eip',
        configs: {
          resourceLabel: [],
          networkId: ''
        }
      },
      list: []
    }
  },
  computed: {
    type() {
      const code = this.$route.params.code.split('.')[0].toUpperCase()
      return code
    }
  },
  created() {},
  methods: {}
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
