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
          <el-input v-model="params.name" placeholder="IP池名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" @click="getAllData" icon="el-icon-search">搜索</el-button>
          <el-button type="ghost" @click="exportData" icon="el-icon-download">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card header="IP资源报表" class="m-t">
      <basic-table :data="listData" :params="listParams" :get-list="getList" :total="total">
        <el-table-column label="IP资源池名称" show-overflow-tooltip prop="name">
          <template v-slot="scope">
            <span>{{ scope.row.name || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所属平台" prop="vendorName" show-overflow-tooltip></el-table-column>
        <el-table-column label="地址段" prop="pools" show-overflow-tooltip> </el-table-column>
        <el-table-column label="IP总数" prop="ipTotal" show-overflow-tooltip> </el-table-column>
        <el-table-column label="已使用IP个数" prop="ipUsed" show-overflow-tooltip></el-table-column>
        <el-table-column label="未使用IP个数" prop="ipFree" show-overflow-tooltip></el-table-column>
      </basic-table>
    </el-card>
    <rich-charts title="IP资源统计" defaultChart="line-charts" :data="compouteTrend" v-if="compouteTrend" class="m-t">
      <TimeSelect :get-data="getCompouteTrend"></TimeSelect>
    </rich-charts>
  </div>
</template>
<script>
import { getCloudVendor, getIpPool } from 'services/platform/index'
import { getResourceChart, exportReport } from 'services/report/resource'
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
        params: this.$tools.handleSearchParam({})
      }).then((data) => {
        if (data.success) {
          this.vendorList = data.data.rows
        }
      })
    },
    async getList() {
      const { vendorId, name } = this.params
      const data = await getIpPool({
        ...this.listParams,
        params: this.$tools.handleSearchParam({
          vendorId,
          countIp: true,
          'name:LK': name
        })
      })
      if (data.success) {
        this.listData = data.data.rows
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
        category: 'ip'
      })
      if (data.success) {
        this.compouteTrend = data.data
      }
    },
    exportData() {
      exportReport({
        ...this.params,
        category: 'ip'
      })
    }
  }
}
</script>
<style scoped lang="scss"></style>
