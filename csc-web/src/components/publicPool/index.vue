<template>
  <div>
    <basic-form-item label="地域：">
      <el-radio-group v-model="addData.data.poolGroupId" @change="getZoneList">
        <el-radio-button :label="item.poolGroupId" v-for="(item, index) in regionList" :key="index">{{ item.name }}</el-radio-button>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item v-if="showZone" label="可用区：">
      <el-radio-group v-model="addData.data.zoneId">
        <el-radio-button :label="item.value" v-for="(item, index) in zoneList" :key="index">{{ item.name }}</el-radio-button>
      </el-radio-group>
    </basic-form-item>
  </div>
</template>
<script>
import { getPoolCondition } from 'services/platform/pool'
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
    },
    showZone: {
      type: Boolean,
      default: () => {
        return true
      }
    }
  },
  data() {
    return {
      regionList: [],
      zoneList: []
    }
  },
  created() {
    this.getRegionList()
  },
  methods: {
    getRegionList() {
      getPoolCondition({
        condition: 'listPoolGroups',
        vendorType: this.vendorType
      }).then(data => {
        if (data.success) {
          this.regionList = data.data.map(item => {
            return {
              name: item.regionName + '_' + item.vendorName,
              value: item.region,
              vendorId: item.vendorId,
              poolGroupId: item.id
            }
          })
          if (this.regionList.length) {
            const { vendorId, value, poolGroupId } = this.regionList[0]
            this.$set(this.addData.data, 'poolGroupId', poolGroupId)
            this.$set(this.addData.data, 'vendorId', vendorId)
            this.$set(this.addData.data, 'regionId', value)
          }
          this.$emit('vendorId')
          this.getZoneList()
        }
      })
    },
    getZoneList() {
      const { vendorId, value } = this.regionList.find(item => item.poolGroupId == this.addData.data.poolGroupId)
      this.addData.data.regionId = value
      this.addData.data.vendorId = vendorId
      getPoolCondition({
        condition: 'listZonesByRegion',
        regionId: this.addData.data.regionId,
        poolGroupId: this.addData.data.poolGroupId,
        vendorId: this.addData.data.vendorId
      }).then(data => {
        if (data.success) {
          this.zoneList = data.data.map(item => {
            return {
              name: item.zoneName,
              value: item.zoneId
            }
          })
          if (this.zoneList.length) {
            this.$set(this.addData.data, 'zoneId', this.zoneList[0].value)
          }
          this.$emit('backZone')
          this.$emit('vendorId')
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
