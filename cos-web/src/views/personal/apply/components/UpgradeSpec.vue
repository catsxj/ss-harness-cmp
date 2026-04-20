<template>
  <basic-form label-width="120px" :model="upgradeData" v-bind="$attrs">
    <basic-form-item label="名称：">{{ upgradeData.instanceName }}</basic-form-item>
    <basic-form-item label="原规格：">{{ upgradeData.preview.specName }}</basic-form-item>
    <basic-form-item label="IP地址：" v-if="isArray(upgradeData.preview.privateIpsList)">{{ upgradeData.preview.privateIpsList.map(item => item.address).join('、') || '--' }}</basic-form-item>
    <basic-form-item label="CPU（核）：">
      <el-input-number :min="1" v-model="upgradeData.upgrade[0].specs[0].cpu"></el-input-number>
    </basic-form-item>
    <basic-form-item label="内存（GB）：">
      <el-input-number :min="1" v-model="upgradeData.upgrade[0].specs[1].memory"></el-input-number>
    </basic-form-item>
  </basic-form>
</template>

<script>
import { ref } from '@vue/composition-api'
import { cloneDeep, isArray } from 'lodash-es'

export default {
  props: {
    itemData: {
      type: Object
    }
  },
  setup(props) {
    const upgradeData = ref(cloneDeep(props.itemData))
    // 代码兼容处理
    if (typeof props.itemData.preview === 'string') {
      upgradeData.value.preview = JSON.parse(props.itemData.preview)
    }

    function getApplyData() {
      const obj = cloneDeep(upgradeData.value)
      obj.operation = 'Upgrade'
      return obj
    }
    return {
      upgradeData,
      getApplyData,
      isArray
    }
  }
}
</script>
