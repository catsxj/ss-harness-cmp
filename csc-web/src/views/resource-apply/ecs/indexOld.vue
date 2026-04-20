/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div>
    <vc :type="type" v-if="type == 'VMWARE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></vc>
    <op :type="type" v-else-if="type == 'OPENSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></op>
    <easy-stack :type="type" v-else-if="type == 'EASYSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></easy-stack>
    <aws :type="type" v-else-if="type == 'AWS'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></aws>
    <ali :type="type" v-else-if="type == 'ALIYUN'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></ali>
    <huawei :type="type" v-else-if="type == 'HUAWEI'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></huawei>
    <tencent :type="type" v-else-if="type == 'TENCENT'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tencent>
    <tce :type="type" v-else-if="type == 'TCE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></tce>
    <azure :type="type" v-if="type == 'AZURE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></azure>
    <smart :type="type" v-if="type == 'SMARTX'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></smart>
    <cloudTower :type="type" v-if="type == 'CLOUDTOWER'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></cloudTower>
    <fusion-sphere-clone :type="type" v-if="type == 'FUSIONSPHERE' && this.serverId" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></fusion-sphere-clone>
    <fusion-sphere :type="type" v-if="type == 'FUSIONSPHERE' && !this.serverId" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></fusion-sphere>
    <sangFor :type="type" v-if="type == 'SANGFOR'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></sangFor>
    <cnware :type="type" v-if="type == 'CNWARE'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></cnware>
    <zstack :type="type" v-if="type == 'ZSTACK'" @type="setType" :item-data="itemData" :disabled="disabled" ref="node"></zstack>
  </div>
</template>

<script>
import vc from './vc/index.vue'
import op from './op/index.vue'
import easyStack from './easyStack/index.vue'
import ali from './ali/index.vue'
import huawei from './huawei/index.vue'
import tencent from './tencent/index.vue'
import tce from './tce/index.vue'
import aws from './aws/index.vue'
import azure from './azure/index.vue'
import smart from './smart/index.vue'
import cloudTower from './cloudTower/index.vue'
import fusionSphere from './fusionSphere/index.vue'
import fusionSphereClone from './fusionSphere/clone.vue'
import sangFor from './sangfor/index.vue'
import cnware from './cnware/index.vue'
import zstack from './zstack/index.vue'
export default {
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  components: { vc, ali, op, huawei, tencent, aws, tce, azure, smart, fusionSphere, fusionSphereClone, easyStack, cloudTower, sangFor, cnware, zstack },
  data() {
    return {
      type: '',
      serverId: ''
    }
  },
  created() {
    if (!this.itemData) {
      this.type = this.$route.query.type
      this.serverId = this.$route.params.serverId
    } else {
      this.type = this.itemData.location.vendorType
      this.serverId = this.itemData.configs.serverId
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

<style scoped lang="scss"></style>
