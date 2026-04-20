/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" ref="common" :elements="elements" :item-data="retention" :disabled="disabled">
    <!-- <basic-form-item label="外部网络：" prop="configs.networkId">
      <el-select v-model="addData.configs.networkId" style="width: 300px">
        <el-option :label="item.name" :value="item.id" v-for="(item, index) in list" :key="index"></el-option>
      </el-select>
    </basic-form-item> -->
  </common-wrapper>
</template>

<script>
import CommonWrapper from '../components/CommonWrapper.vue'
import sku from '../mixins/sku'
import { add, element } from '../data/init'
import { getNetwork } from 'services/platform/index'
import { cloneDeep } from 'lodash-es'
import { getShoppingCartDetail } from 'services/system/shop_cart'

export default {
  components: { CommonWrapper },
  mixins: [sku],
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
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'openstack.standard.eip',
        configs: {
          resourceLabel: [],
          networkId: ''
        }
      },
      elements: [
        {
          name: '浮动IP',
          serviceCode: 'openstack.standard.eip',
          ...element
        }
      ],
      list: [],
      retention: false
    }
  },
  created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.addData = cloneDeep(this.retention)
      this.handleShowData()
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then((data) => {
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
    getList() {
      getNetwork({
        condition: JSON.stringify({
          condition: 'externals',
          vendorId: this.addData.location.vendorId
        })
      }).then((data) => {
        if (data.success) {
          this.list = data.data
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
