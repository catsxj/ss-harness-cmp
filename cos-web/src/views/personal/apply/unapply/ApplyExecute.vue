<template>
  <common-detail :title="configs.record.name" @goBack="configs.visible = false">
    <template #custom_content>
      <el-card>
        <el-row>
          <el-col :span="24">
            <apply-node :record="configs.record" :instance-status="instanceStatus" @goBack="goBack"> </apply-node>
          </el-col>
        </el-row>
      </el-card>
    </template>
  </common-detail>
</template>

<script>
import { defineComponent } from '@vue/composition-api'
import ApplyNode from './ApplyNode.vue'
import AttributeItem from '../components/attributeItem.vue'

export default defineComponent({
  components: { ApplyNode, AttributeItem },
  props: {
    configs: {
      type: Object
    },
    instanceStatus: {
      type: String
    }
  },
  setup(props, context) {
    const goBack = () => {
      context.emit('getData')
      props.configs.visible = false
    }
    return {
      goBack
    }
  }
})
</script>

<style></style>
