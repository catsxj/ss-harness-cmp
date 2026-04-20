<template>
  <div>
    <el-dialog title="克隆" append-to-body :visible.sync="addData.dialog" width="800px">
      <vm-clone ref="cloneRef" :item-data="addData.data"></vm-clone>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="submit" :loading="loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { ref } from '@vue/composition-api'
import { vcCloneVm } from 'services/platform/index'
import VmClone from '@/views/personal/apply/components/VmClone.vue'

export default {
  components: { VmClone },
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {},
          dialog: false
        }
      }
    }
  },
  setup(props, context) {
    const loading = ref(false)
    async function submit() {
      const params = context.refs.cloneRef.getApplyData()
      if (!params) return Message.error('网卡配置不完整')
      loading.value = true
      const res = await vcCloneVm(params).finally(() => {
        loading.value = false
      })
      if (res.success) {
        Message.success(res.message)
        props.addData.dialog = false
        context.emit('back')
      }
    }
    return {
      loading,
      submit
    }
  }
}
</script>
