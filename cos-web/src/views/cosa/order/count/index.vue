<template>
  <el-tabs type="border-card" v-model="activeName" class="order-tab">
    <el-tab-pane label="平台" name="platform">
      <VendorItem v-if="activeName === 'platform'"></VendorItem>
    </el-tab-pane>
    <el-tab-pane label="租户" name="tenant" lazy>
      <TenantItem v-if="activeName === 'tenant'" />
    </el-tab-pane>
    <el-tab-pane label="状态" name="status" lazy v-if="false">
      <StatusItem v-if="activeName === 'status'"></StatusItem>
    </el-tab-pane>
    <el-tab-pane label="类型" name="type" lazy v-if="false">
      <TypeItem v-if="activeName === 'type'"></TypeItem>
    </el-tab-pane>
    <el-tab-pane label="资源" name="resource" lazy v-if="false">
      <ResourceItem v-if="activeName === 'resource'" />
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import VendorItem from './vendors.vue'
import TenantItem from './tenant.vue'
import StatusItem from './status.vue'
import TypeItem from './type.vue'
import ResourceItem from './resource.vue'
export default {
  components: {
    VendorItem,
    TenantItem,
    StatusItem,
    TypeItem,
    ResourceItem
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
