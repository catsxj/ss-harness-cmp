<template>
  <div>
    <common-detail v-if="detaildialogVisible" :setting="detailSetting" :data="detail" @goBack="detaildialogVisible = false"> </common-detail>
    <el-card class="wrapper" v-if="!detaildialogVisible">
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="名称" v-model="searchData.name"></el-input>
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
        <el-table-column prop="clusterIp" label="集群IP" show-overflow-tooltip></el-table-column>
        <el-table-column prop="type" label="类型" show-overflow-tooltip></el-table-column>
        <el-table-column prop="namespace" label="命名空间" show-overflow-tooltip></el-table-column>
        <el-table-column prop="gmtCreate" label="创建时间" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="160px" align="center">
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
import { getService, removeService, createService, detailService, removeServices, getPod, modifyService } from 'services/platform/k8s'
import yaml from './../searchYaml'
const detailSetting = {
  type: 'miyao',
  columns: [
    [
      { name: '名称', value: 'name' },
      { name: '集群IP', value: 'clusterIp' },
      { name: '类型', value: 'type' }
    ],
    [
      { name: '命名空间', value: 'namespace' },
      { name: '创建时间', value: 'gmtCreate' }
    ]
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
        name: ''
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
      }
    }
  },
  methods: {
    serachyaml(data) {
      this.yamlData = {
        dialog: true,
        data: {
          yamlText: JSON.parse(data.yamlText),
          id: data.id
        }
      }
    },
    modify(obj) {
      modifyService(obj).then(data => {
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
    // 详情
    getDetail(id) {
      this.detaildialogVisible = true
      detailService(id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.getPod()
        }
      })
    },
    getPod(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([
        {
          param: {
            serviceId: this.detail.id
          },
          sign: 'EQ'
        }
      ])
      getPod(this.paramd).then(data => {
        if (data.success) {
          this.podList = data.data.rows
          this.podTotal = data.data.total
        }
      })
    },
    dropdownClick(command) {
      this.$confirm('此操作将永久删除该服务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeService(command.id).then(data => {
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
      getService(this.params).then(data => {
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
