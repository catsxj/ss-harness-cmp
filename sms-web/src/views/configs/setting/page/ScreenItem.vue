<template>
  <div class="item-card">
    <div class="item-title">
      <!-- TODO: i18n -->
      <span>大屏页面</span>
      <UploadButton :data="addData" :codes="codes" update-key="GetPageConfigs"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <!-- TODO: i18n -->
        <basic-form-item label="资源大屏">
          <el-switch v-model="addData['RESOURCE_SCREEN']" inactive-text="隐藏" active-text="展示"></el-switch>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="统计大屏">
          <el-switch v-model="addData['COUNT_SCREEN']" inactive-text="隐藏" active-text="展示"></el-switch>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="运维大屏">
          <el-switch v-model="addData['OPERATION_SCREEN']" inactive-text="隐藏" active-text="展示"></el-switch>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="订单大屏">
          <el-switch v-model="addData['ORDER_SCREEN']" inactive-text="隐藏" active-text="展示"></el-switch>
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import UploadButton from '../components/UploadButton.vue'

const props = defineProps<{
  itemData: Record<string, any>
}>()

const codes = ['RESOURCE_SCREEN', 'COUNT_SCREEN', 'OPERATION_SCREEN', 'ORDER_SCREEN']
const initial: Record<string, any> = {}
;[...codes].forEach((key) => {
  initial[key] = props.itemData[key] === 'false' ? false : true
})
const addData = reactive<Record<string, any>>(initial)
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
