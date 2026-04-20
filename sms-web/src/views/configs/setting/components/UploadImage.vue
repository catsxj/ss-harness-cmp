<template>
  <basic-form-item :label="label">
    <el-upload class="upload-demo" :auto-upload="false" action="" :show-file-list="false" :on-change="changeFile">
      <el-button size="small" type="primary" icon="el-icon-picture-outline">选择图片</el-button>
      <span slot="tip" class="el-upload__tip tip m-l-sm">{{ tip }}</span>
    </el-upload>
    <img :src="imageUrl" alt="" class="img" :style="imageSize" />
  </basic-form-item>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'

export default {
  props: {
    label: {
      type: String,
      default: 'LOGO'
    },
    tip: {
      type: String,
      default: '系统主页左上角的LOGO，建议图片尺寸266px*55px'
    },
    image: {},
    imageSize: {
      type: Object,
      default() {
        return {
          height: '50px'
        }
      }
    }
  },
  setup(props, context) {
    const state = reactive({
      imageUrl: props.image
    })
    const changeFile = (file, fileList) => {
      context.emit('setFile', file)
      state.imageUrl = URL.createObjectURL(file.raw)
    }
    return {
      ...toRefs(state),
      changeFile
    }
  }
}
</script>
<style scoped>
.img {
  height: 50px;
  margin-top: 10px;
}
</style>
