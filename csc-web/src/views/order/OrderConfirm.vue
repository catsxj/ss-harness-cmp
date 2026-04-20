/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <SuccessResult>
    <div slot="content">订单已生成，等待付款</div>
    <div slot="operate">
      <el-button type="primary" @click="goPay()">立即支付</el-button>
      <el-button @click="cancelOrder">取消订单</el-button>
    </div>
  </SuccessResult>
</template>

<script>
import SuccessResult from 'views/resource-apply/components/SuccessResult.vue'
import { operateOrder } from 'services/services/order'

export default {
  components: { SuccessResult },
  data() {
    return {}
  },
  created() {},
  methods: {
    // 支付
    async goPay() {
      this.$confirm('您确定要支付该订单吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { sn } = this.$route.params
        const data = await operateOrder('pay', { sn })
        if (data.success) {
          this.$message.success(data.message)
          this.$router.push({
            path: '/order'
          })
        }
      })
    },
    // 取消订单
    cancelOrder() {
      this.$confirm('您确定要取消该订单吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { sn } = this.$route.params
        const data = await operateOrder('cancel', { sn })
        if (data.success) {
          this.$message.success(data.message)
          this.$router.push({
            path: '/order'
          })
        }
      })
    }
  }
}
</script>
