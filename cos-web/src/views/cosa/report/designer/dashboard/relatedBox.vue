<template>
  <section>
    <h4>关联视图</h4>
    <el-checkbox-group v-model="bindUuid" @change="bindTable">
      <div v-for="item in elementLists.filter(item => (item.value == 'table' || item.type == 'echarts') && item.uuid)" :key="item.uuid">
        <el-checkbox :label="item.uuid">{{ item.options.title.text }}</el-checkbox>
      </div>
    </el-checkbox-group>
  </section>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
export default {
  data() {
    return {
      bindUuid: []
    }
  },
  computed: {
    ...mapState({
      elementLists: state => state.elements.elementLists
    }),
    ...mapGetters(['getActiveElement'])
  },
  mounted() {
    const { bindUuid } = this.getActiveElement?.data
    this.bindUuid = bindUuid ?? []
  },
  methods: {
    bindTable() {
      this.$store.commit('updateElementData', { uuid: this.getActiveElement.uuid, data: { bindUuid: this.bindUuid } })
    }
  }
}
</script>
