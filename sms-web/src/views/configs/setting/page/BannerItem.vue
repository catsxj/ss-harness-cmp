<template>
  <div class="item-card">
    <div class="item-title">
      <span>页眉</span>
      <UploadButton :data="addData" :codes="codes" :files="files" :update-key="postfix ? '' : 'GetPageConfigs'"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <template v-if="!postfix">
          <basic-form-item label="底色">
            <div class="item-wrapper">
              <el-radio-group v-model="addData.bgWay" @change="setDefault('bgWay')">
                <el-radio-button label="default">默认</el-radio-button>
                <el-radio-button label="custom">自定义</el-radio-button>
              </el-radio-group>
              <div v-if="addData.bgWay === 'custom'" class="color-select">
                <el-color-picker v-model="addData.headerBgColour"></el-color-picker>
                <span class="desc-text">常规</span>
                <el-color-picker v-model="addData.headerSelectColour"></el-color-picker>
                <span class="desc-text">选中</span>
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
                <el-color-picker v-model="addData.headerFontColour"></el-color-picker>
                <span class="desc-text">常规</span>
                <el-color-picker v-model="addData.headerFontSelectColour"></el-color-picker>
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

<script>
import { reactive, toRefs } from '@vue/composition-api'
import UploadImage from '../components/UploadImage.vue'
import UploadButton from '../components/UploadButton.vue'
import { isDefault } from './utils'
const headerBgColour = '#2c2e3b',
  headerSelectColour = '#15171D',
  headerFontColour = '#b9b9ba',
  headerFontSelectColour = '#fff'
const codes = ['headerBgColour', 'headerSelectColour', 'headerFontColour', 'headerFontSelectColour']
export default {
  components: {
    UploadImage,
    UploadButton
  },
  props: {
    itemData: {
      type: Object
    },
    postfix: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const files = [`headerLogo${props.postfix}`]
    const itemData = props.itemData
    const addData = {
      bgWay: isDefault(itemData.headerBgColour, headerBgColour, itemData.headerSelectColour, headerSelectColour),
      textWay: isDefault(itemData.headerFontColour, headerFontColour, itemData.headerFontColour, headerFontColour)
    }
    ;[...codes, ...files].forEach((key) => {
      addData[key] = props.itemData[key]
    })
    const state = reactive({
      addData
    })
    const setFile = (file) => {
      state.addData[`headerLogo${props.postfix}`] = file
    }
    const setDefault = (key) => {
      if (state.addData[key] === 'custom') return
      if (key === 'bgWay') {
        state.addData.headerBgColour = headerBgColour
        state.addData.headerSelectColour = headerSelectColour
      }
      if (key === 'textWay') {
        state.addData.headerFontColour = headerFontColour
        state.addData.headerFontSelectColour = headerFontSelectColour
      }
    }
    return {
      ...toRefs(state),
      codes,
      files,
      setFile,
      setDefault
    }
  }
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
