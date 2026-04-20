<template>
  <el-card>
    <el-tabs ref="tab" value="cmc">
      <el-tab-pane name="cmc" lazy>
        <span slot="label" class="tab-label-padding">管理端界面</span>
        <cmc-page></cmc-page>
      </el-tab-pane>
      <el-tab-pane name="csc" lazy>
        <span slot="label" class="tab-label-padding">控制台界面</span>
        <csc-page></csc-page>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script>
import { defineComponent } from '@vue/composition-api'
import CmcPage from './cmc.vue'
import CscPage from './csc.vue'

export default defineComponent({
  components: { CmcPage, CscPage },
  setup() {}
})
</script>
