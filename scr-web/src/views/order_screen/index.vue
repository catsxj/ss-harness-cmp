<template>
  <ScreenWrapper code="ORDER_SCREEN" :loading="loading">
    <el-row :gutter="20" class="m-t">
      <el-col :span="6">
        <count-item title="总订单数" :count="overview.totalNum.value">
        </count-item>
      </el-col>
      <el-col :span="6">
        <count-item color="#347D6A" :trend="overview.weekRate.value > 0 ? 'up' : 'down'" title="周环比" :count="`${Math.abs(overview.weekRate.value * 100).toFixed(2)}%`" :time="overview.weekRate.time"></count-item>
      </el-col>
      <el-col :span="6">
        <count-item color="#715955" :trend="overview.dayRate.value > 0 ? 'up' : 'down'" title="日环比"  :count="`${Math.abs(overview.dayRate.value * 100).toFixed(2)}%`" :time="overview.dayRate.time"></count-item>
      </el-col>
      <el-col :span="6">
        <count-item title="日订单数" :count="overview.dayNum.value" :time="overview.dayNum.time" color="#6B47C8">
        </count-item>
      </el-col>
    </el-row>
    <el-row class="m-t-md">
      <el-col :span="8">
        <div class="card">
          <div class="card-title">租户订单TOP5</div>
          <div class="card-body">
            <bar-charts  :data="top5Data" width="100%" height="100%"></bar-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="card">
          <div class="card-title">租户订单增长趋势</div>
          <div class="card-body">
            <line-charts :data="trendData"  width="100%" height="100%"></line-charts>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="m-t-md">
      <el-col :span="8">
        <div class="card">
          <div class="card-title">订单状态统计</div>
          <div class="card-body">
            <pie-charts :data="overview.statusOrders" theme="订单状态统计" width="100%" height="100%"  ></pie-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="card">
          <div class="card-title">云平台类型订单统计</div>
          <div class="card-body">
            <bar-charts :setting="{rotate: 20}" :data="typeCount" width="100%" height="100%"></bar-charts>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="m-t-md">
      <el-col :span="8">
        <div class="card">
          <div class="card-title">订单付费类型统计</div>
          <div class="card-body">
            <pie-charts :data="overview.typeOrders" theme="订单付费类型统计" width="100%" height="100%"  ></pie-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="card">
          <div class="card-title">云平台订单增长趋势</div>
          <div class="card-body">
            <line-charts :data="vendorTrend"  width="100%" height="100%"></line-charts>
          </div>
        </div>
      </el-col>
    </el-row>
  </ScreenWrapper>
</template>

<script>
import { reactive, toRefs, ref, onUnmounted } from '@vue/composition-api'
import CountItem from './CountItem'
import ScreenWrapper from 'components/ScreenWrapper'
import { getDashboard, getTenantsOrder, getVendorTypeOrder, getVendorOrder } from 'services/screen/order'
export default {
  components: {
    ScreenWrapper,
    CountItem
  },
  setup() {
    const overview = ref({
      totalNum: {},
      dayNum: {},
      dayRate: { value: 0 },
      weekRate: { value: 0 }
    });
    const getData = async () => {
      const data = await getDashboard()
      if (data.success) {
        overview.value = data.data
      }
    }
    // top5
    const top5Data = ref({});
    async function getTop5(params) {
      const data = await getTenantsOrder({ condition: 'getTop5' })
      if (data.success) {
        top5Data.value = data.data
      }
    }
    // 租户订单增长趋势
    const trendData = ref({});
    async function getTrend() {
      const data = await getTenantsOrder({ condition: 'getTrend' })
      if (data.success) {
        trendData.value = data.data
      }
    }
    // 云平台类型
    const typeCount = ref({});
    async function getVendorCount () {
      const data = await getVendorTypeOrder({ condition: 'countByVendor' });
      if (data.success) {
        typeCount.value = data.data;
      }
    }
    // 云平台订单增长趋势
    const vendorTrend = ref({});
    async function getVendorTrend () {
      const data = await getVendorOrder({ condition: 'getTrend' });
      if (data.success) {
        vendorTrend.value = data.data;
      }
    }
    const state = reactive({
      loading: true
    })
    const timer = setInterval(() => {
      change()
    }, 1000 * 20)
    onUnmounted(() => {
      clearInterval(timer)
    })
    const change = async () => {
      try {
        await Promise.all([getData(), getTop5(), getTrend(), getVendorCount(), getVendorTrend()]);
      } catch (error) {

      }
      state.loading = false;
    }
    change();
    return {
      overview,
      top5Data,
      trendData,
      typeCount,
      vendorTrend,
      ...toRefs(state)
    }
  }
}
</script>
<style lang="scss" scoped>
.card-count-slot {
  flex: 1;
  font-size: 16px;
  color: #fff;
  margin-top: 10px;
}
.card {
  // height: calc((100vh - 300px) / 3 - 20px);
  height: 240px;
  .card-title {
    font-size: 18px;
    border-left: 3px solid #0089ff;
    font-weight: bold;
    color: #bbefff;
    padding-left: 5px;
    margin-bottom: 5px;
  }
  .card-body {
    height: calc(100% - 33px);
  }
}
</style>
