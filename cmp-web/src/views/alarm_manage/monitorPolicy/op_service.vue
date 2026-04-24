<template>
  <div>
    <el-form :inline="true">
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
    </el-form>
    <el-table ref="ResourceTable" :data="currentList" class="target-table" :rows="10" @select="handleSelectItem" @select-all="handleSelectAll">
      <el-table-column v-if="status != 'detail'" type="selection" width="60"> </el-table-column>
      <el-table-column label="名称" prop="name" show-overflow-tooltip> </el-table-column>
      <el-table-column label="标签" prop="status" show-overflow-tooltip>
        <template #default="scope">
          <el-tag>
            {{ 'status=' + scope.row.tag.status }}
          </el-tag>
          <el-tag>
            {{ 'host=' + scope.row.tag.host }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" show-overflow-tooltip>
        <template #default="scope">
          <status-icon :type="scope.row.status == 'UP' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </status-icon>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination layout="total,prev, pager, next" :page-size="rows" v-model:current-page="page" @current-change="handleData" :total="list.length"> </el-pagination>
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
      currentList: [],
      rows: 10,
      page: 1,
      total: 0,
      searchData: {},
      selectList: [],
      currentSelectList: [],
      idList: [],
      loading: false,
      flag: 0,
      vendorData: [],
      tpl: [],
      tplIds: []
    }
  },
  watch: {
    list: function () {
      this.page = this.page ? this.page : 1 // 容错处理
      this.handleData()
    }
  },
  methods: {
    handleData() {
      this.refreshId()
      const totalPage = Math.ceil(this.list.length / this.rows)
      this.currentList = []
      if (this.page > totalPage) this.page = totalPage
      this.list.forEach((item, key) => {
        if (Math.floor(key / this.rows) === this.page - 1) {
          this.$set(item, 'indexKey', key)
          this.currentList.push(item)
        }
        setTimeout(() => {
          if (this.idList.indexOf(item.id) > -1 && this.status != 'detail') {
            this.$refs.ResourceTable.toggleRowSelection(item, true)
          }
        })
      })
    },
    getData() {
      getCloudVendor({
        page: 1,
        rows: 10000,
        params: this.$tools.handleSearchParam({
          type: 'OPENSTACK'
        })
      }).then((data) => {
        if (data.success) {
          this.vendorData = data.data.rows
        }
      })
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    // 单选
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
      console.log(this.selectList.length)
    },
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach((item) => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    handleReSet() {
      this.searchData = {}
      this.getList()
    },
    getList() {
      getServices({
        name: this.searchData.name,
        status: this.searchData.status,
        vendorId: this.searchData.vendorId
      }).then((data) => {
        if (data.success) {
          this.list = data.data
          this.handleData()
        }
      })
    }
  },
  created() {
    if (this.resourceIds && this.resourceIds.length && this.status == 'update') {
      this.resourceIds.forEach((item) => {
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
    this.getData()
    this.getList()
  }
}
</script>

<style></style>
