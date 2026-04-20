/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="network" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled" v-if="isLoadData" :showAz="false">
    <basic-form :model="addData.configs" ref="addForm" label-position="left">
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>配置信息</h5>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="带宽峰值:" prop="bandwidth" validate="required"> <el-input-number v-model="addData.configs.bandwidth" :min="1" :max="500"></el-input-number> <span> Mbps </span> </basic-form-item>
          </el-col>
        </el-row>
      </div>
    </basic-form>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue'
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
  data() {
    return {
      elements: [
        {
          ...element,
          name: 'EIP',
          serviceCode: 'network.aliyun.eip',
          main: true
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'network.aliyun.eip',
        configs: {
          resourceLabel: [],
          bandwidth: 1
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
        service: 'network.aliyun.eip',
        configs: {
          resourceLabel: [],
          bandwidth: 1
        }
      }
    }
    this.isLoadData = true
  },
  methods: {
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    getParams() {
      let data = false
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.addData.configs.regionId = this.addData.location.region
          data = true
        }
      })
      return data
    }
  }
}
</script>

<style scoped lang="scss"></style>
