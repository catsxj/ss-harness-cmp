<template>
  <el-card>
    <el-tabs v-model="active">
      <el-tab-pane label="内部账单" name="inside">
        <InSide v-if="active === 'inside'"></InSide>
      </el-tab-pane>
      <el-tab-pane label="外部账单" name="outside" lazy>
        <OutSide v-if="active === 'outside'"></OutSide>
      </el-tab-pane>
      <el-tab-pane label="分摊规则" name="allocationRules">
        <AllocationRules v-if="active === 'allocationRules'"></AllocationRules>
      </el-tab-pane>
      <!-- <el-tab-pane label="自定义账单" name="customBills">
        <CustomBills v-if="active === 'customBills'"></CustomBills>
      </el-tab-pane> -->
    </el-tabs>
  </el-card>
</template>

<script>
import InSide from './InSide.vue'
import OutSide from './OutSide.vue'
import AllocationRules from './allocationRules.vue'
// import CustomBills from './CustomBills.vue'
export default {
  components: {
    InSide,
    OutSide,
    AllocationRules
    // CustomBills
  },
  data() {
    return {
      active: 'inside'
    }
  }
}
</script>

<style></style>
