<template>
  <div class="item-card">
    <div class="item-title">
      <span>浏览器标签</span>
      <UploadButton :data="addData" :codes="codes" :files="files" :update-key="postfix ? '' : 'GetPageConfigs'"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <UploadImage @setFile="setFile" label="图标" tip="浏览器Tab页上展示的图标，建议图片尺寸16px*16p" :image="addData[`browserIcon${postfix}`]"></UploadImage>
        <basic-form-item label="标题">
          <el-input v-model="addData[`browserTitle${postfix}`]"></el-input>
          <span class="tip">浏览器Tab页上展示的文字</span>
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script>
import UploadImage from '../components/UploadImage.vue'
import UploadButton from '../components/UploadButton.vue'
import { reactive, toRefs } from '@vue/composition-api'

export default {
  components: {
    UploadImage,
    UploadButton
  },
  props: {
    itemData: {
      type: Object,
      default() {
        return {}
      }
    },
    postfix: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const codes = [`browserTitle${props.postfix}`],
      files = [`browserIcon${props.postfix}`]
    const state = reactive({
      addData: {
        ...props.itemData
      }
    })
    const setFile = (file) => {
      state.addData[`browserIcon${props.postfix}`] = file
    }
    return {
      ...toRefs(state),
      setFile,
      codes,
      files
    }
  }
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
