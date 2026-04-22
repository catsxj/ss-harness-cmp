/**
* Created by HaijunZhang on 2019/4/28.
*/
<template>
<div>
  <op :type="type" v-if="type == 'OPENSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></op>
  <aws :type="type" v-if="type == 'AWS'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></aws>
  <ali :type="type" v-if="type == 'ALIYUN'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></ali>
  <huawei :type="type" v-if="type == 'HUAWEI'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></huawei>
  <tencent :type="type" v-if="type == 'TENCENT'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tencent>
  <tce :type="type" v-if="type == 'TCE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tce>
</div>
</template>

<script>
import ali from './ali.vue'
import huawei from './huawei.vue'
import op from './op.vue'
import tencent from './tencent.vue'
import tce from './tce.vue'
import aws from './aws.vue'
export default {
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  components: { ali, op, huawei, tencent, aws, tce },
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
