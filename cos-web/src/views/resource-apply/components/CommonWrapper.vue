/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div class="card-wrapper" :class="itemData && !this.$route.query.id && 'no-order'">
    <div class="fix-header" v-show="activeStep === 1 && isOrder">
      <div @click="$router.back()">
        <el-icon class="el-icon-back"></el-icon>
      </div>
      <p>{{ $route.meta.title }}</p>
    </div>
    <div class="fix-height" v-show="activeStep === 1">
      <!-- <div class="card-title">{{$route.meta.title}}</div> -->
      <el-row>
        <basic-form :model="addData" ref="addForms" label-position="left" :disabled="!!itemData && !this.$route.query.id">
          <RegionItem :add-data="addData" :vendor-type="vendorType" @changeVendorId="$emit('vendorId')" :payList="payList" :code="code" :item-data="itemData" :disabled="disabled"></RegionItem>
        </basic-form>
        <basic-form :model="addData" ref="addForm" label-position="left" :disabled="disabled">
          <slot></slot>
        </basic-form>
        <div style="clear: both"></div>
        <basic-form :model="addData" ref="UserForm" label-position="left" :disabled="!!itemData && !this.$route.query.id" v-if="addData.service.indexOf('vpc') == -1">
          <user :code="code" :add-data="addData" :item-data="itemData" :disabled="disabled"></user>
        </basic-form>
      </el-row>
    </div>
    <confirm-order ref="order" :elements="elements" :add-data="addData" v-if="activeStep === 2" @setStep="setStep" :need-region="needRegion" :accepted="accepted">
      <slot name="preview-card"></slot>
      <el-checkbox v-model="accepted" slot="check" v-if="slaId">我已阅读</el-checkbox>
      <!-- <sku-price :elements="elements" :add-data="addData" :showTotal="false"></sku-price> -->
    </confirm-order>
    <div class="fixed_box">
      <div class="pull-left">
        <span v-if="showCount">
          数量：
          <el-input-number type="number" style="width: 150px" v-model="addData.emption.count" :min="1" :max="10" :precision="0"> </el-input-number>
        </span>
        <span v-if="addData.emption.duration.mode !== 'Hour'" class="m-l-md">
          时长：
          <el-select v-model="amount" :disabled="!!addData.unit" class="w" @change="selectAmount">
            <el-option v-for="item in applyTimeList" :key="item.value" :value="item.value" :label="item.name"></el-option>
          </el-select>
          <!-- <el-input-number type="number" style="width: 150px" v-model="addData.emption.duration.month" :min="1" :max="1000" :precision="0" :disabled="!!addData.unit">
          </el-input-number> -->
        </span>
      </div>
      <div class="pull-right right-footer" v-if="!itemData || this.$route.query.id">
        <PriceItem :add-data="addData" :elements="elements" />
        <el-button @click="$router.back(-1)" style="width: 90px" type="ghost">返 回</el-button>
        <el-button style="width: 90px" @click="setStep(1)" v-if="activeStep == 2">上一步</el-button>
        <el-button @click="goOrder()" style="width: 90px" type="ghost" v-if="activeStep == 1">下一步</el-button>
        <el-button @click="updateShop()" :disabled="slaId && !accepted" style="width: 90px" type="ghost" v-if="activeStep == 2 && $route.query.id">更新购物车</el-button>
        <el-button @click="createShop()" :disabled="slaId && !accepted" style="width: 90px" type="ghost" v-if="activeStep == 2 && !$route.query.id">加入购物车</el-button>
        <el-button type="primary" @click="createOrder()" :disabled="slaId && !accepted" style="width: 90px" v-if="activeStep == 2">订 购</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import RegionItem from './RegionItem.vue'
import user from './user.vue'
import ConfirmOrder from './ConfirmOrder.vue'
// import SuccessResult from './SuccessResult.vue'
// import SkuPrice from './SkuPrice.vue'
import { shoppingCloudServices } from 'services/platform/index'
import { putShoppingCart } from 'services/system/shop_cart'
import { applyResource } from 'services/services/product'
import { applyTimeList } from '../data/init'
import PriceItem from './PriceItem.vue'

