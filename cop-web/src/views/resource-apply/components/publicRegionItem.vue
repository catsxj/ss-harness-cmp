/**
* Created by HaijunZhang on 2019/4/28.
*/
<template>
  <div>
    <el-divider></el-divider>
    <h5>基本信息</h5>
    <el-row :gutter="20">
      <el-col :span="12">
        <basic-form-item label="付费模式：">
          <el-radio-group v-model="addData.emption.duration.mode" >
            <el-radio-button :label="item.value" v-for="(item, index) in payList" :key="index">{{item.name}}</el-radio-button>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <basic-form-item label="地域：">
          <el-radio-group v-model="addData.location.poolGroupId" @change="getZoneList" >
            <el-radio-button :label="item.poolGroupId" v-for="(item, index) in regionList" :key="index">{{item.name}}</el-radio-button>
          </el-radio-group>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="可用域：">
          <el-radio-group v-model="addData.location.az" @change="setZone" >
            <el-radio-button :label="item.value" v-for="(item, index) in zoneList" :key="index">{{item.name}}</el-radio-button>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getPoolCondition } from 'services/platform/pool'
import { conditionServicesList } from 'services/services/catelog.ts'
import { getBizs } from 'services/system/bizs'
import { conditionProject } from 'services/system/project'
import { getUser } from 'services/system/manager'
export default {
  props: {
    addData: {
      type: Object,
      required: true
    },
    vendorType: {
      type: String,
      default: 'VMWARE'
    },
    payList: {
      type: Array
    },
    code: {
      type: String,
      default: 'compute'
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
      regionList: [],
      zoneList: [],
      cacheAz: '',
      list: [],
      bizsList: [],
      projectList: [],
      userList: []
    }
  },
  computed: {
    userData () {
      return this.$store.state.app.userData
    },
    regionMap() {
      const map = {}
      this.regionList.forEach(item => {
        const { name, value } = item
        map[value] = name
      })
      return map
    },
    zoneMap() {
      const map = {}
      this.zoneList.forEach(item => {
        const { name, value } = item
        map[value] = name
      })
      return map
    }
  },
  created() {
    if (!this.addData.location.tenantId) this.addData.location.tenantId = this.userData.tenantId ? this.userData.tenantId : this.userData.id
    this.getRegionList()
    conditionServicesList({
      condition: JSON.stringify({
        condition: 'queryByCode',
        code: this.addData.service
      })
    }).then(data => {
      if (data.success) {
        this.addData.serviceItem = data.data;
      }
    })
  },
  methods: {
    getRegionList () {
      getPoolCondition({
        condition: 'listPoolGroups',
        vendorType: this.addData.location.vendorType,
        tenantId: this.addData.location.tenantId
      }).then(data => {
        if (data.success) {
          this.regionList = data.data.map(item => {
            return {
              name: item.regionName + '_' + item.vendorName,
              value: item.region,
              regionId: item.regId,
              vendorId: item.vendorId,
              poolGroupId: item.id
            }
          })
          if (this.regionList.length) {
            if (this.itemData) {
              this.addData.location.poolGroupId = this.itemData.location.poolGroupId
            } else {
              this.addData.location.poolGroupId = this.regionList[0].poolGroupId
            }
            const { vendorId, value, regionId } = this.regionList.find(item => item.poolGroupId == this.addData.location.poolGroupId)
            this.addData.location.vendorId = vendorId
            this.addData.location.region = value
            this.addData.location.regionId = regionId
            this.getZoneList();
          }
          this.$emit('vendorId')
        }
      })
    },
    // 获取可用域数据
    getZoneList () {
      const { vendorId, value } = this.regionList.find(item => item.poolGroupId == this.addData.location.poolGroupId)
      this.addData.location.region = value;
      this.addData.location.vendorId = vendorId
      this.addData.regionName = this.regionMap[value]
      getPoolCondition({
        condition: 'listZonesByRegion',
        regionId: this.addData.location.region,
        poolGroupId: this.addData.location.poolGroupId,
        vendorId: this.addData.location.vendorId
      }).then(data => {
        if (data.success) {
          this.zoneList = data.data.map(item => {
            return {
              name: item.zoneName,
              value: item.zoneId,
              diskCategory: item.diskCategory
            }
          })
          if (this.zoneList.length) {
            if (this.itemData && this.itemData.location.region == this.addData.location.region) {
              this.addData.location.az = this.itemData.location.az
            } else {
              this.addData.location.az = this.zoneList[0].value
            }
            const { diskCategory } = this.zoneList.find(item => item.value == this.addData.location.az)
            this.$set(this.addData.location, 'diskCategory', diskCategory)
            this.addData.zoneName = this.zoneMap[this.addData.location.az]
          }
          this.$emit('backZone')
          this.$emit('vendorId')
        }
      })
    },
    setZone () {
      const { diskCategory } = this.zoneList.find(item => item.value == this.addData.location.az)
      this.addData.location.diskCategory = diskCategory
      this.addData.zoneName = this.zoneMap[this.addData.location.az]
      this.$emit('backZone')
    }
  }
}
</script>
