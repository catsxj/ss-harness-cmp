/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div>
    <div class="card" v-show="activeStep === 1">
      <div class="card-title m-b">
        <span>账单支付</span>
      </div>
      <el-row class="m-t">
        <el-col :span="24">
          <el-form label-position="left" inline>
            <el-row>
              <el-col :span="6">
                <el-form-item label="账单号：" class="m-r-xxl">
                  {{ billDetail.sn }}
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="资源类型：">
                  {{ billDetail.serviceName }}
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="创建时间：">
                  {{ billDetail.gmtCreate }}
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <basic-table :data="billDetail.items">
            <el-table-column label="收费模式" prop="chargeMode" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.chargeMode | chargeMode }}
              </template>
            </el-table-column>
            <el-table-column label="资源名称" prop="resource" show-overflow-tooltip>
              <template slot-scope="scope">
                <div v-for="(item, index) in scope.row.resource" :key="index">
                  {{ item }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="账单金额（元）" prop="money" show-overflow-tooltip> </el-table-column>
            <el-table-column label="账单开始时间" prop="billStart" show-overflow-tooltip> </el-table-column>
            <el-table-column label="账单结束时间" prop="billEnd" show-overflow-tooltip> </el-table-column>
            <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
            <el-table-column label="账单类别" prop="catalog" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ catalogFilter[scope.row.catalog] }}
              </template>
            </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-col>
        <el-col :span="24" class="total-money-div">
          <div class="pull-right">
            <span>应支付总计</span>
            <span class="total-money">{{ billDetail.money }}</span>
            <span>元</span>
          </div>
        </el-col>
        <el-col :span="24" class="m-t">
          <el-button type="primary" @click="pay()" :loading="loading">立即付款</el-button>
          <router-link to="/bill">
            <el-button class="m-l-sm">返回账单</el-button>
          </router-link>
        </el-col>
      </el-row>
    </div>
    <SuccessResult v-if="activeStep === 2" title="支付成功">
      <div slot="content">账单付款成功！订单正在处理，处理完成后会以站内信方式通知您</div>
      <div slot="operate">
        <router-link to="/bill">
          <el-button type="primary">返回账单列表</el-button>
        </router-link>
      </div>
    </SuccessResult>
  </div>
</template>

<script>
import CouponItem from 'views/order/components/CouponItem.vue'
import SuccessResult from 'views/resource-apply/components/SuccessResult.vue'
import { getBills, operateBill } from 'services/services/bill'

export default {
  // eslint-disable-next-line vue/no-unused-components
  components: { SuccessResult, CouponItem },
  data() {
    return {
      catalogFilter: {
        standard: '订购',
        alteration: '变更',
        extension: '延期',
        unsubscribe: '退订'
      },
      activeStep: 1,
      billDetail: {},
      loading: false
    }
  },
  created() {
    this.getOrderData()
  },
  methods: {
    async getOrderData() {
      const { sn } = this.$route.params
      const data = await getBills({ params: this.$tools.handleSearchParam({ sn }) })
      if (data.success) {
        this.billDetail = data.data.rows[0]
        this.billDetail.items.forEach(item => {
          item.resource = JSON.parse(item.resource)
        })
      }
    },
    async pay() {
      const { sn } = this.$route.params
      this.loading = true
      const data = await operateBill('pay', {
        sn
        // couponId: this.$refs.coupon.couponId
      })
      if (data.success) {
        this.$message.success(data.message)
        this.activeStep = 2
      }
      this.loading = false
    }
  }
}
</script>
<style scoped lang="scss">
@import '../resource-apply/index.scss';
$title-color: #5a3f23;
.total-money-div {
  margin-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebebeb;
  .total-money {
    margin: 0 10px;
  }
}
.item-margin {
  margin-bottom: 10px !important;
}
</style>
