<template>
  <div class="wrapper" v-loading="loading">
    <el-card>
      <el-form inline>
        <el-form-item>
          <el-select v-model="params.vendorId" clearable @change="getAllData">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in vendorList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="params.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" @click="getAllData" icon="el-icon-search">搜索</el-button>
          <el-button type="ghost" @click="exportData" icon="el-icon-download">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card header="存储资源报表" class="m-t">
      <basic-table :data="listData" :params="listParams" :get-list="getList" :total="total">
        <el-table-column label="存储池名称" show-overflow-tooltip prop="name"> </el-table-column>
        <el-table-column label="存储池类型" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.deviceType | deviceType }}
          </template>
        </el-table-column>
        <el-table-column label="存储池用途" prop="role" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.role | rolePoolType }}
          </template>
        </el-table-column>
        <el-table-column label="存储池总量（GB）" prop="capacity" show-overflow-tooltip> </el-table-column>
        <el-table-column label="存储池已使用量（GB）" prop="usedCapacity" show-overflow-tooltip></el-table-column>
        <el-table-column label="存储池已使用百分比" show-overflow-tooltip>
          <template v-slot="scope"> {{ ((scope.row.usedCapacity / scope.row.capacity) * 100).toFixed(2) }}% </template>
        </el-table-column>
      </basic-table>
    </el-card>
    <rich-charts title="存储资源统计" defaultChart="line-charts" :data="compouteTrend" v-if="compouteTrend" class="m-t">
      <TimeSelect :get-data="getCompouteTrend"></TimeSelect>
    </rich-charts>
  </div>
</template>
<script>
import { getCloudVendor } from 'services/platform/index'
import { getPools } from 'services/platform/storage.js'
import { getResourceChart, exportReport } from 'services/report/resource'
export default {
  data() {
    return {
      loading: false,
      vendorList: [],
      compouteTrend: '',
      listData: [],
      total: 0,
      listParams: {
        rows: 5,
        page: 1
      },
      params: {
        time: 'Months'
      }
    }
  },
  created() {
    this.getVendorList()
    this.getAllData()
  },
  methods: {
    getAllData() {
      this.listParams.page = 1
      this.getList()
      this.getCompouteTrend()
    },
    getVendorList() {
      getCloudVendor({
        simple: true,
        params: this.$tools.handleSearchParam({ type: 'XSKY' })
      }).then((data) => {
        if (data.success) {
          this.vendorList = data.data.rows
        }
      })
    },
    async getList() {
      const { vendorId, name } = this.params
      const data = await getPools({
        ...this.listParams,
        params: this.$tools.handleSearchParam({
          vendorId,
          'name:LK': name
        })
      })
      if (data.success) {
        this.listData = data.data.rows
        this.listData.forEach((item) => {
          item.props = JSON.parse(item.props)
          item.dataStatus = JSON.parse(item.dataStatus)
        })
        this.total = data.data.total
      }
    },
    async getCompouteTrend(params = {}) {
      this.params = {
        ...this.params,
        ...params
      }
      const data = await getResourceChart({
        ...this.params,
        category: 'storage'
      })
      if (data.success) {
        this.compouteTrend = data.data
      }
    },
    exportData() {
      exportReport({
        ...this.params,
        category: 'storage'
      })
    }
  }
}
</script>
<style scoped lang="scss"></style>
