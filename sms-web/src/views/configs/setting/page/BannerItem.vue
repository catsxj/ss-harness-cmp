<template>
  <div class="item-card">
    <div class="item-title">
      <!-- TODO: i18n -->
      <span>页眉</span>
      <UploadButton :data="addData" :codes="codes" :files="files" :update-key="postfix ? '' : 'GetPageConfigs'"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <template v-if="!postfix">
          <!-- TODO: i18n -->
          <basic-form-item label="底色">
            <div class="item-wrapper">
              <el-radio-group v-model="addData.bgWay" @change="setDefault('bgWay')">
                <!-- TODO: i18n -->
                <el-radio-button value="default">默认</el-radio-button>
                <!-- TODO: i18n -->
                <el-radio-button value="custom">自定义</el-radio-button>
              </el-radio-group>
              <div v-if="addData.bgWay === 'custom'" class="color-select">
                <el-color-picker v-model="addData.headerBgColour"></el-color-picker>
                <!-- TODO: i18n -->
                <span class="desc-text">常规</span>
                <el-color-picker v-model="addData.headerSelectColour"></el-color-picker>
                <!-- TODO: i18n -->
                <span class="desc-text">选中</span>
              </div>
            </div>
          </basic-form-item>
          <!-- TODO: i18n -->
          <basic-form-item label="文字和图标颜色">
            <div class="item-wrapper">
              <el-radio-group v-model="addData.textWay" @change="setDefault('textWay')">
                <!-- TODO: i18n -->
                <el-radio-button value="default">默认</el-radio-button>
                <!-- TODO: i18n -->
                <el-radio-button value="custom">自定义</el-radio-button>
              </el-radio-group>
              <div v-if="addData.textWay === 'custom'" class="color-select">
                <el-color-picker v-model="addData.headerFontColour"></el-color-picker>
                <!-- TODO: i18n -->
                <span class="desc-text">常规</span>
                <el-color-picker v-model="addData.headerFontSelectColour"></el-color-picker>
                <!-- TODO: i18n -->
                <span class="desc-text">选中</span>
              </div>
            </div>
          </basic-form-item>
        </template>
        <UploadImage @setFile="setFile" :image="addData[`headerLogo${postfix}`]"></UploadImage>
      </basic-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import UploadImage from '../components/UploadImage.vue'
import UploadButton from '../components/UploadButton.vue'
import { isDefault } from './utils'

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

const headerBgColour = '#2c2e3b'
const headerSelectColour = '#15171D'
const headerFontColour = '#b9b9ba'
const headerFontSelectColour = '#fff'
const codes = ['headerBgColour', 'headerSelectColour', 'headerFontColour', 'headerFontSelectColour']
const files = [`headerLogo${props.postfix}`]
const itemData = props.itemData

const initial: Record<string, any> = {
  bgWay: isDefault(itemData.headerBgColour, headerBgColour, itemData.headerSelectColour, headerSelectColour),
  textWay: isDefault(itemData.headerFontColour, headerFontColour, itemData.headerFontColour, headerFontColour)
}
;[...codes, ...files].forEach((key) => {
  initial[key] = props.itemData[key]
})
const addData = reactive<Record<string, any>>(initial)

const setFile = (file: any) => {
  addData[`headerLogo${props.postfix}`] = file
}

const setDefault = (key: string) => {
  if (addData[key] === 'custom') return
  if (key === 'bgWay') {
    addData.headerBgColour = headerBgColour
    addData.headerSelectColour = headerSelectColour
  }
  if (key === 'textWay') {
    addData.headerFontColour = headerFontColour
    addData.headerFontSelectColour = headerFontSelectColour
  }
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
