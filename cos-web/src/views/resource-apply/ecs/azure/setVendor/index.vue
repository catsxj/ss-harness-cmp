<template>
  <div>
    <basic-form-item label="平台类型：" prop="vendorType" validate="required">
      <el-select v-model="addData.vendorType" @change="getPool('region')">
        <el-option v-for="(item, index) in vendorList" :key="index" :label="item" :value="item"></el-option>
      </el-select>
    </basic-form-item>
    <publics :vendor-type="addData.vendorType" v-if="addData.vendorType == 'TCE' || addData.vendorType == 'TENCENT' || addData.vendorType == 'HUAWEI' || addData.vendorType == 'ALIYUN' || addData.vendorType == 'AZURE'" :add-data="addData" @getPool="getPool('zone')"></publics>
    <privately :add-data="addData" v-else @getPool="getPool('zone')"></privately>
    <basic-form-item label="资源池：" prop="vendorId" validate="required">
      <el-radio-group v-model="addData.vendorId" v-if="addData.availablitiyZone">
        <el-radio class="m-t-xs" border v-for="(item, index) in poolList" :key="index" :label="item.vendorId">{{ item.name }}</el-radio>
      </el-radio-group>
    </basic-form-item>
  </div>
</template>
<script>
import { getDictionaries, getCloudVendor } from 'services/platform/index'
import { getPool } from 'services/platform/pool'
import privately from './privately.vue'
import publics from './public.vue'
export default {
  components: { privately, publics },
  props: {
    addData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    types: {
      type: [Array, String],
      default: ''
    }
  },
  data() {
    return {
      poolList: [],
      vendorList: []
    }
  },
  created() {
    getCloudVendor({
      condition: JSON.stringify({
        condition: 'listTypeByTenant',
        types: this.types
      })
    }).then((data) => {
      if (data.success) {
        this.vendorList = data.data
        if (!this.addData.vendorType) this.$set(this.addData, 'vendorType', this.vendorList[0])
      }
    })
  },
  methods: {
    getPool(change) {
      if (change == 'region') {
        this.addData.region = ''
        this.addData.availablitiyZone = ''
        this.poolList = []
        this.addData.vendorId = ''
      } else if (change == 'zone') {
        this.poolList = []
        this.addData.vendorId = ''
      }
      if (!this.addData.region || !this.addData.availablitiyZone || !this.addData.vendorType) return
      console.log(1)
      getPool({
        condition: JSON.stringify({
          condition: 'getByAz',
          region: this.addData.region,
          az: this.addData.availablitiyZone,
          vendorType: this.addData.vendorType
        })
      }).then((data) => {
        this.poolList = []
        if (data.success) {
          this.poolList = data.data ? [data.data] : []
          if (data.data) {
            this.$set(this.addData, 'vendorId', data.data.vendorId)
            this.$emit('back')
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
