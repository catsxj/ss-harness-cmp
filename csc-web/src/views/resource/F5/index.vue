<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input class="search-item" placeholder="virtual server" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="detail" @goBack="goBack">
      <el-tabs value="member">
        <el-tab-pane label="member" name="member">
          <basic-table :data="memberData">
            <el-table-column prop="name" label="名称" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="status" label="状态" show-overflow-tooltip>
              <template slot-scope="scope">
                <status-icon :type="scope.row.status | F5Status('color')">
                  {{ scope.row.status | F5Status('name') }}
                </status-icon>
              </template>
            </el-table-column>
            <el-table-column prop="poolMemberAddress" label="地址" show-overflow-tooltip></el-table-column>
            <el-table-column prop="poolMemberPort" label="端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ratio" label="Ratio" show-overflow-tooltip></el-table-column>
            <el-table-column prop="priority" label="Priority" show-overflow-tooltip></el-table-column>
            <el-table-column prop="connectionLimit" label="Connection Limit" show-overflow-tooltip></el-table-column>
            <el-table-column prop="connectionRateLimit" label="Connection Rate Limit" show-overflow-tooltip></el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="virtual server" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="detail-href" @click="getDetail(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" show-overflow-tooltip>
        <template slot-scope="scope">
          <status-icon :type="scope.row.status | F5Status('color')">
            {{ scope.row.status | F5Status('name') }}
          </status-icon>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
      <el-table-column prop="port" label="端口" show-overflow-tooltip></el-table-column>
      <el-table-column label="pool" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.pool ? scope.row.pool.name : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="vendorName" label="所属平台" show-overflow-tooltip></el-table-column>
    </basic-table>
  </el-card>
</template>

<script>
import { F5Status } from 'filters'
import { getF5 } from 'services/services/f5'
const detailSetting = {
  type: 'host',
  columns: [
    [
      { name: 'virtual server', value: 'name' },
      { name: 'vs状态', value: 'status', filter: F5Status, icon: F5Status },
      { name: '地址', value: 'address' }
    ],
    [
      { name: '端口', value: 'port' },
      { name: 'pool', value: 'poolName' },
      { name: 'pool状态', value: 'poolStatus', filter: F5Status, icon: F5Status }
    ],
    [
      { name: '所属平台', value: 'vendorName' },
      { name: 'irules', value: 'irules' }
    ]
  ]
}
export default {
  data() {
    return {
      detailFlag: false,
      detailSetting,
      detail: {},
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      list: [],
      total: 0,
      memberData: []
    }
  },
  methods: {
    getDetail(row) {
      this.detail = Object.assign({}, row)
      if (this.detail.pool) {
        this.detail.poolName = this.detail.pool.name
        this.detail.poolStatus = this.detail.pool.status
        this.memberData = this.detail.pool.members
      }
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    },
    getList() {
      getF5(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.searchData.name
      })
      this.getList()
    }
  },
  created() {
    this.getList()
  },
  mounted() {},
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}

.btn-checkbox:hover {
  background-color: #5ac1f5;
  color: #fff;
}

.btn {
  border: 1px solid #5ac1f5;
  color: #5ac1f5;
  margin-bottom: 5px;
  padding: 5px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-ok {
  background: #5ac1f5 !important;
  color: #fff !important;
}

.ip-input {
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -webkit-transition: border-color ease-in-out 0.15s, -webkit-box-shadow ease-in-out 0.15s;
  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}
</style>
