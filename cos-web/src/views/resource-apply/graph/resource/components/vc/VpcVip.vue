<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <div v-if="addData.value && addData.value.location && addData.value.location.vendorType === 'JDCLOUD'">京东云平台暂不支持网络VIP节点，请切换为VMWARE平台后再进行配置</div>
    <div v-else>
      <RegionItem :add-data="itemData" @changeVendorId="changeVendorId" vendorType="VMWARE"></RegionItem>
      <h5>配置信息</h5>
      <basic-form-item label="IP池列表：" prop="ipPoolId" :validate="validateRule">
        <el-select v-model="itemData.ipPoolId" clearable filterable>
          <el-option v-for="item in itemData.networkRelations" :key="item.ipPoolId" :label="item.ipPoolName" :value="item.ipPoolId"></el-option>
        </el-select>
      </basic-form-item>
    </div>
  </basic-form>
</template>
<script>
import node from '../../../mixins/index'
import show from '../../../mixins/show'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'

export default {
  components: { RegionItem },
  mixins: [node, show],
  inject: ['addData'],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          origin: 'create',
          location: {
            region: '',
            az: '',
            vendorId: '',
            poolGroupId: '',
            vendorType: 'VMWARE'
          },
          networkRelations: [],
          ipPoolId: ''
        }
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    validateRule() {
      return this.isTemplate ? '' : 'required'
    }
  },
  created() {
    if (!this.itemData.networkRelations) {
      this.$set(this.itemData, 'networkRelations', [])
    }
  },
  methods: {
    changeVendorId(vendorId, clear) {
      if (clear || !this.itemData.ipPoolId) {
        // 数据默认选中
        const {
          networkRelations: [{ ipPoolId }]
        } = this.itemData
        this.itemData.ipPoolId = ipPoolId
      }
    },
    getPostData() {
      let data = false
      if (this.addData?.value?.location?.vendorType === 'JDCLOUD') return false
      this.$refs.form.validate((valid) => {
        if (valid) {
          const { location, ipPoolId, origin } = this.itemData
          data = { location, ipPoolId, origin }
        }
      })
      return data
    }
  }
}
</script>
<style></style>
