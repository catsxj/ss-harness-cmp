<template>
  <div class="item-card">
    <div class="item-title">
      <!-- TODO: i18n -->
      <span>登录页面</span>
      <UploadButton :data="addData" :codes="codes" :files="files" :update-key="postfix ? '' : 'GetPageConfigs'"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <!-- TODO: i18n -->
        <UploadImage @setFile="setBgFile" label="背景图" tip="登录页面背景图片，建议图片尺寸1920*1080" :image="addData[`loginBg${postfix}`]" :image-size="{ height: '156px' }"></UploadImage>
        <!-- TODO: i18n -->
        <UploadImage @setFile="setLogoFile" tip="登录页面左上角的LOGO，建议图片尺寸266px*55px" :image="addData[`loginLogo${postfix}`]"></UploadImage>
        <!-- TODO: i18n -->
        <basic-form-item label="宣传标题">
          <el-input v-model="addData[`promotionalTitle${postfix}`]"></el-input>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="宣传内容">
          <el-input type="textarea" v-model="addData[`promotionalContent${postfix}`]"></el-input>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="版权信息">
          <el-input type="textarea" v-model="addData[`copyrightInformation${postfix}`]"></el-input>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="帮助信息文字">
          <el-input v-model="addData[`helpInformationContent${postfix}`]"></el-input>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="帮助信息链接">
          <el-input v-model="addData[`helpInformationLink${postfix}`]"></el-input>
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

const codes = [
  `promotionalTitle${props.postfix}`,
  `promotionalContent${props.postfix}`,
  `copyrightInformation${props.postfix}`,
  `helpInformationContent${props.postfix}`,
  `helpInformationLink${props.postfix}`
]
const files = [`loginLogo${props.postfix}`, `loginBg${props.postfix}`]

const initial: Record<string, any> = {}
;[...codes, ...files].forEach((key) => {
  initial[key] = props.itemData[key]
})
const addData = reactive<Record<string, any>>(initial)

const setBgFile = (file: any) => {
  addData[`loginBg${props.postfix}`] = file
}
const setLogoFile = (file: any) => {
  addData[`loginLogo${props.postfix}`] = file
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
