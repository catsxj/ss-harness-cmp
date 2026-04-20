<template>
  <div>
    <el-tabs ref="tab" tab-position="top" type="border-card" value="1" @tab-click="tabClick()">
      <el-tab-pane label="操作审计日志" name="1">
        <audit ref="audit" :detail="detail"></audit>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import audit from './audit.vue'

export default {
  props: {
    detail: {
      type: Object
    }
  },
  components: {
    audit
  },
  data() {
    return {
      tabPosition: 'top'
    }
  },
  methods: {
    tabClick() {
      // switch (this.$refs.tab.currentName) {
      //   case '1':
      //     this.$refs.audit.handleSearch()
      //     break
      //   case '2':
      //     this.$refs.operation.handleSearch()
      //     break
      // }
    }
  },
  created() {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
