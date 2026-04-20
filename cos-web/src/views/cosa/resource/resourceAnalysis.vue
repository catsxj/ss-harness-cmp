<template>
  <div class="wrapper" v-loading="loading">
    <el-card class="m-t">
      <el-form inline>
        <el-form-item>
          <el-select v-model="params.vendorId" @change="getVdc" clearable>
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in vendorList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="params.vdcId" @change="getCluster" clearable>
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in vdcList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="params.clusterId" @change="getAllData" clearable>
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in clusterList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    <el-row :gutter="5" class="m-t-xs">
      <div v-for="item in configs" :key="item.title">
        <el-col :span="6" class="m-t" v-if="item.data.length > 0">
          <rich-charts :setting="chartSetting" :title="item.title" :data="item.data" v-if="item.data"></rich-charts>
        </el-col>
      </div>
    </el-row>
    <el-card class="m-t">
      <div style="margin-bottom: 10px">云平台资源统计</div>
      <SmartTable :data="list">
        <el-table-column prop="vendorName" label="云平台"></el-table-column>
        <!-- <el-table-column prop="clusterCount" label="集群"></el-table-column> -->
        <el-table-column prop="hostCount" label="宿主机"></el-table-column>
        <!-- <el-table-column prop="dataStoreCount" label="数据存储"></el-table-column> -->
        <el-table-column prop="vmsCount" label="云主机"></el-table-column>
        <el-table-column prop="volumeCount" label="云硬盘"></el-table-column>
      </SmartTable>
    </el-card>
  </div>
</template>
<script>
import { getDashboard, getAllCloudCount } from 'services/soa/resource'
import { getCloudVendor, getVdc, getCluters } from 'services/platform/index'
export default {
  data() {
    return {
      loading: false,
      vendorList: [],
      vdcList: [],
      clusterList: [],
      params: {
        vendorId: '',
        vdcId: '',
        clusterId: ''
      },
      chartSetting: {
        richCount: 160
      },
      configs: [
        {
          data: '',
          key: 'vendorCount'
        },
        {
          data: '',
          key: 'hostCount'
        },
        {
          data: '',
          key: 'vmsCount'
        },
        // {
        //   data: '',
        //   key: 'ipPoolCount'
        // },
        {
          data: '',
          key: 'dataStoreCount'
        },
        {
          data: '',
          key: 'databaseCount'
        },
        {
          data: '',
          key: 'cmsCount'
        },
        {
          data: '',
          key: 'volumeCount'
        }
      ],
      list: []
    }
  },
  created() {
    this.getAllData()
    this.getVendorList()
  },
  methods: {
    // 获取列表数据
    async getList() {
      const res = await getAllCloudCount(this.params)
      if (res.success) {
        this.list = res.data.map((item) => {
          if (item.vendorName === 'INSPURRAIL') item.vendorName = 'InspurCloud'
          return item
        })
      }
    },
    getVendorList() {
      getCloudVendor({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorCategory: 'COMPUTE'
        })
      }).then((data) => {
        if (data.success) {
          this.vendorList = data.data.rows
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
    getAllData() {
      this.configs.forEach((item) => {
        this.getData(item)
      })
      this.getList()
    },
    async getData(item) {
      this.loading = true
      const data = await getDashboard({
        ...this.params,
        condition: item.key
      })
      if (data.success) {
        const { title, data: result } = data.data
        item.title = title
        result.map((i) => {
          if (i.name === 'INSPURRAIL') i.name = 'InspurCloud'
          return i
        })
        item.data = result
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
</style>
