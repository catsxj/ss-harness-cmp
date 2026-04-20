<template>
  <div class="card-dashboard m-t el-right-card">
    <a @click="$router.push('/order/list')">查看更多</a>
    <div class="card-title">订单状态统计</div>
    <pie-charts height="260px" width="100%" :data="orderData" :setting="setting1" :options="options" />
  </div>
</template>
<script>
import { getOrderStatus } from '@/services/services/dashboard'
import { onMounted, ref } from '@vue/composition-api'

export default {
  props: ['setting', 'options'],
  setup(props) {
    const setting1 = {
      ...props.setting,
      color: ['#F09C2B', '#54c54e', '#8C8E91', '#3D72F4']
    }
    const orderData = ref([])
    onMounted(async () => {
      const params = {
        // time: 'Months',
        vendorId: '',
        startTime: '',
        endTime: '',
        owner: true
      }
      const data = await getOrderStatus(params)
      if (data.success) {
        orderData.value = data.data?.statusOrders
      }
    })
    return {
      orderData,
      setting1
    }
  }
}
</script>
<style lang="scss" scoped>
.card-dashboard {
  background: #fff;
  padding: 15px;
  border-radius: 5px;
  color: #333;
  font-size: 12px;
  position: relative;
  .card-title {
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: 700;
  }
  & > a {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #277cfc;
    cursor: pointer;
  }
}
</style>
