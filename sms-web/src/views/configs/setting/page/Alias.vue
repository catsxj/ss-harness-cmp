<template>
  <div class="item-card">
    <div class="item-title">
      <span>业务别名设置</span>
      <UploadButton :data="addData" :codes="codes" :update-key="postfix ? '' : 'GetPageConfigs'"></UploadButton>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="140px">
        <basic-form-item label="业务别名">
          <el-input v-model="addData[`serviceConfigLabel${postfix}`]"></el-input>
          <span class="tip">对应 管理中心-业务管理-业务 的别名配置</span>
        </basic-form-item>
        <basic-form-item label="项目别名">
          <el-input v-model="addData[`projectConfigLabel${postfix}`]"></el-input>
          <span class="tip">对应 管理中心-业务管理-项目 的别名配置</span>
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script>
import UploadButton from '../components/UploadButton.vue'
import { reactive, toRefs } from '@vue/composition-api'

export default {
  components: {
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
    const codes = [`serviceConfigLabel${props.postfix}`, `projectConfigLabel${props.postfix}`]
    const state = reactive({
      addData: {
        ...props.itemData
      }
    })

    return {
      ...toRefs(state),
      codes
    }
  }
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
