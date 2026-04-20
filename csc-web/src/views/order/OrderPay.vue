/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div>
    <div class="card" v-show="activeStep === 1">
      <div class="card-title m-b">
        <span>订单支付</span>
      </div>
      <div class="order-tip">请尽快支付订单，订单创建48小时后未支付将会被取消。</div>
      <el-row class="m-t">
        <el-col :span="24">
          <el-form label-position="left" inline>
            <el-row>
              <el-col :span="6">
                <el-form-item label="订单编号：" class="m-r-xxl">
                  {{ orderDetail.sn }}
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="收费模式：">
                  {{ orderDetail.chargeMode | chargeMode }}
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="创建时间：">
                  {{ orderDetail.gmtCreate }}
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <basic-table :data="orderDetail.items">
            <el-table-column label="服务名称" prop="serviceName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="配置" prop="elementNames" show-overflow-tooltip width="200px">
              <template slot-scope="scope">
                <div v-for="(item, index) in scope.row.elementList" :key="index">
                  {{ item }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" show-overflow-tooltip>
              <template slot-scope="scope">
                <status-icon :type="scope.row.status | orderStatusFilter('color')">
                  {{ scope.row.status | orderStatusFilter('name') }}
                </status-icon>
              </template>
            </el-table-column>
            <el-table-column label="折扣" prop="elementNames" show-overflow-tooltip width="200px">
              <template slot-scope="scope">
                <div v-for="(item, index) in scope.row.discountList" :key="index">
                  {{ item }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="基础价格" prop="basicPrice" show-overflow-tooltip>
              <template slot-scope="scope"> {{ scope.row.basicPrice }} 元/{{ modeUnitFilter(scope.row.duration.mode) }}.实例 </template>
            </el-table-column>
            <el-table-column label="最终价格" prop="finalPrice" show-overflow-tooltip>
              <template slot-scope="scope"> {{ scope.row.finalPrice }} 元/{{ modeUnitFilter(scope.row.duration.mode) }}.实例 </template>
            </el-table-column>
            <el-table-column label="订购时长" prop="duration" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.duration.mode == 'Hour' ? '无限期' : scope.row.duration.amount + modeUnitFilter(scope.row.duration.mode) }}
              </template>
            </el-table-column>
            <el-table-column label="应付金额" prop="finalPrice" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.duration.mode == 'Hour' ? '' : scope.row.finalPrice * scope.row.duration.amount + '元' }}
              </template>
            </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-col>
        <el-col :span="24" class="total-money-div">
          <div class="pull-right">
            <span>应支付总计</span>
            <span class="total-money">{{ orderDetail.money }}</span>
            <span>元</span>
          </div>
        </el-col>
        <el-col :span="24" class="m-t">
          <el-button type="primary" @click="pay()" :loading="loading">立即付款</el-button>
          <router-link to="/order">
            <el-button class="m-l-sm">返回订单</el-button>
          </router-link>
        </el-col>
      </el-row>
    </div>
    <SuccessResult v-if="activeStep === 2" title="支付成功">
      <div slot="content">付款成功！订单正在处理，处理完成后会以站内信方式通知您</div>
      <div slot="operate">
        <router-link to="/order">
          <el-button type="primary">返回订单列表</el-button>
        </router-link>
      </div>
    </SuccessResult>
  </div>
</template>

<script>
import SuccessResult from 'views/resource-apply/components/SuccessResult.vue'
import { modeUnitFilter } from '@/common/components/sku-table/utils'
import { getOrder, operateOrder } from 'services/services/order'

export default {
  components: { SuccessResult },
  props: {
    orderId: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      activeStep: 1,
      orderDetail: {},
      loading: false
    }
  },
  created() {
    this.getOrderData()
  },
  methods: {
    modeUnitFilter,
    async getOrderData() {
      const { sn } = this.$route.params
      const data = await getOrder({
        params: this.$tools.handleSearchParam({
          sn
        })
      })
      if (data.success) {
        this.orderDetail = data.data.rows[0]
        this.orderDetail.items.forEach(item => {
          item.duration = JSON.parse(item.duration)
        })
      }
    },
    async pay() {
      const { sn } = this.$route.params
      this.loading = true
      try {
        const data = await operateOrder('pay', { sn })
        if (data.success) {
          this.$message.success(data.message)
          this.activeStep = 2
        }
      } catch (error) {}
      this.loading = false
    }
  }
}
</script>
<style scoped lang="scss">
@import '../resource-apply/index.scss';
$title-color: #5a3f23;
.order-tip {
  background: #eaf3fd;
  color: #648cf2;
  border: 1px solid #d5e8fc;
  padding: 8px 20px;
}
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
.coupon-wrapper {
  .coupon-item {
    display: flex;
    align-items: center;
    justify-self: start;
    height: 100px;
    background: #f7e7c5;
    border-radius: 5px;
    margin: 0 0 10px 0;
    padding: 0 15px;
    &.disabled {
      background: #e2ddd3;
      $title-color: #5a3f23;
    }
    .left {
      text-align: center;
      .money {
        font-size: 18px;
        color: $title-color;
        font-weight: bold;
      }
      .tip {
        color: #c39e5c;
      }
    }
    .center {
      padding: 0 10px;
      flex: 1;
      .title {
        font-size: 14px;
        color: $title-color;
        font-weight: bold;
        margin-bottom: 3px;
      }
      .tip {
        color: #c39e5c;
      }
    }
  }
}
</style>
