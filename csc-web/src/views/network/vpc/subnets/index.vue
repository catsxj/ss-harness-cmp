<template>
  <div>
    <op v-if="detailData.vendorType == 'OPENSTACK' || detailData.vendorType == 'EASYSTACK'" :detail="detailData"></op>
    <mo v-if="detailData.vendorType == 'MANAGEONE'" :detail="detailData"></mo>
    <vc v-else-if="detailData.vendorType == 'VMWARE'" :detail-data="detailData"></vc>
    <azure v-else-if="detailData.vendorType == 'AZURE'" :detail="detailData"></azure>
    <tce v-else-if="detailData.vendorType == 'TCE' || detailData.vendorType == 'HUAWEI' || detailData.vendorType == 'TENCENT' || detailData.vendorType == 'ALIYUN'" :detail="detailData"></tce>
  </div>
</template>

<script>
import op from './op/index.vue'
import mo from './mo/index.vue'
import vc from './vc.vue'
import tce from './tce.vue'
import azure from './azure/index.vue'
export default {
  props: {
    detailData: {
      type: Object
    }
  },
  components: { op, vc, tce, mo, azure },
  data() {
    return {}
  },
  created() {},
  methods: {}
}
</script>

<style></style>
