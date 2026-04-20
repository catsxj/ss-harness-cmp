<template>
  <div class="process-apply">
    <el-dropdown trigger="click">
      <span class="m-r-md">
        <i class="el-icon-monitor cur-point"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="goApply">流程工单</el-dropdown-item>
        <el-dropdown-item @click.native="goServiceWorkOrder"> 问题工单</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
export default {
  data() {
    return {
      messageList: [],
      totalMessage: 0,
      detail: {
        visible: false
      }
    }
  },
  watch: {},
  created() {},
  methods: {
    goApply() {
      this.$router.push({ name: 'ProfileApplyTplPreview' })
    },
    goServiceWorkOrder() {
      this.$router.push({ name: 'ServiceWorkOrder' })
    }
  }
}
</script>
<style lang="scss">
.process-apply i {
  font-size: 18px;
}
</style>
