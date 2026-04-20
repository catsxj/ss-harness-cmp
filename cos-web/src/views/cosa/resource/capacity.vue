<template>
  <div class="wrapper">
    <el-card class="m-t count" title="进入详情页" v-loading="loading">
      <div class="click" @click="gotoDetail">
        <!-- <div style="padding: 10px 0 0">云平台物理资源总量</div>
        <el-row :gutter="5" class="m-t-xs">
          <el-col :span="6" :xl="6">
            物理机:
            <span>{{ countData.hostNum === undefined ? 0 : countData.hostNum + '台' }}</span>
          </el-col>
          <el-col :span="6" :xl="6">
            物理CPU:
            <span>{{ countData.hostCpu === undefined ? 0 : countData.hostCpu + '核' }}</span>
          </el-col>
          <el-col :span="6" :xl="6">
            内存:
            <span>{{ countData.hostMem === undefined ? 0 : countData.hostMem + 'GB' }}</span>
          </el-col>
          <el-col :span="6" :xl="6">
            磁盘:
            <span>{{ countData.hostDisk === undefined ? 0 : countData.hostDisk + 'TB' }}</span>
          </el-col>
        </el-row> -->
        <div style="padding: 20px 0 0">云平台虚拟资源总量</div>
        <el-row :gutter="5" class="m-t-xs">
          <el-col :span="6" :xl="6">
            云主机:
            <span>{{ countData.vmNum === undefined ? 0 : countData.vmNum + '台' }}</span>
          </el-col>
          <el-col :span="6" :xl="6">
            VCPU:
            <span style="margin-left: 24px">{{ countData.vmCpu === undefined ? 0 : countData.vmCpu + '核' }}</span>
          </el-col>
          <el-col :span="6" :xl="6">
            内存:
            <span>{{ countData.vmMem === undefined ? 0 : countData.vmMem + 'GB' }}</span>
          </el-col>
          <el-col :span="6" :xl="6">
            磁盘:
            <span>{{ countData.vmDisk === undefined ? 0 : countData.vmDisk + 'TB' }}</span>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <el-card class="m-t">
      <el-form inline>
        <el-form-item>
          <el-select v-model="params.vendorId" @change="getVdc">
            <el-option v-for="item in vendorList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="params.vdcId" @change="getCluster" clearable>
            <el-option v-for="item in vdcList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="params.clusterId" @change="getAllData" clearable>
            <el-option v-for="item in clusterList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="m-t" header="容量使用趋势">
      <el-form inline>
        <el-form-item>
          <el-select v-model="params.resourceType" @change="getTrendDataMem()">
            <el-option value="meta.cpu" label="CPU"></el-option>
            <el-option value="meta.mem" label="内存"></el-option>
            <el-option value="meta.disk" label="存储"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <TimeSelect :get-data="getTrendDataMem"></TimeSelect>
        </el-form-item>
      </el-form>
      <line-charts :data="trendDataMem.used" v-if="trendDataMem.used" id="used_trend" width="100%" height="260px" :setting="chartSetting"> </line-charts>
      <line-charts :data="trendDataMem.forecast" v-if="trendDataMem.forecast" id="forecast_trend" width="100%" height="260px" :setting="chartSetting"> </line-charts>
    </el-card>
    <el-card class="m-t" header="云主机使用趋势">
      <el-form inline>
        <el-form-item>
          <TimeSelect :get-data="getTrendDataVm"></TimeSelect>
        </el-form-item>
      </el-form>
      <line-charts :data="trendDataVm.used" v-if="trendDataVm.used" id="vm_used_trend" width="100%" height="260px" :setting="chartSetting"> </line-charts>
      <line-charts :data="trendDataVm.forecast" v-if="trendDataVm.forecast" id="vm_forecast_trend" width="100%" height="260px" :setting="chartSetting"> </line-charts>
    </el-card>
    <Detail :detailData="detailData" v-if="detailData.visible"></Detail>
  </div>
</template>
<script>
import { chartSetting } from '@/views/cosa/configs'
import { getCapacityCount, getCapacityAz } from 'services/soa/resource'
import { getCloudVendor, getVdc, getCluters } from 'services/platform/index'
import Detail from './capacityDetail.vue'
export default {
  components: {
    Detail
  },
  data() {
    return {
      loading: false,
      vendorList: [],
      vdcList: [],
      clusterList: [],
      params: {
        time: 'Months',
        resourceType: 'meta.cpu'
      },
      countData: {},
      trendDataMem: {},
      trendDataVm: {},
      chartSetting,
      detailData: {
        visible: false,
        name: 'sasasc'
      },
      searchParams: {}
    }
  },
  created() {
    this.getCountData()
    this.getVendorList()
  },
  methods: {
    gotoDetail() {
      this.detailData.visible = true
    },
    getAllData() {
      this.getTrendDataMem()
      this.getTrendDataVm()
    },
    getVendorList() {
      getCloudVendor({
        simple: true,
        params: this.$tools.handleSearchParam({})
      }).then((data) => {
        if (data.success) {
          this.vendorList = data.data.rows
          this.params.vendorId = this.vendorList[0].id
          this.getVdc()
        }
      })
    },
    async getVdc() {
      // 清除数据
      this.params.vdcId = ''
      this.params.clusterId = ''
      this.clusterList = []
      this.getAllData()
      const data = await getVdc({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId: this.params.vendorId
        })
      })
      if (data.success) {
        this.vdcList = data.data.rows
      }
    },
    async getCluster() {
      this.params.clusterId = ''
      this.getAllData()
      const { vdcId, vendorId } = this.params
      const data = await getCluters({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId,
          vdcId
        })
      })
      if (data.success) {
        this.clusterList = data.data.rows
      }
    },
    async getCountData() {
      const data = await getCapacityCount()
      if (data.success) {
        this.countData = data.data
      }
    },
    async getTrendDataMem(param = {}) {
      this.loading = true
      if (Object.keys(param).length > 0) {
        this.searchParams = param
      }
      const data = await getCapacityAz({ ...this.params, ...this.searchParams, condition: 'getCapacity' })
      if (data.success) {
        this.trendDataMem = data.data
      }
      this.loading = false
    },
    async getTrendDataVm(param = {}) {
      this.loading = true
      const params = Object.assign({}, this.params)
      delete params.resourceType
      const data = await getCapacityAz({ ...params, ...param, condition: 'getVm' })
      if (data.success) {
        this.trendDataVm = data.data
      }
      this.loading = false
    }
  }
}
</script>
<style scoped lang="scss">
.wrapper {
  width: 100%;
  overflow-x: hidden;
}
.count {
  cursor: pointer;
  position: relative;
  height: 200px;
  ::v-deep .el-card__body {
    padding: 0 !important;
  }
  .click {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 20px;
  }
  .el-row {
    span {
      color: rgb(66, 47, 231);
      font-size: 26px;
      padding-left: 20px;
    }
  }
}
</style>
