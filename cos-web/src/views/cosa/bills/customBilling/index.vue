<template>
  <el-card>
    <el-tabs v-model="active">
      <el-tab-pane label="账单配置" name="billsConfig">
        <billsConfig v-if="active === 'billsConfig'"></billsConfig>
      </el-tab-pane>
      <el-tab-pane label="账单查看" name="viewBills">
        <viewBills v-if="active === 'viewBills'"></viewBills>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import billsConfig from './billsConfig.vue'
import viewBills from './viewBills.vue'
export default {
  components: {
    billsConfig,
    viewBills
  },
  data() {
    return {
      active: 'billsConfig'
    }
  }
}
</script>

<style></style>
