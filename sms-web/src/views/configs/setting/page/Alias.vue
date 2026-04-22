<template>
  <div class="item-card">
    <div class="item-title">
      <!-- TODO: i18n -->
      <span>业务别名设置</span>
      <UploadButton :data="addData" :codes="codes" :update-key="postfix ? '' : 'GetPageConfigs'"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <!-- TODO: i18n -->
        <basic-form-item label="业务别名">
          <el-input v-model="addData[`serviceConfigLabel${postfix}`]"></el-input>
          <!-- TODO: i18n -->
          <span class="tip">对应 管理中心-业务管理-业务 的别名配置</span>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="项目别名">
          <el-input v-model="addData[`projectConfigLabel${postfix}`]"></el-input>
          <!-- TODO: i18n -->
          <span class="tip">对应 管理中心-业务管理-项目 的别名配置</span>
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import UploadButton from '../components/UploadButton.vue'

const props = withDefaults(
  defineProps<{
    itemData?: Record<string, any>
    postfix?: string
  }>(),
  {
    itemData: () => ({}),
    postfix: ''
  }
)

const codes = [`serviceConfigLabel${props.postfix}`, `projectConfigLabel${props.postfix}`]
const addData = reactive<Record<string, any>>({
  ...props.itemData
})
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
