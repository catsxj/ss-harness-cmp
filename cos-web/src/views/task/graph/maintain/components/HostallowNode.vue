<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item label="worker访问：">
          <el-radio-group v-model="itemData.state">
            <el-radio label="present">允许访问</el-radio>
            <el-radio label="absent">取消访问</el-radio>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row>
    <select-work :item-data="itemData" v-if="!isTemplate"></select-work>
  </basic-form>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'
import SelectWork from '../SelectWork.vue'
export default {
  components: { SelectWork },
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          state: 'present',
          workers: []
        }
      }
    }
  },
  created() {
    console.log(this.itemData)
  }
}
</script>
<style></style>
