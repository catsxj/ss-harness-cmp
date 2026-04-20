<template>
  <section class="scroll-box">
    <template v-if="computeEcharts(widgetType)">
      <FeildBox title="维度" :dragItem="dragItem" :coordinate="true" :checkOne="true" ref="dimenRef"></FeildBox>
      <FeildBox title="指标" :dragItem="dragItem" :coordinate="false" ref="indexRef"></FeildBox>
    </template>
    <template v-if="computeSelect(widgetType)">
      <FeildBox title="绑定参数" :dragItem="dragItem" :checkOne="true" ref="searchRef"></FeildBox>
      <RelatedBox></RelatedBox>
    </template>
    <template v-if="computeSearch(widgetType) && !computeSelect(widgetType)">
      <FeildBoxInput ref="searchRef"></FeildBoxInput>
      <RelatedBox></RelatedBox>
    </template>
    <template v-if="computeTable(widgetType)">
      <FeildBox title="行" :dragItem="dragItem" ref="rowRef"></FeildBox>
    </template>
    <template v-if="widgetType == 'rect'">
      <FeildBox title="标题" :dragItem="dragItem" :coordinate="true" :checkOne="true" ref="dimenRef"></FeildBox>
      <FeildBox title="数据" :dragItem="dragItem" :coordinate="false" :checkOne="true" ref="rowRef"></FeildBox>
    </template>
    <el-button type="primary" class="update-btn" @click="onUpdate">更新</el-button>
  </section>
</template>
<script>
import FeildBox from './feildBox.vue'
import FeildBoxInput from './feildBoxInput.vue'
import RelatedBox from './relatedBox.vue'
import { echartsGroups, formGroups, computeEcharts, computeSearch, computeTable, computeSelect } from '../config'

export default {
  components: {
    FeildBox,
    FeildBoxInput,
    RelatedBox
  },
  props: {
    dragItem: {
      type: Object,
      default: () => ({})
    },
    widgetType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      echartsGroups,
      formGroups,
      computeEcharts,
      computeSearch,
      computeTable,
      computeSelect
    }
  },
  methods: {
    onUpdate() {
      if (this.computeEcharts(this.widgetType) && this.$refs.dimenRef.dropList.length == 0) {
        return this.$message.warning('维度为空')
      }
      if (this.computeEcharts(this.widgetType) && this.$refs.indexRef.dropList.length == 0) {
        return this.$message.warning('指标项为空')
      }
      if (this.computeSearch(this.widgetType) && (!this.$refs.searchRef.dropList?.length || !this.$refs.searchRef.dropList[0].name)) {
        return this.$message.warning('绑定参数为空')
      }
      if (this.computeTable(this.widgetType) && this.$refs.rowRef.dropList.length == 0) {
        return this.$message.warning('指标项为空')
      }
      this.$emit('onUpdate')
    }
  }
}
</script>
<style lang="scss" scoped>
.scroll-box {
  height: calc(100vh - 220px);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}
.update-btn {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>