export default {
  components: {
    RegionItem,
    ConfirmOrder,
    //  SkuPrice,
    PriceItem,
    user
  },
  props: {
    addData: {
      type: Object,
      required: true
    },
    elements: {
      type: Array
    },
    // 提交时对数据做校验和参数处理
    getParams: {
      type: Function
    },
    // 是否显示购买数量
    showCount: {
      type: Boolean,
      default: true
    },
    vendorType: {
      type: String
    },
    // 计费周期数据
    payList: {
      type: Array,
      default: function () {
        return [
          { name: '按量计费', value: 'Hour' },
          { name: '包年包月', value: 'Month' }
        ]
      }
    },
    // 是否需要地域可用区
    needRegion: {
      type: Boolean,
      default: true
    },
    code: {
      type: String
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      activeStep: 1,
      accepted: false,
      applyTimeList,
      amount: ''
    }
  },
  computed: {
    showMonth() {
      return this.addData.emption.duration.mode !== 'Hour'
    },
    slaId() {
      return this.addData.serviceItem?.slaId
    },
    userData() {
      return this.$store.getters.userData
    },
    isOrder() {
      return this.$route.path.indexOf('/apply') === -1 && this.$route.path.indexOf('/flow') === -1 && this.$route.path.indexOf('/process_order') === -1
    }
  },
  watch: {
    'addData.emption.duration.mode': {
      handler(val) {
        if (val !== 'Hour') {
          const { mode, amount } = this.addData.emption.duration
          this.amount = `${amount}|${mode}`
        }
      },
      immediate: true
    }
  },
  methods: {
    // 选择时长
    selectAmount(value) {
      const [amount, mode] = value.split('|')
      this.addData.emption.duration.mode = mode
      this.addData.emption.duration.amount = amount
    },
    // 订购
    goOrder() {
      let flag = false
      let userFlag = false
      this.$refs.UserForm.validate((valid) => {
        if (valid) {
          userFlag = true
        } else {
          userFlag = false
        }
      })
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          if (this.getParams) {
            const config = this.getParams()
            // 校验不通过
            if (!config) return false
            // 没有vendorId返回
            if (!this.addData.location.vendorId) {
              this.$message.error('资源池未找到，请重新选择')
              return false
            }
            const { configs } = this.addData
            this.addData.configs = {
              ...configs,
              ...config
            }
          }
          flag = true
          if (!userFlag) return false
          ;(!this.itemData || this.$route.query.id) && this.setStep(2)
        }
      })
      return flag && userFlag
    },
    // 设置当前激活页面
    setStep(step) {
      this.activeStep = step
    },
    // 获取规格
    getSpec(item) {
      const { skuId = '', skuList } = item
      const sku = skuList.find((cell) => skuId === cell.id)
      return sku?.spec?.map((item) => {
        return {
          [item.specName]: item.specValue
        }
      })
    },
    // 对elements进行处理
    getSkuParams(data) {
      const params = []
      data.forEach((item) => {
        // 忽略此elements
        if (item.ignore) return
        const { serviceCode, skuId, insAmount, elements, categoryId, categoryMap = {} } = item
        // 如果存在子节点对子节点进行处理
        if (elements) {
          const returnData = this.getSkuParams(
            elements.map((item1) => {
              return {
                ...item1,
                categoryMap
              }
            })
          )
          params.push(...returnData)
          return
        }
        const result = {
          serviceCode,
          skuId,
          categoryId,
          category: categoryMap[categoryId]?.remark
        }
        let specs = []
        if (serviceCode.indexOf('vpc') == -1 && serviceCode.indexOf('eip') == -1) {
          switch (serviceCode) {
            case 'manageone.standard.volume':
              specs = [{ disk: insAmount }]
              break
            case 'smartx.standard.volume':
              if (item.name == '系统盘') {
                specs = [{ disk: insAmount }]
                result.props = {
                  bootVolume: true
                }
              } else if (!skuId) {
                specs = [{ disk: this.addData.configs.size }]
              } else {
                specs = this.getSpec(item)
              }
              break
            default:
              specs = this.getSpec(item)
          }
          if (item.name == '系统盘' && item.serviceCode == 'smartx.standard.volume') {
            const arr = item.skuList.map((sku) => {
              return Number(sku.spec[0].specValue)
            })
            if (arr.indexOf(this.addData.configs.templateDisk) == -1) {
              result.skuId = null
            }
          }
          result.specs = specs
        }
        params.push(result)
      })
      return params
    },
    handlePostData() {
      if (!this.goOrder()) return false
      const { location, emption, configs, service } = this.addData
      const elements = this.getSkuParams(this.elements)
      return {
        location,
        emption,
        configs,
        elements,
        sla: this.slaId,
        service
      }
    },
    createOrder() {
      const postData = this.handlePostData()
      this.loading = true
      applyResource(postData)
        .then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            const sn = data.data
            if (sn) {
              // 预付费
              // const { location: { ownerId } } = postData;
              // const { accountCategory, id } = this.userData;
              // if (accountCategory === 'User' && ownerId !== id) {}
              this.$router.push({
                name: 'OrderConfirm',
                params: { sn }
              })
            } else {
              this.$router.back(-1)
            }
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    createShop() {
      const postData = this.handlePostData()
      this.loading = true
      shoppingCloudServices(postData)
        .then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            this.$router.push({ name: 'Shop' })
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    updateShop() {
      const postData = this.handlePostData()
      this.loading = true
      putShoppingCart(this.$route.query.id, postData)
        .then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            this.$router.push({ name: 'Shop' })
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>
<style scoped lang="scss">
@import '../index.scss';
.right-footer {
  display: flex;
  align-items: center;
}
</style>
