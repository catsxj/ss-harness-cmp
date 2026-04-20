/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :show-az="false" code="network" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled" v-if="isLoadData">
    <basic-form :model="addData.configs" ref="addForm" label-position="left">
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>配置信息</h5>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="CIDR：">
              <el-select style="width: 100px" v-model="addData.configs.one" @change="oneChange">
                <el-option value="10"></el-option>
                <el-option value="172"></el-option>
                <el-option value="192"></el-option> </el-select
              >&nbsp;.&nbsp;
              <el-input-number :disabled="addData.configs.one === '192'" :title="'范围：' + addData.configs.twoMin + '-' + addData.configs.twoMax" v-model="addData.configs.two" :min="addData.configs.twoMin" :max="addData.configs.twoMax" style="width: 100px" :controls="false"></el-input-number
              >&nbsp;.&nbsp;0&nbsp;.&nbsp;0&nbsp;/&nbsp;
              <el-select style="width: 100px" v-model="addData.configs.end">
                <el-option value="16"></el-option>
                <el-option value="17"></el-option>
                <el-option value="18"></el-option>
                <el-option value="19"></el-option>
                <el-option value="20"></el-option>
                <el-option value="21"></el-option>
                <el-option value="22"></el-option>
                <el-option value="23"></el-option>
                <el-option value="24"></el-option>
                <el-option value="25"></el-option>
                <el-option value="26"></el-option>
                <el-option value="27"></el-option>
                <el-option value="28"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>云配置信息</h5>
        <el-row :gutter="20">
          <el-col :span="10">
            <basic-form-item label="名称：" validate="required" prop="name">
              <el-input v-model="addData.configs.name" placeholder="请输入名称" class="basic-cmp"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
    </basic-form>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue'
import { add, element } from '../data/publicInit'
import { cloneDeep } from 'lodash-es'
import { getShoppingCartDetail } from 'services/system/shop_cart'

export default {
  components: { CommonWrapper },
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
  data() {
    return {
      elements: [
        {
          ...element,
          name: 'VPC',
          serviceCode: 'tencent.standard.vpc',
          main: true
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'tencent.standard.vpc',
        configs: {
          resourceLabel: [],
          ipType: 0,
          one: '10',
          two: '0',
          end: '16',
          twoMin: 0,
          twoMax: 255
        }
      },
      retention: false,
      isLoadData: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    }
  },
  created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.addData = cloneDeep(this.retention)
      const { elements } = this.retention
      const [first, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first
        }
      ]
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then((data) => {
        if (data.success) {
          this.retention = JSON.parse(data.data.inventory)
          this.addData = cloneDeep(this.retention)
          const { elements } = this.retention
          const [first, ...others] = elements
          this.elements = [
            {
              ...element,
              ...first
            }
          ]
        }
      })
    }
    this.isLoadData = true
  },
  watch: {
    'addData.location.vendorType'() {
      this.$emit('type', this.addData.location.vendorType)
    }
  },
  methods: {
    oneChange() {
      if (this.addData.configs.one === '10') {
        this.addData.configs.two = 0
        this.addData.configs.twoMin = 0
        this.addData.configs.twoMax = 255
      } else if (this.addData.configs.one === '172') {
        this.addData.configs.two = 16
        this.addData.configs.twoMin = 16
        this.addData.configs.twoMax = 31
      } else {
        this.addData.configs.two = 168
        this.addData.configs.twoMin = 0
        this.addData.configs.twoMax = 255
      }
    },
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    getParams() {
      let data = false
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.addData.configs.cidr = this.addData.configs.one + '.' + this.addData.configs.two + '.0.0/' + this.addData.configs.end
          data = true
        }
      })
      return data
    }
  }
}
</script>

<style scoped lang="scss"></style>
