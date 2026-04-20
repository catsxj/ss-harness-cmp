<template>
  <div class="item-card">
    <div class="item-title">
      <span>大屏页面</span>
      <UploadButton :data="addData" :codes="codes" update-key="GetPageConfigs"> </UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <basic-form-item label="资源大屏">
          <el-switch v-model="addData['RESOURCE_SCREEN']" inactive-text="隐藏" active-text="展示"></el-switch>
        </basic-form-item>
        <basic-form-item label="统计大屏">
          <el-switch v-model="addData['COUNT_SCREEN']" inactive-text="隐藏" active-text="展示"></el-switch>
        </basic-form-item>
        <basic-form-item label="运维大屏">
          <el-switch v-model="addData['OPERATION_SCREEN']" inactive-text="隐藏" active-text="展示"></el-switch>
        </basic-form-item>
        <basic-form-item label="订单大屏">
          <el-switch v-model="addData['ORDER_SCREEN']" inactive-text="隐藏" active-text="展示"></el-switch>
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
import UploadButton from '../components/UploadButton.vue'
import { isBoolean } from 'lodash-es'
export default {
  components: {
    UploadButton
  },
  props: {
    itemData: {
      type: Object
    }
  },
  setup(props) {
    const codes = ['RESOURCE_SCREEN', 'COUNT_SCREEN', 'OPERATION_SCREEN', 'ORDER_SCREEN']
    const addData = {}
    ;[...codes].forEach((key) => {
      // eslint-disable-next-line
      addData[key] = props.itemData[key] === 'false' ? false : true
    })
    const state = reactive({
      addData
    })

    return {
      ...toRefs(state),
      codes
    }
  }
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
