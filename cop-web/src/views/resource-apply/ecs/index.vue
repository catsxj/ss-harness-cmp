/**
* Created by HaijunZhang on 2019/4/28.
*/
<template>
<div>
  <vc :type="type" v-if="type == 'VMWARE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></vc>
  <op :type="type" v-else-if="type == 'OPENSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></op>
  <aws :type="type" v-else-if="type == 'AWS'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></aws>
  <ali :type="type" v-else-if="type == 'ALIYUN'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></ali>
  <huawei :type="type" v-else-if="type == 'HUAWEI'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></huawei>
  <tencent :type="type" v-else-if="type == 'TENCENT'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tencent>
  <tce :type="type" v-else-if="type == 'TCE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tce>
</div>
</template>

<script>
import vc from './vc/index.vue'
import op from './op/index.vue'
import ali from './ali/index.vue'
import huawei from './huawei/index.vue'
import tencent from './tencent/index.vue'
import tce from './tce/index.vue'
import aws from './aws/index.vue'
export default {
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  components: { vc, ali, op, huawei, tencent, aws, tce },
  data () {
    return {
      type: ''
    }
  },
  created () {
    if (!this.itemData) {
      this.type = this.$route.params.type
    } else {
      this.type = this.itemData.location.vendorType
    }
  },
  methods: {
    setType (data) {
      this.type = data
    },
    getApplyData () {
      return this.$refs.node.getPostData()
    }
  }
}
</script>

<style scoped lang="scss">
</style>
