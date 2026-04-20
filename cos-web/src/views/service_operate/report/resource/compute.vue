<template>
  <div class="wrapper" v-loading="loading">
    <el-card>
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
        <el-form-item>
          <el-input v-model="params.name" placeholder="节点名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" @click="getAllData" icon="el-icon-search">搜索</el-button>
          <el-button type="ghost" @click="exportData" icon="el-icon-download">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card header="计算资源报表" class="m-t">
      <basic-table :data="listData" :params="paging" :get-list="getList" :total="total">
        <el-table-column label="节点名称" show-overflow-tooltip prop="name"> </el-table-column>
        <el-table-column label="所属平台" prop="vendorName" show-overflow-tooltip></el-table-column>
        <el-table-column label="数据中心" prop="vdcName" show-overflow-tooltip>
          <template v-slot="scope">
            <span>{{ scope.row.vdcName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="集群" prop="clusterName" show-overflow-tooltip>
          <template v-slot="scope">
            <span>{{ scope.row.clusterName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="虚机数量" prop="vmNum" show-overflow-tooltip></el-table-column>
        <el-table-column label="CPU总量" prop="vcpu" show-overflow-tooltip></el-table-column>
        <el-table-column label="CPU使用量" prop="vcpuUsed" show-overflow-tooltip></el-table-column>
        <el-table-column label="CPU使用百分比" prop="vcpuPercent" show-overflow-tooltip></el-table-column>
        <el-table-column label="内存总量" prop="memory" show-overflow-tooltip></el-table-column>
        <el-table-column label="内存使用量" prop="memoryUsed" show-overflow-tooltip></el-table-column>
        <el-table-column label="内存使用百分比" prop="memoryPercent" show-overflow-tooltip></el-table-column>
      </basic-table>
    </el-card>
    <rich-charts title="计算资源统计" defaultChart="line-charts" :data="compouteTrend" v-if="compouteTrend" class="m-t">
      <TimeSelect :get-data="getCompouteTrend"></TimeSelect>
    </rich-charts>
  </div>
</template>
<script>
import { getCloudVendor, getVdc, getCluters } from 'services/platform/index'
import { getResourceChart, exportReport, getComputeReport } from 'services/report/resource'
export default {
  data() {
    return {
      loading: false,
      vendorList: [],
      vdcList: [],
      clusterList: [],
      compouteTrend: '',
      listData: [],
      total: 0,
      params: {
        time: 'Months'
      },
      paging: {
        rows: 5,
        page: 1
      }
    }
  },
  created() {
    this.getVendorList()
    this.getAllData()
  },
  methods: {
    getAllData() {
      this.paging.page = 1
      this.getList()
      this.getCompouteTrend()
    },
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
    async getList(item) {
      const data = await getComputeReport({
        ...this.params,
        paging: JSON.stringify(this.paging),
        code: 'resourceReport',
        statsType: 'compute'
      })
      if (data.success) {
        this.listData = data.data.rows
        this.total = data.data.total
      }
    },
    async getCompouteTrend(params = {}) {
      this.params = {
        ...this.params,
        ...params,
        paging: JSON.stringify(this.paging)
      }
      const data = await getResourceChart({
        ...this.params,
        category: 'computer'
      })
      if (data.success) {
        this.compouteTrend = data.data
      }
    },
    exportData() {
      exportReport({
        ...this.params,
        category: 'computer'
      })
    }
  }
}
</script>
<style scoped lang="scss"></style>
