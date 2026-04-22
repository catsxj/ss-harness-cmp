/**
* Created by HaijunZhang on 2019/4/28.
*/
<template>
  <div>
    <el-divider></el-divider>
    <h5>基本信息</h5>
    <el-row :gutter="20">
      <el-col :span="12" v-if="payList && payList.length">
        <basic-form-item label="付费模式：">
          <el-radio-group v-model="mode" @change="selectMode">
            <el-radio-button :label="item.value" v-for="item in payList" :key="item.value">{{item.name}}</el-radio-button>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <basic-form-item label="地域：">
          <el-radio-group v-model="addData.location.region" @change="getZoneList" >
            <el-radio-button :label="item.value" v-for="item in regionList" :key="item.value">{{item.name}}</el-radio-button>
          </el-radio-group>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="可用域：">
          <el-radio-group v-model="addData.location.az" @change="getVendorId" >
            <el-radio-button :label="item.value" v-for="item in zoneList" :key="item.value">{{item.name}}</el-radio-button>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getDictChildren } from 'services/system/dictionary'
import { getPoolCondition } from 'services/platform/pool'
import { conditionServicesList } from 'services/services/catelog.ts'

export default {
  props: {
    addData: {
      type: Object,
      required: true
    },
    vendorType: {
      type: String,
      default: 'OPENSTACK'
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
      bizsList: [],
      projectList: [],
      userList: [],
      mode: this.addData.emption?.duration.mode === 'Hour' ? 'Hour' : 'Month'
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
    if (this.itemData) {
      this.addData.location = {
        ...this.addData.location,
        ...this.itemData.location
      }
    }
    if (!this.addData.location.tenantId && this.userData.accountCategory !== 'Manager') this.addData.location.tenantId = this.userData.tenantId ? this.userData.tenantId : this.userData.id
    this.getRegionList()
    if (!this.addData.service) return;
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
  watch: {
    'addData.emption.duration.mode'() {
      this.mode = this.addData.emption?.duration.mode === 'Hour' ? 'Hour' : 'Month';
    }
  },
  methods: {
    selectMode(mode) {
      if (mode === 'Hour') {
        this.addData.emption.duration.mode = mode;
      } else {
        this.addData.emption.duration.mode = 'Month';
      }
    },
    // 获取地域数据
    getRegionList() {
      getDictChildren({ value: 'REGION' }).then(data => {
        if (data.success) {
          this.regionList = data.data
          const [{ value }] = data.data
          if (!this.addData.location.region) this.addData.location.region = value
          this.getZoneList(this.addData.location.region)
        }
      })
    },
    // 获取可用域数据
    getZoneList(value) {
      // 设置地域数据
      this.addData.regionName = this.regionMap[value]
      getDictChildren({ value }).then(data => {
        if (data.success) {
          this.zoneList = data.data
          if (!this.addData.location.az) {
            const [{ value }] = data.data
            this.addData.location.az = value
          }
          this.getVendorId()
        }
      })
    },
    // 为资源服务时获取平台ID
    getVendorId(az) {
      // 设置可用域数据
      this.addData.zoneName = this.zoneMap[this.addData.location.az]
      getPoolCondition({
        condition: 'getByAz',
        region: this.addData.location.region,
        az: this.addData.location.az,
        vendorType: this.addData.location.vendorType || this.vendorType
      }).then(data => {
        if (data.success) {
          this.cacheAz = this.addData.location.az;
          const { vendorId, id, networkRelations } = data.data
          this.addData.location.vendorId = vendorId
          this.addData.location.poolGroupId = id
          if (this.addData.location.vendorType == 'VMWARE') this.addData.networkRelations = networkRelations
          // if (hasNsx) this.$set(this.addData.location, 'hasNsx', hasNsx)
          this.$emit('changeVendorId', vendorId, az)
        } else { // 可用域下不存在资源池时不能选择
          this.addData.location.az = this.cacheAz;
        }
      })
    }
  }
}
</script>
