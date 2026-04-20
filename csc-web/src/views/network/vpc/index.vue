<template>
  <el-card class="wrapper">
    <el-tabs v-model="listQuery.vendorType" @tab-click="handleSearch">
      <el-tab-pane label="阿里云" name="ALIYUN"></el-tab-pane>
    </el-tabs>
    <el-form :inline="true">
      <el-form-item>
        <el-input class="search-item" placeholder="名称" v-model="listQuery.name"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <router-link :to="{ name: 'ServiceVpcCreate', params: { type: listQuery.vendorType } }" class="m-l-xs">
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
      <!-- <el-table-column prop="subnetNames" label="子网名称" show-overflow-tooltip></el-table-column> -->
      <el-table-column label="平台类型" prop="vendorType" show-overflow-tooltip></el-table-column>
      <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip></el-table-column>
      <el-table-column label="过期时间" prop="expiredTime" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.expiredTime ? (scope.row.expiredTime.indexOf('2099') > -1 ? '无限期' : scope.row.expiredTime) : scope.row.expiredTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.vendorType != 'AZURE'" @click="handleEdit(scope.row)" icon="el-icon-edit">编辑</el-button>
          <div class="action-divider" v-if="scope.row.vendorType != 'AZURE'"></div>
          <DelayService :data="scope.row" @getList="getList"> </DelayService>
          <UnsubscribeService :data="scope.row" @getList="getList"> </UnsubscribeService>
        </template>
      </el-table-column>
    </basic-table>
    <el-dialog title="编辑网络" :visible.sync="modifyDialogVisible" width="30%">
      <span>
        <el-form ref="modifyForm" :model="modifyData" :status-icon="true" label-width="80px">
          <basic-form-item label="名称" validate="required" maxlength="128">
            <el-input v-model="modifyData.name"></el-input>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editSubmit()" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
    <common-detail v-if="detailVisible" :setting="{ type: 'network' }" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="平台类型">{{ detailData.vendorType }}</common-detail-item>
        <common-detail-item label="地域">{{ detailData.region || detailData.regionName }}</common-detail-item>
        <common-detail-item label="可用区">{{ detailData.zone || detailData.zoneName }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <common-detail-item label="过期时间">{{ detailData.expiredTime || '无限期' }}</common-detail-item>
      </template>
      <el-tabs value="subnet">
        <subnet-list :detail-data="detailData"></subnet-list>
      </el-tabs>
    </common-detail>
    <selection-service :obj="{ suffix: 'vpc' }" router="ServiceVpcCreate" code="network" v-if="dialog.dialog" :dialog="dialog"></selection-service>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import UnsubscribeService from '@/components/UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
import SubnetList from './subnets/index.vue'
import { getVpc, detailVpc, modifyVpc } from 'services/platform/index'
import selectionService from '@/components/selectionService.vue'

export default {
  components: { UnsubscribeService, DelayService, SubnetList, selectionService },
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
      modifyData: {},
      modifyDialogVisible: false,
      loading: false,
      dialog: {
        dialog: false
      },
      listQuery: {
        name: '',
        vendorType: 'ALIYUN'
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
        vendorType: this.listQuery.vendorType
      })
      this.getList()
    },
    handleEdit(data) {
      this.modifyData = Object.assign({}, data)
      this.modifyDialogVisible = true
    },
    editSubmit() {
      this.$refs.modifyForm.validate(valid => {
        if (valid) {
          this.loading = true
          modifyVpc(this.modifyData)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.getList()
                this.modifyDialogVisible = false
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style></style>
