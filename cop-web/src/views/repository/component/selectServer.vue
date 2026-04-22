<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <el-form-item label="主机：" class="m-b-sm" required>
        <el-button type="primary" size="small" class="pull-left" @click="selectServer">
          <i class="el-icon-monitor"></i>
          <span>选择主机</span>
        </el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item label="">
        <smart-table :data="itemData.targets" class="target-table">
          <el-table-column label="主机名称" prop="name" show-overflow-tooltip>
          </el-table-column>
          <el-table-column label="IP">
            <template slot-scope="scope">
              <el-select v-model="scope.row.host" placeholder="请选择">
                <el-option
                  v-for="(item, index) in scope.row.privateIps"
                  :key="index"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="端口">
            <template slot-scope="scope">
              <el-form-item class="m-b-none" :prop="'targets.'+scope.row.indexKey+'.port'"
                            :rules="{required: true, message: '请填写端口号'}">
                <el-input v-model="scope.row.port" type="number"></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="用户名">
            <template slot-scope="scope">
              <el-form-item class="m-b-none" :prop="'targets.'+scope.row.indexKey+'.user'"
                            :rules="{required: true, message: '请填写用户名'}">
                <el-input v-model="scope.row.user"></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="密码">
            <template slot-scope="scope">
              <el-input v-model="scope.row.pasd" type="password"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100px">
            <template>
              <el-button size="mini" type="danger" @click="delServer()">
                <i class="el-icon-delete"></i>
                删除
              </el-button>
            </template>
          </el-table-column>
        </smart-table>
      </el-form-item>
    </el-col>
    <el-dialog width="70%" title="服务器列表" :close-on-click-modal="false" :visible.sync="dialogServerVisible"
               append-to-body>
      <el-form :inline="true">
        <el-form-item>
          <el-select clearable v-model="listQuery.vendorId" placeholder="所属平台">
            <el-option v-for="item in vendorOptions" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input placeholder="IP地址" v-model="listQuery.ip">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input placeholder="主机名" v-model="listQuery.name">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total" ref="serverTable1">
        <el-table-column label="主机名称">
          <template slot-scope="scope">
            <el-radio :label="scope.row.id" v-model="targetId" :disabled="selectAble(scope.row)" @change.native="getCurrentRow(scope.row)">
              <span style="font-size: 12px;">{{scope.row.name}}</span>
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column label="IP">
          <template slot-scope="scope">
            <div v-for="(item, index) in scope.row.privateIps" :key="index">{{item}}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <status-icon :type="vmStatusColorFilter(scope.row.status)">
              {{vmStatusFilter(scope.row.status)}}
            </status-icon>
          </template>
        </el-table-column>
        <el-table-column label="平台名称" prop="vendorName">
        </el-table-column>
      </basic-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerVisible = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
import { getCloudVendor, getResource } from 'services/platform/index'
import { vmStatusFilter, vmStatusColorFilter } from '@/filters/index'
import crypto from 'utils/crypto.js'
export default {
  props: {
    itemData: {
      type: Object
    }
  },
  data () {
    return {
      vmStatusFilter,
      vmStatusColorFilter,
      list: null,
      total: null,
      listQuery: {
        name: '',
        privateIps: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      dialogServerVisible: false,
      groupOptions: '',
      vendorOptions: '',
      selectList: [],
      idList: [],
      targetId: null
    }
  },
  created () {
  },
  methods: {
    selectAble (row) {
      if (row.osCategory && row.osCategory.toLowerCase() == 'linux' && row.status.toLowerCase() == 'running') {
        if (row.catalog.toLowerCase() == 'physical') {
          const server = JSON.parse(row.inventory)
          if ((server.config && server.config.osName && server.config.osName.trim().replace(/\s*/g, '').toLowerCase().indexOf('centos') > -1) ||
          (server.config && server.config.osName && server.config.osName.trim().replace(/\s*/g, '').toLowerCase().indexOf('redhat') > -1)) {
            if (server.powerState.toLowerCase() == 'running') {
              return false
            }
          }
        } else if (row.catalog.toLowerCase() == 'logical') {
          const cloud_server = JSON.parse(row.inventory)
          if ((cloud_server.osName && cloud_server.osName.trim().replace(/\s*/g, '').toLowerCase().indexOf('centos') > -1) ||
          (cloud_server.osName && cloud_server.osName.trim().replace(/\s*/g, '').toLowerCase().indexOf('redhat') > -1)) {
            if (cloud_server.status.toLowerCase() == 'running') {
              return false
            }
          }
        }
      }
      return true
    },
    selectServer () {
      this.getVendor()
      // 初始化数据
      this.listQuery = {
        name: '',
        privateIps: '',
        vendorId: ''
      }
      this.params.page = 1
      this.selectList = []
      // 对数据进行格式化以适应后端的传参需求
      this.itemData.targets.forEach(data => {
        this.selectList.push({
          id: data.resourceId,
          name: data.name,
          host: data.host,
          username: data.user,
          password: data.pasd ? crypto.encrypt(data.pasd) : data.pasd,
          osCategory: data.category
        })
      })
      this.dialogServerVisible = true
      this.handleSearch()
    },
    delServer () {
      this.selectList = [];
      this.itemData.targets = [];
      this.targetId = null;
    },
    getVendor () {
      getCloudVendor({
        simple: true
      }).then(data => {
        if (data.success) {
          this.vendorOptions = data.data.rows
        }
      })
    },
    refreshId () {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    getList () {
      const self = this
      this.refreshId()
      const handleData = function (data) {
        data.forEach(function (item) {
          item.privateIps = JSON.parse(item.privateIps)
        })
      }
      getResource(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          handleData(this.list)
        }
      })
    },
    handleSearch () {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.listQuery.vendorId,
        category: 'Computer',
        'name:LK': this.listQuery.name,
        'privateIps:LK': this.listQuery.ip
      })
      this.getList()
    },
    getCurrentRow (data) {
      this.selectList = [data];
    },
    ok () {
      this.itemData.targets = []
      this.selectList.forEach(data => {
        this.itemData.targets.push({
          resourceId: data.id,
          name: data.name,
          host: data.host || data.privateIps[0],
          user: data.username,
          port: data.osCategory == 'Windows' ? 5986 : 22,
          pasd: data.password ? crypto.decrypt(data.password) : data.password,
          category: data.osCategory,
          sudo: true,
          privateIps: data.privateIps
        })
      })
      this.dialogServerVisible = false
    }
  }
}
</script>
<style scoped>
  .target-table .el-form-item.is-error {
    margin-bottom: 15px !important;
  }

</style>
