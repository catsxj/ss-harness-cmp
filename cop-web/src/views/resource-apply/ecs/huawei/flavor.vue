<template>
  <div>
    <basic-form-item label="系统规格：" validate="required">
      <div v-if="addData.configs.flavorId">
        已选规格：{{addData.configs.cpu}}C/{{addData.configs.memory}}G
      </div>
      <el-form :inline="true" class="m-t-xs">
        <el-form-item>
          <el-input placeholder="名称" v-model="searchData.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearchSpec">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" highlight-current-row tooltip-effect="dark" stripe border fit>
        <el-table-column label="名称">
          <template slot-scope="scope">
            <el-radio :label="scope.row.id" v-model="addData.configs.flavorId" @change="checkConfig">
              {{ scope.row.name }}
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column label="规格uuid" prop="flavorUuid"> </el-table-column>
        <el-table-column label="cpu" prop="cpu"> </el-table-column>
        <el-table-column label="内存(GB)" prop="memory"> </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination @size-change="handleSizeChange1" @current-change="getList" :current-page.sync="params.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="params.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
      </div>
    </basic-form-item>
  </div>
</template>

<script>
/* global $ */
import { getFlavor } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
          },
          dialog: false
        }
      }
    }
  },
  data () {
    return {
      searchData: {
        name: '',
        cpuArchitecture: 'x86'
      },
      params: {
        page: 1,
        rows: 5
      },
      list: [],
      total: 0
    }
  },
  methods: {
    checkConfig (id) {
      const obj = this.list.find(item => item.id == id)
      this.$set(this.addData.configs, 'cpu', obj.cpu)
      this.$set(this.addData.configs, 'memory', obj.memory)
    },
    handleSizeChange1(val) {
      this.params.rows = val
      this.getList()
    },
    // 获取规格列表
    getList() {
      getFlavor(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          if (!this.addData.configs.flavorId && this.list.length) {
            this.$set(this.addData.configs, 'flavorId', this.list[0].id)
            this.checkConfig(this.addData.configs.flavorId)
          }
        }
      })
    },
    // 搜索功能
    handleSearchSpec() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.addData.location.vendorId,
        'zone:lk': this.addData.location.az,
        'name:LK': this.searchData.name
      })
      this.getList()
    }
  },
  watch: {
    'addData.location.az' () {
      this.handleSearchSpec()
    }
  },
  created () {
    this.handleSearchSpec()
  }
}
</script>

<style>

</style>
