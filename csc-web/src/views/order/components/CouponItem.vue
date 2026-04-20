/** * Created by HaijunZhang on 2020/6/1. */
<template>
  <el-form label-width="100px" label-position="left">
    <el-form-item class="item-margin">
      <div slot="label">
        <el-checkbox v-model="isUseCoupon" @change="getCoupons">优惠券</el-checkbox>
      </div>
    </el-form-item>
    <card-layout title="优惠券列表" v-if="isUseCoupon">
      <el-row :gutter="10" class="coupon-wrapper">
        <el-col :span="6" v-for="item in couponList" :key="item.id">
          <div class="coupon-item" :class="{ disabled: noReduction(item) }">
            <div class="left">
              <div class="money">￥{{ getDiscountMoney(item) }}</div>
              <div class="tip">满{{ item.rule.threshold }}可用</div>
            </div>
            <div class="center">
              <div class="title">{{ item.promotionName }}</div>
              <div class="tip">限{{ item.gmtStart }}至{{ item.expiredTime }}使用</div>
            </div>
            <div v-if="!noReduction(item)">
              <el-radio v-model="couponId" :label="item.id" :disabled="noReduction(item)">使用</el-radio>
            </div>
          </div>
        </el-col>
        <el-col :span="24" v-if="!couponList.length" class="no-data">暂无数据</el-col>
      </el-row>
    </card-layout>
    <el-form-item label="优惠金额：" class="item-margin">
      <span class="total-money">￥{{ discountMoney }}</span>
    </el-form-item>
    <el-form-item label="需支付：" class="item-margin">
      <span class="total-money">￥{{ (totalMoney - discountMoney).toFixed(2) }}</span>
    </el-form-item>
  </el-form>
</template>

<script>
import { getCoupons } from 'services/system/coupon'
import { formatEqParams } from 'utils'

export default {
  props: {
    totalMoney: {
      type: Number
    },
    serviceCode: {
      type: String
    }
  },
  data() {
    return {
      isUseCoupon: false,
      couponList: [],
      couponId: '',
      loading: false
    }
  },
  computed: {
    // 优惠金额计算
    discountMoney() {
      if (!this.couponId) return 0
      const item = this.couponList.find(item => item.id === this.couponId)
      return item.money
    }
  },
  created() {},
  methods: {
    // 获取优惠金额
    getDiscountMoney(item) {
      const { reduction, discount, threshold } = item.rule
      return reduction || (this.totalMoney * (1 - discount)).toFixed(2)
    },
    // 是否满足满减
    noReduction(item) {
      return this.totalMoney < item.rule.threshold
    },
    // 优惠处理 ,获取最优惠方案
    handleData(data) {
      this.couponList = data
        .map(item => {
          const result = {
            ...item,
            rule: JSON.parse(item.rule)
          }
          // 获取
          if (!this.noReduction(result)) {
            const money = this.getDiscountMoney(result)
            result.money = money
          }
          return result
        })
        .sort((a, b) => {
          // 对数据进行排序
          if (!a.money) return 1
          if (!b.money) return -1
          return b.money - a.money
        })
      const [{ id: couponId, money } = {}] = this.couponList
      if (money) {
        this.couponId = couponId
      }
    },
    // 获取优惠券
    getCoupons(isUseCoupon) {
      if (!isUseCoupon) {
        this.couponId = ''
        return
      }
      getCoupons(formatEqParams({ status: 'unused', serviceCode: this.serviceCode })).then(data => {
        if (data.success) {
          this.handleData(data.data.rows)
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
$title-color: #5a3f23;
.total-money-div {
  margin-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebebeb;
}
.total-money {
  margin: 0 10px;
  font-weight: 400;
  font-size: 26px;
  color: #ff6600;
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
