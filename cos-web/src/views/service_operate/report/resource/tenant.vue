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
          <el-select v-model="params.tenantId" @change="getAllData()" clearable>
            <el-option v-for="item in tenantList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" @click="exportData" icon="el-icon-download">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card header="租户资源报表" class="m-t">
      <basic-table :data="listData" :params="listParams" :get-list="getList" :total="total">
        <el-table-column label="租户名称" show-overflow-tooltip prop="name"> </el-table-column>
        <el-table-column :label="item.name" :prop="item.code" show-overflow-tooltip v-for="item in columns" :key="item.code"></el-table-column>
        <el-table-column label="小计" show-overflow-tooltip prop="subtotal"> </el-table-column>
      </basic-table>
    </el-card>
    <rich-charts title="租户资源使用统计" defaultChart="line-charts" :data="compouteTrend" v-if="compouteTrend" class="m-t">
      <TimeSelect :get-data="getCompouteTrend"></TimeSelect>
    </rich-charts>
  </div>
</template>
<script>
import { getCloudVendor } from 'services/platform/index'
import { getTenant } from 'services/system/tenant'
import { getResourceChart, getTenantReport, exportReport } from 'services/report/resource'
export default {
  data() {
    return {
      loading: false,
      vendorList: [],
      tenantList: [],
      compouteTrend: '',
      listData: [],
      columns: [],
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
    getTenant({ simple: true }).then((data) => {
      if (data.success) {
        this.tenantList = data.data.rows
      }
    })
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
      const { vendorId, tenantId } = this.params
      const data = await getTenantReport({
        ...this.listParams,
        params: this.$tools.handleSearchParam({
          vendorId,
          id: tenantId
        })
      })
      if (data.success) {
        const { rows, columns, total } = data.data
        this.listData = rows
        this.columns = columns
        this.total = total
      }
    },
    async getCompouteTrend(params = {}) {
      this.params = {
        ...this.params,
        ...params
      }
      const data = await getResourceChart({
        ...this.params,
        category: 'tenant'
      })
      if (data.success) {
        this.compouteTrend = data.data
      }
    },
    exportData() {
      exportReport({
        ...this.params,
        category: 'tenant'
      })
    }
  }
}
</script>
<style scoped lang="scss"></style>
