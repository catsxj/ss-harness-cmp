/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" vendorType="OPENSTACK" ref="common" :elements="elements" :showCount="false" :item-data="retention" :disabled="disabled" :getParams="getConfigs" v-bind="$attrs">
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>配置信息</h5>
      <basic-form-item label="VPC名称：" prop="configs.name" validate="required">
        <el-input v-model="addData.configs.name" class="w" :rule="[{ pattern: /^[A-Za-z]+_[0-9]+$/, message: '请输入字母_数字' }]"></el-input>
        <span class="tip m-l-sm">vpc命名规则，字母_数字递增，例如vpc_1</span>
      </basic-form-item>
      <basic-form-item label="子网名称：" prop="configs.subnetName" validate="required">
        <el-input v-model="addData.configs.subnetName" class="w"></el-input>
        <span class="tip m-l-sm">默认值vpc名称_subnet</span>
      </basic-form-item>
      <basic-form-item label="子网地址：">
        <el-radio-group v-model="addData.configs.subRadio">
          <el-radio :label="0">
            <el-input-number v-model="addData.configs.subNetwork[0][0]" class="w-xxs" disabled :controls="false"></el-input-number>. <el-input-number v-model="addData.configs.subNetwork[0][1]" class="w-xxs" disabled :controls="false"></el-input-number>.
            <el-input-number v-model="addData.configs.subNetwork[0][2]" :min="0" :max="255" class="w-xxs" :controls="false"></el-input-number>. <el-input-number v-model="addData.configs.subNetwork[0][3]" :min="0" :max="255" class="w-xxs" :controls="false"></el-input-number>/
            <el-input-number v-model="addData.configs.subNetwork[0][4]" :min="0" :max="32" class="w-xxs" :controls="false"></el-input-number>
          </el-radio>
          <br />
          <el-radio :label="1" class="m-t">
            <el-input-number v-model="addData.configs.subNetwork[1][0]" class="w-xxs" disabled :controls="false"></el-input-number>. <el-input-number v-model="addData.configs.subNetwork[1][1]" class="w-xxs" :min="16" :max="255" :controls="false"></el-input-number>.
            <el-input-number v-model="addData.configs.subNetwork[1][2]" class="w-xxs" :min="0" :max="255" :controls="false"></el-input-number>. <el-input-number v-model="addData.configs.subNetwork[1][3]" :min="0" :max="255" class="w-xxs" :controls="false"></el-input-number>/
            <el-input-number v-model="addData.configs.subNetwork[1][4]" class="w-xxs" :min="12" :max="32" :controls="false"></el-input-number>
          </el-radio>
        </el-radio-group>
      </basic-form-item>
    </div>
    <div slot="preview-card">
      <basic-form-item label="VPC名称：">{{ addData.configs.name }}</basic-form-item>
      <basic-form-item label="子网名称：">{{ addData.configs.subnetName }}</basic-form-item>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from './../components/CommonWrapper.vue'
import { add, element } from './../data/init'
import { cloneDeep } from 'lodash-es'
import { getShoppingCartDetail } from 'services/system/shop_cart'

export default {
  props: {
    type: {
      type: String
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  components: { CommonWrapper },
  // mixins: [sku],
  data() {
    return {
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'openstack.standard.vpc',
        configs: {
          resourceLabel: [],
          subnetName: 'vpc_1_subnet',
          name: 'vpc_1',
          ipAddress: '',
          prefixLength: '',
          subNetwork: [
            [192, 168, 0, 0, 24],
            [172, 16, 0, 0, 16]
          ],
          subRadio: 0
        }
      },
      elements: [
        {
          name: '子网',
          serviceCode: 'openstack.standard.vpc',
          ...element
        }
      ],
      retention: false
    }
  },
  created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.addData = cloneDeep(this.retention)
      this.handleShowData()
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then(data => {
        if (data.success) {
          this.retention = JSON.parse(data.data.inventory)
          this.addData = cloneDeep(this.retention)
          this.handleShowData()
        }
      })
    }
  },
  methods: {
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    getConfigs() {
      const { configs } = this.addData
      const cidrArr = [...this.addData.configs.subNetwork[this.addData.configs.subRadio]]
      return {
        ...configs,
        prefixLength: cidrArr.pop(),
        ipAddress: cidrArr.join('.')
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
