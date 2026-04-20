<template>
  <el-button type="text" @click="updateData" class="update-button" :loading="loading">更新</el-button>
</template>

<script>
import { ref } from '@vue/composition-api'
import { Message } from 'element-ui'
import { updateSystemConfigs } from 'services/system'

export default {
  props: {
    data: {
      type: Object
    },
    codes: {
      type: Array
    },
    files: {
      type: Array
    },
    updateKey: {
      type: String
    },
    validate: {
      type: Function
    }
  },
  setup(props, context) {
    const loading = ref(false)
    const updateData = async () => {
      if (props.validate && !props.validate()) return
      const formData = new FormData()
      const { codes, files, data } = props
      const arr = []
      codes.forEach((key) => {
        arr.push({
          code: key,
          value: data[key]
        })
      })
      formData.append('configs', JSON.stringify(arr))
      files &&
        files.forEach((key) => {
          const file = data[key]
          if (file) {
            formData.append(key, file.raw)
          }
        })
      loading.value = true
      const res = await updateSystemConfigs(formData)
      loading.value = false
      if (res.success) {
        Message.success(res.message)
        props.updateKey && context.root.$store.dispatch(props.updateKey)
      }
    }
    return {
      loading,
      updateData
    }
  }
}
</script>
<style scoped>
.update-button {
  float: right;
  margin-top: 2px;
}
</style>
