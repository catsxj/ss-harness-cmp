<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <el-form-item label="主机集：" class="m-b-sm">
        <el-button type="primary" size="small" class="pull-left" @click="selectServer">
          <i class="el-icon-monitor"></i>
          <span>选择主机</span>
        </el-button>
        <el-button type="danger" size="small" class="pull-right" @click="clearServer">
          <i class="el-icon-delete"></i>
          清空
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
          <el-table-column label="操作" width="200px">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="delServer(scope.row.id)">
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
      <basic-table :data="list" :params="params" :get-list="getList" :total="total" ref="serverTable1"
                   @select="handleSelectItem" @select-all="handleSelectAll">
        <el-table-column type="selection" :selectable="selectAble" width="60">
        </el-table-column>
        <el-table-column label="主机名" prop="name">
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
import crypto from 'utils/crypto.js'
import { vmStatusFilter, vmStatusColorFilter } from '@/filters/index'
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
        privateIps: '',
        catalog: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      dialogServerVisible: false,
      vendorOptions: '',
      selectList: [],
      idList: []
    }
  },
  created () {
  },
  methods: {
    selectAble (row) {
      if (row.osCategory && row.osCategory.toLowerCase() == 'linux' && row.status && row.status.toLowerCase() == 'running') {
        if (row.catalog.toLowerCase() == 'physical') {
          const server = JSON.parse(row.inventory)
          if ((server.config && server.config.osName && server.config.osName.trim().replace(/\s*/g, '').toLowerCase().indexOf('centos') > -1) ||
          (server.config && server.config.osName && server.config.osName.trim().replace(/\s*/g, '').toLowerCase().indexOf('redhat') > -1)) {
            if (server.powerState.toLowerCase() == 'running') {
              return true
            }
          }
        } else if (row.catalog.toLowerCase() == 'logical') {
          const cloud_server = JSON.parse(row.inventory)
          if ((cloud_server.osName && cloud_server.osName.trim().replace(/\s*/g, '').toLowerCase().indexOf('centos') > -1) ||
          (cloud_server.osName && cloud_server.osName.trim().replace(/\s*/g, '').toLowerCase().indexOf('redhat') > -1)) {
            if (cloud_server.status.toLowerCase() == 'running') {
              return true
            }
          }
        }
      }
      return false
    },
    selectServer () {
      this.getVendor()
      // 初始化数据
      this.listQuery = {
        name: '',
        privateIps: '',
        catalog: '',
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
    clearServer () {
      this.$confirm('您确定要清空所选主机吗?', '提示', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.itemData.targets = []
      })
    },
    delServer (id) {
      for (let i = 0, len = this.itemData.targets.length; i < len; i++) {
        if (this.itemData.targets[i].id === id) {
          this.itemData.targets.splice(i, 1)
          break
        }
      }
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
    handleSelectItem (selection, row) {
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
    handleSelectAll (selection) {
      this.refreshId()
      if (selection.length) { // 全选情况下
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) == -1 && item.privateIps.length && item.status != 'STOPPED') {
            this.selectList.push(item)
          }
        })
      } else { // 全不选情况下
        this.list.forEach(item => {
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
        data.forEach((item) => {
          item.privateIps = JSON.parse(item.privateIps)
          setTimeout(function () {
            if (self.idList.indexOf(item.id) > -1) self.$refs.serverTable1.toggleRowSelection(item, true)
          })
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
        catalog: this.listQuery.catalog,
        'name:LK': this.listQuery.name,
        'privateIps:LK': this.listQuery.ip
      })
      this.getList()
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
