<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchData.regionId" clearable>
          <el-option v-for="(item, index) in regionList" :key="index" :label="item.name" :value="item.code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="installDetail" @goBack="goBack">
      <el-tabs value="0">
        <el-tab-pane label="详细规格" name="0">
          <smart-table :data="installDetail.serviceLevelObjectives">
            <el-table-column prop="uuid" label="UUID" show-overflow-tooltip></el-table-column>
            <el-table-column prop="vcore" label="vCore" show-overflow-tooltip></el-table-column>
            <el-table-column prop="edition" label="版本" show-overflow-tooltip></el-table-column>
            <el-table-column prop="hardwareGeneration" label="硬件" show-overflow-tooltip></el-table-column>
            <el-table-column prop="minStorageMB" label="最小存储空间（MB）" show-overflow-tooltip></el-table-column>
            <el-table-column prop="maxStorageMB" label="最大存储空间(MB)" show-overflow-tooltip></el-table-column>
            <el-table-column prop="minBackupRetentionDays" label="最小备份保留天数(天)" show-overflow-tooltip></el-table-column>
            <el-table-column prop="maxBackupRetentionDays" label="最大备份保留天数(天)" show-overflow-tooltip></el-table-column>
          </smart-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
      <el-table-column label="UUID" prop="uuid" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.uuid }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="minStorageMB" label="最小存储空间（MB）" show-overflow-tooltip></el-table-column>
      <el-table-column prop="maxStorageMB" label="最大存储空间(MB)" show-overflow-tooltip></el-table-column>
      <el-table-column prop="minBackupRetentionDays" label="最小备份保留天数(天)" show-overflow-tooltip></el-table-column>
      <el-table-column prop="maxBackupRetentionDays" label="最大备份保留天数(天)" show-overflow-tooltip></el-table-column>
      <el-table-column prop="regionName" label="地域" show-overflow-tooltip></el-table-column>
      <el-table-column prop="dbType" label="规格归属" show-overflow-tooltip></el-table-column>
    </basic-table>
  </el-card>
</template>

<script>
import { getSku, getSkuDetail } from 'services/platform/azure'
import { getRegion } from 'services/platform/index'
const detailSetting = {
  type: 'network',
  columns: [
    [
      { name: 'uuid', value: 'uuid' },
      { name: '最小存储空间（MB）', value: 'minStorageMB' },
      { name: '最大存储空间(MB)', value: 'maxStorageMB' }
    ],
    [
      { name: '最小备份保留天数(天)', value: 'minBackupRetentionDays' },
      { name: '最大备份保留天数(天)', value: 'maxBackupRetentionDays' },
      { name: '地域', value: 'regionName' }
    ],
    [{ name: '规格归属', value: 'dbType' }]
  ]
}
export default {
  props: {
    platformObject: {
      type: Object
    }
  },
  data() {
    return {
      regionList: [],
      params: {
        page: 1,
        rows: 10
      },
      detailSetting,
      searchData: {
        name: ''
      },
      tableData: [],
      total: 0,
      detailFlag: false,
      installDetail: {}
    }
  },
  methods: {
    getData() {
      getSku(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleCreatGroup() {
      this.group = true
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.formatSearchParam({
        lkParam: {
          name: this.searchData.name
        },
        eqParam: {
          vendorId: this.platformObject.azureCloudId,
          regionId: this.searchData.regionId
        }
      })
      this.getData()
    },
    getDetail(id) {
      getSkuDetail(id).then(data => {
        if (data.success) {
          this.detailFlag = true
          this.installDetail = data.data
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    getRegion() {
      getRegion({ vendorId: this.platformObject.azureCloudId }).then(data => {
        if (data.success) {
          this.regionList = data.data
        }
      })
    }
  },
  created() {
    this.getRegion()
    this.handleSearch()
  },
  mounted() {},
  watch: {
    platformObject: {
      handler(newVal, oldVal) {
        this.handleSearch()
        this.getRegion()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.no-searchBox {
  padding: 10px;
}

.diskDeviceItem {
  width: calc(100% - 80px);
}

.diskDeviceTitle {
  width: 50px;
  text-align: right;
  display: inline-block;
  vertical-align: middle;
}
</style>
