<template>
  <div>
    <common-detail v-if="detaildialogVisible" :setting="detailSetting" :data="detail" @goBack="detaildialogVisible = false"> </common-detail>
    <el-card class="wrapper" v-if="!detaildialogVisible">
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="名称" v-model="searchData.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchData.status" clearable>
            <el-option v-for="(item, index) in statusList" :label="item.value" :value="item.value" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="secretData" :params="params" :get-list="getData" :total="total" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="strategy" label="策略" show-overflow-tooltip></el-table-column>
        <el-table-column prop="namespace" label="命名空间" show-overflow-tooltip></el-table-column>
        <el-table-column prop="tenantName" label="租户" show-overflow-tooltip></el-table-column>
        <el-table-column prop="gmtCreate" label="创建时间" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="160px">
          <template slot-scope="scope">
            <el-button :disabled="scope.row.disabled" type="text" @click="dropdownClick({ id: scope.row.id })"> 删除 </el-button>
            <el-button type="text" @click="serachyaml(scope.row)"> 查看/更新YAML </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </el-card>
    <yaml v-if="yamlData.dialog" :add-data="yamlData" @modify="modify"></yaml>
  </div>
</template>

<script>
/* global $ */
import { getDeployments, removeDeployments, createDeployments, detailDeployments, removeDeploymentss, modifyDeployments } from 'services/platform/k8s'
import yaml from './../searchYaml'
const detailSetting = {
  type: 'miyao',
  columns: [
    [
      { name: '名称', value: 'name' },
      { name: '策略', value: 'strategy' },
      { name: '命名空间', value: 'namespace' }
    ],
    [{ name: '创建时间', value: 'gmtCreate' }]
  ]
}
export default {
  components: { yaml },
  props: {
    platformObject: {
      type: Object,
      default: function () {
        return {
          k8sId: -1,
          operate: -1
        }
      }
    }
  },
  data() {
    return {
      detailSetting,
      detaildialogVisible: false,
      detail: {},
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: '',
        status: ''
      },
      secretData: [],
      total: 0,
      idList: [],
      selectList: [],
      yamlData: {
        dialog: false,
        data: {}
      },
      addData: {
        dialog: false,
        data: {}
      },
      statusList: [{ value: 'RUNNING' }, { value: 'FAILED' }, { value: 'PENDING' }]
    }
  },
  methods: {
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    serachyaml(data) {
      this.yamlData = {
        dialog: true,
        data: {
          yamlText: JSON.parse(data.yamlText),
          id: data.id
        }
      }
    },
    add() {
      this.addData = {
        dialog: true,
        data: {
          yamlText: '',
          vendorId: this.platformObject.k8sId
        }
      }
    },
    ok(obj) {
      createDeployments(obj).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.addData.dialog = false
          this.handleSearch()
        }
      })
    },
    modify(obj) {
      modifyDeployments(obj).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.yamlData.dialog = false
          this.handleSearch()
        }
      })
    },
    selectable(row, index) {
      if (row.projectVisibility && row.projectVisibility != 'GLOBAL_PROJECT') {
        return false
      } else {
        return true
      }
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
    },
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.secretData.forEach(item => {
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
    // 详情
    getDetail(id) {
      this.detaildialogVisible = true
      detailDeployments(id).then(data => {
        if (data.success) {
          this.detail = data.data
        }
      })
    },
    handleDelete() {
      this.refreshId()
      const list = this.idList
      this.$confirm('此操作将删除所选部署, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeDeploymentss(list).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
            this.selectList = []
          }
        })
      })
    },
    dropdownClick(command) {
      this.$confirm('此操作将永久删除该部署, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeDeployments(command.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
          }
        })
      })
    },
    getData() {
      this.refreshId()
      getDeployments(this.params).then(data => {
        if (data.success) {
          this.secretData = data.data.rows
          this.total = data.data.total
          this.secretData.forEach(item => {
            if (item.projectVisibility && item.projectVisibility != 'GLOBAL_PROJECT') {
              item.disabled = true
              const self = this
              setTimeout(function () {
                if (self.idList.indexOf(item.id) > -1) self.$refs.multipleTable.$refs.basicTable.toggleRowSelection(item, true)
              })
            }
          })
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        status: this.searchData.status,
        'name:LK': this.searchData.name
      })
      this.getData()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getData()
    },
    cancel(formName) {
      this.addFlag = false
      this.$refs[[formName]].resetFields()
    }
  },
  created() {},
  mounted() {
    this.handleSearch()
  },
  watch: {
    platformObject: {
      handler(newVal, oldVal) {
        this.handleSearch()
      },
      deep: true
    }
  }
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}

.vm-region {
  height: 42px;
  width: 110px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 0 10px 0 0;
  border: 1px solid #ddd;
  line-height: 42px;
  font-size: 12px;
  text-align: center;
  color: #666;
  cursor: pointer;
  border-radius: 0;
  display: inline-block;
}

.vm-region:hover {
  border-color: #43bfe3 !important;
}

.vm-region-text {
  border-color: #43bfe3 !important;
}

.region-active {
  background-color: deepskyblue;
  color: #fff;
}
</style>
