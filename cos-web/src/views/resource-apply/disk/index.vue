/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div>
    <op :type="type" v-if="type == 'OPENSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></op>
    <easy-stack :type="type" v-if="type == 'EASYSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></easy-stack>
    <huawei :type="type" v-if="type == 'HUAWEI'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></huawei>
    <tencent :type="type" v-if="type == 'TENCENT'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tencent>
    <tce :type="type" v-if="type == 'TCE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tce>
    <ali :type="type" v-if="type == 'ALIYUN'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></ali>
    <aws :type="type" v-if="type == 'AWS'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></aws>
    <azure :type="type" v-if="type == 'AZURE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></azure>
    <smart :type="type" v-if="type == 'SMARTX'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></smart>
    <cloudTower :type="type" v-if="type == 'CLOUDTOWER'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></cloudTower>
    <fusion-sphere :type="type" v-if="type == 'FUSIONSPHERE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></fusion-sphere>
    <cnware v-if="type === 'CNWARE'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></cnware>
    <zstack :type="type" v-if="type == 'ZSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></zstack>
    <cecstack :type="type" v-if="type == 'CECSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></cecstack>
  </div>
</template>

<script>
import ali from './ali.vue'
import cecstack from './cecstack.vue'
import huawei from './huawei.vue'
import tencent from './tencent.vue'
import tce from './tce.vue'
import op from './op.vue'
import easyStack from './easyStack.vue'
import aws from './aws.vue'
import azure from './azure.vue'
import smart from './smart.vue'
import cloudTower from './cloudTower.vue'
import fusionSphere from './fusionSphere.vue'
import zstack from './ZStack.vue'
export default {
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  components: { ali, op, huawei, tencent, aws, tce, azure, smart, fusionSphere, easyStack, cloudTower, zstack, cecstack },
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

<style lang="scss">
@import '../index.scss';
</style>
