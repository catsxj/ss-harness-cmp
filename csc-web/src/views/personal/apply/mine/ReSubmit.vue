<template>
  <common-detail :title="`重新发起审批 -${configs.record.name}`" @goBack="configs.visible = false">
    <template #custom_content>
      <el-card>
        <AttributeItem component="div" :current-node="configs.record.variableMap" ref="nodeRef" ReSubmit></AttributeItem>
        <div class="text-center">
          <el-button type="primary" :loading="loading" class="w-md" @click="submit()">提交</el-button>
        </div>
      </el-card>
    </template>
  </common-detail>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
import { Message } from 'element-ui'
import AttributeItem from '../components/attributeItem.vue'
import { applyResourceEFC } from 'services/services/product'

export default defineComponent({
  components: { AttributeItem },
  props: {
    configs: {
      type: Object
    }
  },
  setup(props, context) {
    const goBack = () => {
      context.emit('getData')
      props.configs.visible = false
    }
    const loading = ref(false)
    const nodeRef = ref()
    async function submit() {
      const params = nodeRef.value.getPostData()
      if (!params) return
      loading.value = true
      // 云主机申请
      const res = await applyResourceEFC(params)
      if (res.success) {
        Message.success(res.message)
        goBack()
      }
      loading.value = false
    }
    return {
      nodeRef,
      loading,
      submit,
      goBack
    }
  }
})
</script>
