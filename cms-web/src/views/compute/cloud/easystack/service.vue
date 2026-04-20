<template>
  <div>
    <el-card class="wrapper">
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="名称" v-model="searchData.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchData.status" placeholder="状态" clearable>
            <el-option label="UP" value="UP"></el-option>
            <el-option label="DOWN" value="DOWN"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="getData">搜索</el-button>
        </el-form-item>
      </el-form>
      <smart-table ref="table" :data="list" class="target-table" :rows="10">
        <el-table-column label="名称" prop="name" show-overflow-tooltip> </el-table-column>
        <el-table-column label="标签" prop="status" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag>
              {{ 'status=' + scope.row.tag.status }}
            </el-tag>
            <el-tag>
              {{ 'host=' + scope.row.tag.host }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status == 'UP' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </status-icon>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="status" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" @click="handleMonitorDetail(scope.row)"> 告警详情</el-button>
          </template>
        </el-table-column>
      </smart-table>
    </el-card>
  </div>
</template>

<script>
import { getServices } from 'services/monitor/index.js'
import webSocket from '@/common/mixins/getGlobalSocket'

export default {
  mixins: [webSocket],
  props: {
    platformObject: {
      type: Object,
      default: function () {
        return {
          operate: -1
        }
      }
    }
  },
  data() {
    return {
      list: [],
      loading: false,
      searchData: {
        name: '',
        status: ''
      }
    }
  },
  methods: {
    onmessage() {},
    getData() {
      getServices({
        name: this.searchData.name,
        status: this.searchData.status,
        vendorId: this.$route.query.vendorId
      }).then((data) => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    handleMonitorDetail(row) {
      sessionStorage.setItem('monitorVm', '2')
      this.$router.push({
        name: 'MonitorDetailList',
        query: { id: row.id, name: row.name, type: 'MONITOR_EASYSTACK_SERVICE' }
      })
    }
  },
  created() {},
  mounted() {
    this.getData()
  }
}
</script>

<style scoped>
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
