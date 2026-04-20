/*
* @Author: sixiaojing
* @Date: 2026-03-06 14:38:46
*/
<template>
  <div class="wrapper" v-loading="loading" style="padding-top: 8px;">
    <el-card class="m-t" :model="searchForm">
      <el-form inline>
        <el-form-item label="租户" prop="tenantId">
          <el-select v-model="searchForm.tenantId" filterable clearable>
            <el-option v-for="(t, index) in tenantList" :key="`tenant-${index}`" :label="t.name" :value="t.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台" prop="vendorId">
          <el-select v-model="searchForm.vendorId" filterable clearable>
            <el-option v-for="(v, index) in vendorList" :key="`zone-${index}`" :label="v.name" :value="v.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="timeArr">
          <el-date-picker type="daterange" v-model="searchForm.timeArr" range-separator="至" start-placeholder="创建开始日期" end-placeholder="创建结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getContents">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-row :gutter="20" style="margin-top: 8px;">
      <el-col :span="8">
        <StatisticsItem title="CPU申请总核数(C)" :count="resourceData.tenantResource.tenantCpuTotal || 0"></StatisticsItem>
      </el-col>
      <el-col :span="8">
        <StatisticsItem title="内存申请总核数(GB)" :count="resourceData.tenantResource.tenantMemoryTotal || 0"></StatisticsItem>
      </el-col>
      <el-col :span="8">
        <StatisticsItem title="存储申请总核数(GB)" :count="resourceData.tenantResource.tenantDiskTotal || 0"></StatisticsItem>
      </el-col>
    </el-row>
    <el-card class="m-t">
      <div style="margin-bottom: 10px; position: relative;">
        租户资源使用占比列表
        <el-button style="position: absolute; right: 8px; top: -8px;" @click="handleExport">导出</el-button>
      </div>
      <SmartTable :data="resourceList" :total="total" :get-list="getResourceList">
        <el-table-column label="租户名称" prop="tenantName" show-overflow-tooltip></el-table-column>
        <el-table-column label="所属网络" prop="vdcName" show-overflow-tooltip></el-table-column>
        <el-table-column label="所属平台" prop="vendorName" show-overflow-tooltip></el-table-column>
        <el-table-column label="平台虚拟机数量" prop="tenantHostTotal" show-overflow-tooltip></el-table-column>
        <el-table-column label="CPU总核数(vCpu)" prop="vendorCpuTotal" show-overflow-tooltip></el-table-column>
        <el-table-column label="内存总量(GB)" prop="vendorMemoryTotal" show-overflow-tooltip></el-table-column>
        <el-table-column label="存储总量(GB)" prop="vendorDiskTotal" show-overflow-tooltip></el-table-column>
        <el-table-column label="CPU资源占用率" prop="tenantCpuUsage" show-overflow-tooltip></el-table-column>
        <el-table-column label="内存资源占用率" prop="tenantMemoryUsage" show-overflow-tooltip></el-table-column>
        <el-table-column label="存储资源占用率" prop="tenantDiskUsage" show-overflow-tooltip></el-table-column>
      </SmartTable>
    </el-card>
  </div>
</template>

<script>
import StatisticsItem from '@/views/cosa/components/Statistics.vue'
import { getReportTenants, getVendorTenants, getTenantResources, getTenantResourceList } from 'services/soa/tenant'
import { downloadFile } from 'utils'
import dayjs from 'utils/day'
export default {
  components: { StatisticsItem },
  data() {
    return {
      loading: false,
      searchForm: {
        timeArr: []
      },
      tenantList: [],
      vendorList: [],
      params: {
        page: 1,
        rows: 5
      },
      resourceData: {
        tenantResource: {},
        vendorResource: {}
      },
      resourceList: [],
      total: 0
    }
  },
  methods: {
    handleExport() {
      const { tenantId, vendorId, timeArr } = this.searchForm
      downloadFile('/cos/v1/tenant/report/resource/download', {
        tenantId,
        vendorId,
        startTime: timeArr[0] || 0,
        endTime: timeArr[0] || 0
      })
    },
    getContents() {
      const { tenantId, vendorId } = this.searchForm
      if (tenantId && vendorId) {
        this.getResources()
        this.getResourceList()
      }
    },
    getResources() {
      const { tenantId, vendorId, timeArr } = this.searchForm
      let startTime = 0
      let endTime = 0
      if (timeArr[0] && timeArr[1]) {
        const s = new Date(timeArr[0])
        const e = new Date(timeArr[1])
        startTime = s.getTime()
        endTime = e.getTime()
      }
      getTenantResources({
        tenantId,
        vendorId,
        startTime,
        endTime
      }).then(res => {
        if (res.success) {
          this.resourceData = res.data
        }
      })
    },
    getResourceList() {
      const { tenantId, vendorId, timeArr } = this.searchForm
      let startTime = 0
      let endTime = 0
      if (timeArr[0] && timeArr[1]) {
        const s = new Date(timeArr[0])
        const e = new Date(timeArr[1])
        startTime = s.getTime()
        endTime = e.getTime()
      }
      getTenantResourceList({
        ...this.params,
        tenantId,
        vendorId,
        startTime,
        endTime
      }).then(res => {
        if (res.success) {
          this.resourceList = res.data.rows
          this.total = res.data.total
        }
      })
    },
    getTenantList() {
      getReportTenants().then(res => {
        if (res.success) {
          this.tenantList = res.data
          this.searchForm.tenantId = this.tenantList[0]?.id
          this.getContents()
        }
      })
    },
    getVendorList() {
      getVendorTenants().then(res => {
        if (res.success) {
          this.vendorList = res.data
          this.searchForm.vendorId = this.vendorList[0]?.id
          this.getContents()
        }
      })
    }
  },
  created() {
    this.getTenantList()
    this.getVendorList()
  }
}
</script>

<style>

</style>
