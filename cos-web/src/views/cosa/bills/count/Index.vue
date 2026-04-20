<template>
  <el-tabs type="border-card" v-model="activeName" class="order-tab">
    <el-tab-pane label="平台" name="platform">
      <VendorItem v-if="activeName === 'platform'"></VendorItem>
    </el-tab-pane>
    <el-tab-pane label="租户" name="tenant" lazy>
      <TenantItem v-if="activeName === 'tenant'" />
    </el-tab-pane>
    <el-tab-pane :label="$store.getters.systemConfig.serviceConfigLabel" name="bizs" lazy>
      <BizeItem v-if="activeName === 'bizs'"></BizeItem>
    </el-tab-pane>
    <el-tab-pane :label="$store.getters.systemConfig.projectConfigLabel" name="project" lazy>
      <ProjectItem v-if="activeName === 'project'"></ProjectItem>
    </el-tab-pane>
    <el-tab-pane label="部门" name="department" lazy>
      <DepartmentItem v-if="activeName === 'department'"></DepartmentItem>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import VendorItem from './Vendor.vue'
import TenantItem from './Tenant.vue'
import BizeItem from './Bize.vue'
import ProjectItem from './Project.vue'
import DepartmentItem from './Department.vue'
export default {
  components: {
    VendorItem,
    TenantItem,
    BizeItem,
    ProjectItem,
    DepartmentItem
  },
  data() {
    return {
      activeName: 'platform'
    }
  }
}
</script>
<style scoped>
.order-tab ::v-deep .el-tabs__content {
  padding: 15px 0;
}
</style>
