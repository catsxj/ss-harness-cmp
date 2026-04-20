<template>
  <div class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input class="search-item" placeholder="名称" v-model="listQuery.name"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <router-link :to="{ name: 'ServiceVpcCreate', params: { type: 'EASYSTACK' } }" class="m-l-xs">
          <el-button type="primary">订购VPC实例</el-button>
        </router-link>
      </el-form-item>
    </el-form>
    <basic-table :data="vpcList" :params="params" :get-list="getList" :total="total">
      <el-table-column label="名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" @click="getDetail(scope.row.id)">{{ scope.row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip></el-table-column>
      <el-table-column label="过期时间" prop="expiredTime" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.expiredTime ? (scope.row.expiredTime.indexOf('2099') > -1 ? '无限期' : scope.row.expiredTime) : scope.row.expiredTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <DelayService type="vpc" :data="scope.row" @getList="getList"> </DelayService>
          <!-- <UnsubscribeService type="vpc" :data="scope.row" @getList="getList">
          </UnsubscribeService> -->
        </template>
      </el-table-column>
    </basic-table>
    <common-detail v-if="detailVisible" :setting="{ type: 'network' }" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <common-detail-item label="过期时间">{{ detailData.expiredTime || '无限期' }}</common-detail-item>
      </template>
      <el-tabs value="subnet">
        <subnet-list :detail="detailData"></subnet-list>
      </el-tabs>
    </common-detail>
  </div>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import UnsubscribeService from '@/components/UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
import SubnetList from './subnets/index.vue'
import { getVpc, detailVpc, modifyVpc } from 'services/platform/index'

export default {
  components: { DelayService, SubnetList },
  mixins: [webSocket],
  data() {
    return {
      searchConfigs: [{ label: '名称', value: 'name', type: 'Input' }],
      detailVisible: false,
      detailData: {},
      params: {
        page: 1,
        rows: 10
      },
      vpcList: [],
      total: 0,
      loading: false,
      listQuery: {
        name: ''
      }
    }
  },
  computed: {
    serviceIcon() {
      return this.$store.getters.serviceIcon
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('vpc') > -1) {
        this.getList()
      }
    },
    getDetail(id) {
      detailVpc(id).then(data => {
        if (data.success) {
          this.detailData = data.data
          this.detailVisible = true
        }
      })
    },
    goBack() {
      this.detailVisible = false
    },
    getList() {
      getVpc(this.params).then(data => {
        if (data.success) {
          this.vpcList = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:lk': this.listQuery.name,
        vendorType: 'EASYSTACK'
      })
      this.getList()
    }
  }
}
</script>

<style></style>
