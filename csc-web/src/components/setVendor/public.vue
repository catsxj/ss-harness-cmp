<template>
  <div>
    <basic-form-item label="地域：" prop="region" validate="required" style="max-width: 100%">
      <el-radio-group v-model="addData.region" @change="getZoneList">
        <el-radio class="m-t-xs" border v-for="(item, index) in dictionaries" :key="index" :label="item.value">{{ item.name }}</el-radio>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="可用区：" prop="availablitiyZone" validate="required" style="max-width: 100%">
      <el-select v-model="addData.availablitiyZone" @change="$emit('getPool', false)">
        <el-option v-for="(item, index) in dictionariesChild" :key="index" :label="item.name" :value="item.value"></el-option>
      </el-select>
    </basic-form-item>
  </div>
</template>
<script>
import { getDictionaries, getRegion } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    vendorType: {
      type: String
    }
  },
  data() {
    return {
      dictionariesChild: [],
      dictionaries: [],
      regions: []
    }
  },
  created() {
    this.getRegionList()
    this.$set(this.addData, 'region', '')
    this.$set(this.addData, 'availablitiyZone', '')
  },
  watch: {
    vendorType() {
      this.getRegionList()
      this.$set(this.addData, 'region', '')
      this.$set(this.addData, 'availablitiyZone', '')
    }
  },
  methods: {
    getRegionList() {
      getRegion({ condition: 'listByTenant', vendorType: this.addData.vendorType }).then(data => {
        if (data.success) {
          this.regions = data.data
          this.dictionaries = []
          data.data.forEach(item => {
            this.dictionaries.push({ name: item.name, value: item.regionId })
          })
          this.addData.region = this.dictionaries[0].value
          this.addData.regionId = this.dictionaries[0].value
          this.getZoneList()
        }
      })
    },
    // 获取可用区数据
    getZoneList(value) {
      this.addData.regionId = this.addData.region
      this.regions.forEach(item => {
        if (this.addData.region == item.regionId) {
          this.dictionariesChild = []
          item.zones.forEach(item => {
            this.dictionariesChild.push({ name: item.name, value: item.zoneId })
          })
          this.addData.availablitiyZone = this.dictionariesChild[0].value
          this.$emit('getPool', false)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
