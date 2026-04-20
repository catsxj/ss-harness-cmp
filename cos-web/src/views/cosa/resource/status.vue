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
    <el-row :gutter="10">
      <el-col :span="12" v-for="item in configs" :key="item.title" class="m-t">
        <rich-charts :title="item.title" v-if="item.data" :data="item.data" height="260px" width="100%"></rich-charts>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getStatusAz } from 'services/soa/resource'
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
      data: [],
      configs: [
        {
          data: '',
          key: 'vendorStatus'
        },
        {
          data: '',
          key: 'hostStatus'
        },
        {
          data: '',
          key: 'vmsStatus'
        },
        {
          data: '',
          key: 'dataStoreStatus'
        }
        // {
        //   data: '',
        //   key: 'databaseStatus'
        // },
        // {
        //   data: '',
        //   key: 'cmsStatus'
        // }
      ]
    }
  },
  created() {
    this.getAllData()
    this.getVendorList()
  },
  methods: {
    getVendorList() {
      getCloudVendor({
        simple: true,
        params: this.$tools.handleSearchParam({})
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
    },
    async getData(item) {
      this.loading = true
      const data = await getStatusAz({
        ...this.params,
        condition: item.key
      })
      if (data.success) {
        const { title, data: result } = data.data
        item.title = title
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
