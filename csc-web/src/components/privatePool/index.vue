<template>
  <div>
    <basic-form-item label="地域：">
      <el-radio-group v-model="addData.regionId" @change="getZoneList">
        <el-radio-button :label="item.value" v-for="(item, index) in regionList" :key="index">{{ item.name }}</el-radio-button>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="可用区：">
      <el-radio-group v-model="addData.zoneId" @change="getVendorId">
        <el-radio-button :label="item.value" v-for="(item, index) in zoneList" :key="index">{{ item.name }}</el-radio-button>
      </el-radio-group>
    </basic-form-item>
  </div>
</template>
<script>
import { getPoolCondition } from 'services/platform/pool'
import { getDictionaries } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    vendorType: {
      type: [Array, String],
      default: ''
    }
  },
  data() {
    return {
      regionList: [],
      zoneList: [],
      cache: ''
    }
  },
  created() {
    this.getRegionList()
  },
  methods: {
    getRegionList() {
      getPoolCondition({
        condition: 'listTenantRegionDictionary',
        vendorType: this.vendorType
      }).then(data => {
        if (data.success) {
          this.regionList = data.data
          const [{ value }] = data.data
          this.addData.regionId = value
          this.getZoneList(value)
        }
      })
    },
    getZoneList() {
      this.zoneList = this.regionList.find(item => item.value == this.addData.regionId).children
      const [{ value }] = this.zoneList
      this.$set(this.addData, 'zoneId', value)
      this.getVendorId()
    },
    getVendorId() {
      getPoolCondition({
        condition: 'getByAz',
        region: this.addData.regionId,
        az: this.addData.zoneId,
        vendorType: this.vendorType
      }).then(data => {
        if (data.success) {
          this.cache = this.addData.zoneId
          const { vendorId } = data.data
          this.addData.vendorId = vendorId || ''
          this.$emit('vendorId')
        } else {
          this.$set(this.addData, 'zoneId', this.cache)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
