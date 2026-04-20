<template>
  <div>
    <!-- <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchData.status" placeholder="状态" clearable @change="getList">
          <el-option label="UP" value="UP"></el-option>
          <el-option label="DOWN" value="DOWN"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchData.vendorId" placeholder="平台" clearable @change="getList">
          <el-option v-for="item in vendorData" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="getList">搜索</el-button>
        <el-button type="ghost" icon="el-icon-refresh" @click="handleReSet">重置</el-button>
      </el-form-item>
    </el-form> -->
    <smart-table ref="ResourceTable" :data="list" class="target-table" :rows="10" @selection-change="selectionChangeCheck" :isInitSearch="resourceIds === null || resourceIds.length != 0 || status != 'detail'">
      <el-table-column v-if="status != 'detail'" type="selection" width="60"> </el-table-column>
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
    </smart-table>
  </div>
</template>

<script>
/* global $ */
import { getCloudVendor } from 'services/platform/index'
import { getServices } from 'services/monitor/index.js'
export default {
  props: {
    resourceType: {
      type: String
    },
    resourceIds: {
      type: Array,
      default: function () {
        return []
      }
    },
    status: {
      type: String
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      searchData: {},
      params: {
        page: 1,
        rows: 10
      },
      selectList: [],
      idList: [],
      loading: false,
      flag: 0,
      vendorData: [],
      tpl: [],
      tplIds: []
    }
  },
  methods: {
    getData() {
      getCloudVendor({
        page: 1,
        rows: 10000,
        params: this.$tools.handleSearchParam({
          type: 'OPENSTACK'
        })
      }).then(data => {
        if (data.success) {
          this.vendorData = data.data.rows
        }
      })
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    selectionChangeCheck(selection) {
      this.selectList = selection
    },
    handleReSet() {
      this.searchData = {}
      this.getList()
    },
    getList() {
      this.refreshId()
      getServices().then(data => {
        //   {
        //   name: this.searchData.name,
        //   status: this.searchData.status,
        //   vendorId: this.searchData.vendorId
        // }
        if (data.success) {
          this.list = data.data
          this.list.forEach(data => {
            console.log(typeof data.id, this.idList.indexOf(data.id))
            setTimeout(() => {
              if (this.idList.indexOf(data.id) > -1 && this.status != 'detail') {
                this.$refs.ResourceTable.toggleRowSelection(data, true)
              }
            })
          })
        }
      })
    }
  },
  created() {
    if (this.resourceIds && this.resourceIds.length && this.status == 'update') {
      this.resourceIds.forEach(item => {
        if (this.selectList.indexOf(item) == -1) {
          this.selectList.push({ id: item })
        }
      })
    }
    if (this.status == 'detail') {
      if (this.resourceIds) {
        this.ids = this.resourceIds.join(',')
      }
    }
    // this.getData()
    this.getList()
  }
}
</script>

<style></style>
