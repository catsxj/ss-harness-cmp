/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div class="card" style="padding-bottom: 80px">
    <div class="card-title m-b">确认订单</div>
    <div class="row">
      <div class="row-title">
        <div class="product">商品信息</div>
        <div>计费方式</div>
        <div v-show="showMonth">订购时长</div>
        <div>数量</div>
        <div>金额</div>
        <div>折扣率</div>
        <div>折扣后金额</div>
      </div>
      <el-form label-width="100px">
        <div class="row-content">
          <div class="product">
            <basic-form-item label="地域：">{{ addData.regionName }}</basic-form-item>
            <basic-form-item label="可用区：">{{ addData.zoneName }}</basic-form-item>
            <basic-form-item label="名称：">{{ serviceItem.name }}</basic-form-item>
            <slot></slot>
          </div>
          <div>{{ addData.emption.duration.mode | payFilter }}</div>
          <div v-if="showMonth">{{ addData.emption.duration.month }}月</div>
          <div>{{ addData.emption.count }}</div>
          <div>¥ 0元</div>
          <div>
            <!-- <discount-display :elements="elements" :discountType="discountType"> </discount-display> -->
            0折
          </div>
          <div>¥ 0元</div>
        </div>
      </el-form>
    </div>
    <el-row>
      <el-col :span="24" class="m-t">
        <div class="pull-right" style="font-size: 12px">
          <slot name="check"></slot>
          <a @click="openSla" class="text-info" v-if="serviceItem.slaId">{{ serviceItem.name }}服务协议</a>
        </div>
      </el-col>
    </el-row>
    <el-dialog :visible.sync="dialogVisible" :title="slaDetail.name">
      <div v-html="slaDetail.content"></div>
    </el-dialog>
  </div>
</template>

<script>
import { getSlaDetail } from 'services/services/product'
// 小数精度
const decimalPrecision = 2

export default {
  // components: { DiscountDisplay },
  props: {
    addData: {
      type: Object,
      required: true
    },
    elements: {
      type: Array
    }
  },
  filters: {
    payFilter(value) {
      const map = {
        Hour: '按时计费',
        HOUR: '按时计费',
        Month: '按月计费'
      }
      return map[value]
    }
  },
  data() {
    return {
      loading: false,
      accepted: false,
      dialogVisible: false,
      slaDetail: {}
    }
  },
  computed: {
    showMonth() {
      return this.addData.emption.duration.mode === 'Month'
    },
    // 最终金额
    finalTotalPrice() {
      const {
        count,
        duration: { month }
      } = this.addData.emption
      // 按月计费时乘以订购时长
      return (this.price * count * (this.showMonth ? month : 1)).toFixed(decimalPrecision)
    },
    // 最终折扣金额
    finalPrice() {
      const {
        duration: { month }
      } = this.addData.emption
      return (this.totalPrice * (this.showMonth ? month : 1)).toFixed(decimalPrecision)
    },
    serviceItem() {
      return this.addData.serviceItem || {}
    }
  },
  created() {},
  methods: {
    openSla() {
      getSlaDetail(this.serviceItem.slaId).then(data => {
        this.slaDetail = data.data
      })
      this.dialogVisible = true
    }
  }
}
</script>
<style scoped lang="scss">
@import '../index.scss';
.row {
  border: 1px solid #ebebeb;
}
.row-title {
  display: flex;
  height: 38px;
  line-height: 38px;
  background: #f5f5f5;
  font-size: 12px;
  font-weight: 700;
  .product {
    flex: 1.5;
  }
  & > div {
    padding: 0 10px;
    flex: 1;
  }
}
.row-content {
  display: flex;
  align-items: center;
  .product {
    flex: 1.5;
  }
  & > div {
    flex: 1;
    padding: 10px;
  }

  & ::v-deep {
    .el-form-item {
      margin-bottom: 1px !important;
    }
    .el-form-item__label,
    .el-form-item__content {
      font-size: 12px;
      line-height: 20px;
    }
  }
}
::v-deep {
  .el-checkbox__label {
    font-size: 12px;
  }
}
.card {
  padding: 20px 20px 50px;
  background: #fff !important;
}
</style>
