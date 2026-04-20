<template>
  <div class="item-card">
    <div class="item-title">
      <!-- TODO: i18n -->
      <span>主题内容</span>
      <UploadButton :data="addData" :codes="codes" update-key="GetPageConfigs"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
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
              <el-color-picker v-model="addData.menuBgColour"></el-color-picker>
              <!-- TODO: i18n -->
              <span class="desc-text">常规</span>
              <el-color-picker v-model="addData.menuSelectColour"></el-color-picker>
              <!-- TODO: i18n -->
              <span class="desc-text">选中</span>
            </div>
          </div>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="子菜单颜色">
          <div class="item-wrapper">
            <el-radio-group v-model="addData.subWay" @change="setDefault('subWay')">
              <!-- TODO: i18n -->
              <el-radio-button value="default">默认</el-radio-button>
              <!-- TODO: i18n -->
              <el-radio-button value="custom">自定义</el-radio-button>
            </el-radio-group>
            <div v-if="addData.subWay === 'custom'" class="color-select">
              <el-color-picker v-model="addData.subMenuBgColour"></el-color-picker>
              <!-- TODO: i18n -->
              <span class="desc-text">常规</span>
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
              <el-color-picker v-model="addData.menuFontColour"></el-color-picker>
              <!-- TODO: i18n -->
              <span class="desc-text">常规</span>
              <el-color-picker v-model="addData.menuFontSelectColour"></el-color-picker>
              <!-- TODO: i18n -->
              <span class="desc-text">选中</span>
            </div>
          </div>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="字号">
          <div class="item-wrapper">
            <el-radio-group v-model="addData.contentFontSize">
              <!-- TODO: i18n -->
              <el-radio-button value="default">默认</el-radio-button>
              <!-- TODO: i18n -->
              <el-radio-button value="big">大号</el-radio-button>
            </el-radio-group>
          </div>
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import UploadButton from '../components/UploadButton.vue'
import { isDefault } from './utils'

const props = defineProps<{
  itemData: Record<string, any>
}>()

const menuBgColour = '#ffffff'
const menuSelectColour = '#D5E8FC'
const menuFontColour = 'rgba(0,0,0,0.85)'
const subMenuBgColour = '#fafafa'
const menuFontSelectColour = '#1E54D5'
const codes = ['menuBgColour', 'subMenuBgColour', 'menuSelectColour', 'menuFontColour', 'menuFontSelectColour', 'contentFontSize']

const itemData = props.itemData
const initial: Record<string, any> = {
  bgWay: isDefault(itemData.menuBgColour, menuBgColour, itemData.menuSelectColour, menuSelectColour),
  subWay: isDefault(itemData.subMenuBgColour, subMenuBgColour),
  textWay: isDefault(itemData.menuFontColour, menuFontColour, itemData.menuFontSelectColour, menuFontSelectColour)
}
codes.forEach((key) => {
  initial[key] = itemData[key]
})
const addData = reactive<Record<string, any>>(initial)

const setDefault = (key: string) => {
  if (addData[key] === 'custom') return
  switch (key) {
    case 'bgWay':
      addData.menuBgColour = menuBgColour
      addData.menuSelectColour = menuSelectColour
      break
    case 'textWay':
      addData.menuFontColour = menuFontColour
      addData.menuFontSelectColour = menuFontSelectColour
      break
    case 'subWay':
      addData.subMenuBgColour = subMenuBgColour
  }
}

// expose codes for template reference
defineExpose({ codes })
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
