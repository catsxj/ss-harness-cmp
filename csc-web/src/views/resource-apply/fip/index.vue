/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div>
    <ali :type="type" v-if="type == 'ALIYUN'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></ali>
    <cecstack :type="type" v-if="type == 'CECSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></cecstack>
    <huawei :type="type" v-else-if="type == 'HUAWEI'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></huawei>
    <aws :type="type" v-else-if="type == 'AWS'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></aws>
    <tencent :type="type" v-else-if="type == 'TENCENT'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tencent>
    <tce :type="type" v-else-if="type == 'TCE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tce>
    <op :type="type" v-else-if="type == 'OPENSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></op>
    <easy-stack :type="type" v-else-if="type == 'EASYSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></easy-stack>
    <azure :type="type" v-else-if="type == 'AZURE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></azure>
  </div>
</template>

<script>
import ali from './ali.vue'
import cecstack from './cecstack.vue'
import op from './op.vue'
import easyStack from './easyStack.vue'
import huawei from './huawei.vue'
import tencent from './tencent.vue'
import tce from './tce.vue'
import aws from './aws.vue'
import azure from './azure.vue'
export default {
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  components: { ali, op, huawei, tencent, aws, tce, azure, easyStack, cecstack },
  data() {
    return {
      type: ''
    }
  },
  created() {
    if (!this.itemData) {
      this.type = this.$route.params.type
    } else {
      this.type = this.itemData.location.vendorType
    }
  },
  methods: {
    setType(data) {
      this.type = data
    },
    getApplyData() {
      return this.$refs.node.getPostData()
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
