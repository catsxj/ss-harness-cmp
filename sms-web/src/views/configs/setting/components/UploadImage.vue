<template>
  <basic-form-item :label="label">
    <el-upload class="upload-demo" :auto-upload="false" action="" :show-file-list="false" :on-change="changeFile">
      <el-button size="small" type="primary">
        <el-icon><PictureRounded /></el-icon>
        <!-- TODO: i18n -->
        选择图片
      </el-button>
      <template #tip>
        <span class="el-upload__tip tip m-l-sm">{{ tip }}</span>
      </template>
    </el-upload>
    <img :src="imageUrl" alt="" class="img" :style="imageSize" />
  </basic-form-item>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PictureRounded } from '@element-plus/icons-vue'

interface Props {
  label?: string
  tip?: string
  image?: string
  imageSize?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  // TODO: i18n
  label: 'LOGO',
  // TODO: i18n
  tip: '系统主页左上角的LOGO，建议图片尺寸266px*55px',
  image: '',
  imageSize: () => ({ height: '50px' })
})

const emit = defineEmits<{
  setFile: [file: any]
}>()

const imageUrl = ref<string | undefined>(props.image)

// TODO: type - Element Plus upload file 类型
const changeFile = (file: any) => {
  emit('setFile', file)
  imageUrl.value = URL.createObjectURL(file.raw)
}
</script>
<style scoped>
.img {
  height: 50px;
  margin-top: 10px;
}
</style>
