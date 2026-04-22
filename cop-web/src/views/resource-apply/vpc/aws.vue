/**
* Created by HaijunZhang on 2019/4/28.
*/
<template>
  <common-wrapper code="network" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled" v-if="isLoadData">
    <basic-form :model="addData.configs" ref="addForm" label-position="left">
      <el-divider></el-divider>
      <h5>配置信息</h5>
      <el-row :gutter="20">
        <el-col :span="12">
          <basic-form-item label="cidr: " prop="cidr" validate="required,cidr">
            <el-input v-model="addData.configs.cidr"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="13">
          <basic-form-item label="IPV6 CIDR：" prop="providedIpv6Cidr" validate="required" label-width="120px">
            <el-radio-group v-model="addData.configs.providedIpv6Cidr">
              <el-radio label="0">无IPV6 CIDR</el-radio>
              <el-radio label="1">Amazon</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-divider></el-divider>
      <h5>云配置信息</h5>
      <el-row :gutter="20">
        <el-col :span="10">
          <basic-form-item label="名称：" validate="required" prop="name">
            <el-input v-model="addData.configs.name" placeholder="请输入名称"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue';
import { add, element } from './../data/publicInit'
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
  data () {
    return {
      elements: [{
        ...element,
        name: 'VPC',
        serviceCode: 'aws.standard.vpc',
        main: true
      }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'aws.standard.vpc',
        configs: {
          providedIpv6Cidr: '0',
          cidr: ''
        }
      },
      retention: false,
      isLoadData: false
    }
  },
  computed: {
    currentElement () {
      return this.elements[0]
    }
  },
  created () {
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
      getShoppingCartDetail(this.$route.query.id).then(data => {
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
    } else {
      this.addData = {
        ...add,
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'aws.standard.vpc',
        configs: {
          providedIpv6Cidr: '0',
          cidr: ''
        }
      }
    }
    this.isLoadData = true
  },
  watch: {
    'addData.location.vendorType' () {
      this.$emit('type', this.addData.location.vendorType)
    }
  },
  methods: {
    getPostData () {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    getParams () {
      let data = false;
      this.$refs.addForm.validate(valid => {
        if (valid) {
          data = true
        }
      })
      return data;
    }
  }
}
</script>

<style scoped lang="scss">
</style>
