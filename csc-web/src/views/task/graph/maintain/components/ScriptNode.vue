<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-divider content-position="left" v-if="itemData.params.length">脚本参数111</el-divider>
    <el-row :gutter="10">
      <el-col :span="12" v-for="(cell, index) in itemData.params" :key="index">
        <basic-form-item :label="`${cell.key}：`" show-overflow-tooltip>
          <el-input v-model="cell.value"></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <select-script-item :script-item="itemData" class="text-left"><span v-if="isPreview || isTaskInstance"></span> </select-script-item>
    </el-row>
  </basic-form>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'
import SelectScriptItem from '../SelectScript.vue'

export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          category: 'SHELL',
          content: '',
          scriptId: '',
          groupId: [],
          params: []
        }
      }
    }
  },
  components: {
    SelectScriptItem
  },
  created() {
    const params = this.itemData.params
    this.itemData.params = params.includes('[') ? JSON.parse(params) : params
  }
}
</script>
<style></style>
