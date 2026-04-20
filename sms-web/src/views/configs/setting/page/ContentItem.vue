<template>
  <div class="item-card">
    <div class="item-title">
      <span>主题内容</span>
      <UploadButton :data="addData" :codes="codes" update-key="GetPageConfigs"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <basic-form-item label="底色">
          <div class="item-wrapper">
            <el-radio-group v-model="addData.bgWay" @change="setDefault('bgWay')">
              <el-radio-button label="default">默认</el-radio-button>
              <el-radio-button label="custom">自定义</el-radio-button>
            </el-radio-group>
            <div v-if="addData.bgWay === 'custom'" class="color-select">
              <el-color-picker v-model="addData.menuBgColour"></el-color-picker>
              <span class="desc-text">常规</span>
              <el-color-picker v-model="addData.menuSelectColour"></el-color-picker>
              <span class="desc-text">选中</span>
            </div>
          </div>
        </basic-form-item>
        <basic-form-item label="子菜单颜色">
          <div class="item-wrapper">
            <el-radio-group v-model="addData.subWay" @change="setDefault('subWay')">
              <el-radio-button label="default">默认</el-radio-button>
              <el-radio-button label="custom">自定义</el-radio-button>
            </el-radio-group>
            <div v-if="addData.subWay === 'custom'" class="color-select">
              <el-color-picker v-model="addData.subMenuBgColour"></el-color-picker>
              <span class="desc-text">常规</span>
            </div>
          </div>
        </basic-form-item>
        <basic-form-item label="文字和图标颜色">
          <div class="item-wrapper">
            <el-radio-group v-model="addData.textWay" @change="setDefault('textWay')">
              <el-radio-button label="default">默认</el-radio-button>
              <el-radio-button label="custom">自定义</el-radio-button>
            </el-radio-group>
            <div v-if="addData.textWay === 'custom'" class="color-select">
              <el-color-picker v-model="addData.menuFontColour"></el-color-picker>
              <span class="desc-text">常规</span>
              <el-color-picker v-model="addData.menuFontSelectColour"></el-color-picker>
              <span class="desc-text">选中</span>
            </div>
          </div>
        </basic-form-item>
        <basic-form-item label="字号">
          <div class="item-wrapper">
            <el-radio-group v-model="addData.contentFontSize">
              <el-radio-button label="default">默认</el-radio-button>
              <el-radio-button label="big">大号</el-radio-button>
            </el-radio-group>
          </div>
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
import UploadButton from '../components/UploadButton.vue'
import { isDefault } from './utils'

const menuBgColour = '#ffffff',
  menuSelectColour = '#D5E8FC',
  menuFontColour = 'rgba(0,0,0,0.85)',
  subMenuBgColour = '#fafafa',
  menuFontSelectColour = '#1E54D5'
const codes = ['menuBgColour', 'subMenuBgColour', 'menuSelectColour', 'menuFontColour', 'menuFontSelectColour', 'contentFontSize']
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
    const itemData = props.itemData
    const addData = {
      bgWay: isDefault(itemData.menuBgColour, menuBgColour, itemData.menuSelectColour, menuSelectColour),
      subWay: isDefault(itemData.subMenuBgColour, subMenuBgColour),
      textWay: isDefault(itemData.menuFontColour, menuFontColour, itemData.menuFontSelectColour, menuFontSelectColour)
    }
    codes.forEach((key) => {
      addData[key] = itemData[key]
    })
    const state = reactive({
      addData
    })
    const setDefault = (key) => {
      if (state.addData[key] === 'custom') return
      switch (key) {
        case 'bgWay':
          state.addData.menuBgColour = menuBgColour
          state.addData.menuSelectColour = menuSelectColour
          break
        case 'textWay':
          state.addData.menuFontColour = menuFontColour
          state.addData.menuFontSelectColour = menuFontSelectColour
          break
        case 'subWay':
          state.addData.subMenuBgColour = subMenuBgColour
      }
    }
    return {
      ...toRefs(state),
      codes,
      setDefault
    }
  }
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
