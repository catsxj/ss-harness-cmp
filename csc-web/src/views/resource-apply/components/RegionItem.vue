/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div class="item-block">
    <!-- <el-divider></el-divider> -->
    <h5>基本信息</h5>
    <el-row :gutter="20">
      <el-col :span="12" v-if="payList && payList.length">
        <basic-form-item label="付费模式：">
          <el-radio-group v-model="mode" @change="selectMode">
            <el-radio-button :label="item.value" v-for="item in payList" :key="item.value">{{ item.name }}</el-radio-button>
          </el-radio-group>
          <el-tooltip class="item" effect="dark" :content="modeTitle[mode]" placement="right">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <basic-form-item label="地域：">
          <el-radio-group v-model="addData.location.region" @change="getZoneList">
            <el-radio-button :label="item.value" v-for="item in regionList" :key="item.value">{{ item.name }}</el-radio-button>
          </el-radio-group>
          <el-tooltip class="item" effect="dark" content="指资源所属物理数据中心所在的位置，地域不同即资源所在数据中心距离用户的物理距离不同，网络延迟不同。" placement="right">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="可用区：">
          <el-radio-group v-model="addData.location.az" @change="getVendorId">
            <el-radio-button :label="item.value" v-for="item in zoneList" :key="item.value">{{ item.name }}</el-radio-button>
          </el-radio-group>
          <el-tooltip class="item" effect="dark" content="可用区是在同一地域下，电力、网络隔离的物理区域，通常可用区之间内网互通，不同可用区之间物理隔离。" placement="right">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </basic-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getDictionaries } from 'services/platform/index'
import { getPoolCondition } from 'services/platform/pool'
import { conditionServicesList } from 'services/services/catelog.ts'

export default {
  props: {
    addData: {
      type: Object,
      required: true
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
      modeTitle: {
        Hour: '按量计费是后付费模式，按资源的实际使用时长计费，可以随时订购/退订资源。',
        Month: '包年包月是预付费模式，按订单的购买周期计费，适用于可预估资源使用周期的场景。'
      },
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
    userData() {
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
    if (!this.addData.service) return
    conditionServicesList({
      condition: JSON.stringify({
        condition: 'queryByCode',
        code: this.addData.service
      })
    }).then(data => {
      if (data.success) {
        this.addData.serviceItem = data.data
      }
    })
  },
  watch: {
    'addData.emption.duration.mode'() {
      this.mode = this.addData.emption?.duration.mode === 'Hour' ? 'Hour' : 'Month'
    }
  },
  methods: {
    selectMode(mode) {
      if (mode === 'Hour') {
        this.addData.emption.duration.mode = mode
      } else {
        this.addData.emption.duration.mode = 'Month'
      }
    },
    // 获取地域数据
    getRegionList() {
      getPoolCondition({
        condition: 'listTenantRegionDictionary',
        vendorType: this.addData.location.vendorType,
        tenantId: this.addData.location.tenantId
      }).then(data => {
        if (data.success) {
          this.regionList = data.data
          const [{ value }] = data.data
          if (!this.addData.location.region) this.addData.location.region = value
          this.getZoneList(this.addData.location.region)
        }
      })
    },
    // 获取可用区数据
    getZoneList(value) {
      // 设置地域数据
      this.addData.regionName = this.regionMap[value]
      this.zoneList = this.regionList.find(item => item.value == this.addData.location.region).children
      if (!this.addData.location.az) {
        const [{ value }] = this.zoneList
        this.addData.location.az = value
      }
      this.getVendorId()
    },
    // 为资源服务时获取平台ID
    getVendorId(az) {
      // 设置可用区数据
      this.addData.zoneName = this.zoneMap[this.addData.location.az]
      getPoolCondition({
        condition: 'getByAz',
        region: this.addData.location.region,
        az: this.addData.location.az,
        vendorType: this.addData.location.vendorType
      }).then(data => {
        if (data.success) {
          this.cacheAz = this.addData.location.az
          const { vendorId, id, networkRelations, azUuid, groupId } = data.data
          this.addData.location.vendorId = vendorId
          this.addData.location.poolGroupId = id
          this.addData.location.azUuid = azUuid
          this.addData.location.groupUuid = groupId
          if (['VMWARE', 'SANGFOR', 'CLOUDTOWER', 'CNWARE'].includes(this.addData.location.vendorType)) this.addData.networkRelations = networkRelations
          // if (hasNsx) this.$set(this.addData.location, 'hasNsx', hasNsx)
          this.$emit('changeVendorId', vendorId, az)
        } else {
          // 可用区下不存在资源池时不能选择
          this.addData.location.az = this.cacheAz
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-icon-question {
  color: #bbbbbd;
  margin-left: 10px;
}
</style>
