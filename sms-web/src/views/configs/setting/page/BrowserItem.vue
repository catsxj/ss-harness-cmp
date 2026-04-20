<template>
  <div class="item-card">
    <div class="item-title">
      <!-- TODO: i18n -->
      <span>浏览器标签</span>
      <UploadButton :data="addData" :codes="codes" :files="files" :update-key="postfix ? '' : 'GetPageConfigs'"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <!-- TODO: i18n -->
        <UploadImage @setFile="setFile" label="图标" tip="浏览器Tab页上展示的图标，建议图片尺寸16px*16p" :image="addData[`browserIcon${postfix}`]"></UploadImage>
        <!-- TODO: i18n -->
        <basic-form-item label="标题">
          <el-input v-model="addData[`browserTitle${postfix}`]"></el-input>
          <!-- TODO: i18n -->
          <span class="tip">浏览器Tab页上展示的文字</span>
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import UploadImage from '../components/UploadImage.vue'
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

const codes = [`browserTitle${props.postfix}`]
const files = [`browserIcon${props.postfix}`]

const addData = reactive<Record<string, any>>({
  ...props.itemData
})

const setFile = (file: any) => {
  addData[`browserIcon${props.postfix}`] = file
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
