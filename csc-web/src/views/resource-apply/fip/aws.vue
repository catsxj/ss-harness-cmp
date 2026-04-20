/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="network" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled" v-if="isLoadData">
    <basic-form :model="addData.configs" ref="addForm" label-position="left">
      <div class="item-block">
        <h5>云配置信息</h5>
        <el-row :gutter="20">
          <el-col :span="24"> </el-col>
          <el-col :span="10">
            <basic-form-item label="名称：" validate="required" prop="name">
              <el-input v-model="addData.configs.name" placeholder="请输入名称" class="basic-cmp"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label=" ">
              <p style="font-size: 12px">
                通过选择从其中分配公有 IP 地址的公有 IPv4 地址池来分配弹性 IP 地址。您可以为运行中的实例免费关联一个弹性 IP (EIP)地址。如果将更多 EIP 与该实例关联，则将按比例向与该实例相关联的每个额外 EIP 收费。额外 EIP 只能在 Amazon VPC 中使用。为确保有效使用弹性 IP 地址，当这些 IP
                地址未与运行中的实例相关联或者关联到已停止的实例或未连接的网络接口时，我们会按小时收取少量费用。
              </p>
            </basic-form-item>
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
          serviceCode: 'network.aws.eip',
          main: true
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'network.aws.eip',
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
        service: 'network.aws.eip',
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
