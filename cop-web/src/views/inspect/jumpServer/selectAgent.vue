<template>
  <el-row :gutter="10">
    <el-col :span="24">
      <el-form-item label="服务器集：" class="m-b-sm">
        <!-- <el-button type="primary" size="small" class="pull-left" @click="selectServer">
          选择服务器
        </el-button> -->
        <el-button type="primary" size="small" class="pull-left" @click="selectCmdb">
          选择CMDB主机
        </el-button>
        <el-button type="danger" size="small" class="pull-right" @click="clearServer" icon="el-icon-delete">
          清空服务器
        </el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item>
        <div class="table-container">
          <el-table :data="itemData.jumpServer.hostList" class="target-table ag-table" header-cell-class-name="custom-header" stripe max-height="300">
            <el-table-column label="IP地址" prop="host" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作系统" prop="os"></el-table-column>
            <el-table-column label="操作" width="100px">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" @click="delServer(scope.row.id)" icon="el-icon-delete">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-col>
    <el-dialog title="服务器列表" :close-on-click-modal="false" :visible.sync="dialogServerVisible" append-to-body
               width="800px" v-if="dialogServerVisible">
      <el-form :inline="true">
        <el-form-item>
          <el-select clearable v-model="listQuery.webEnvironment" placeholder="网络环境" @change="changeQueryWebEnvironment">
            <el-option v-for="item in webEnvironment" :key="item.name" :label="item.name" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select clearable v-model="listQuery.idc" placeholder="机房">
            <el-option v-for="item in queryIdc" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input placeholder="IP地址" v-model="listQuery.ip"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <tree-table :data2="list" class="ag-table" ref="serverTable" @select="handleSelectItem"
        @select-all="handleSelectAll" :row-class-name="getRowClass" :total="total" :params="params" :get-list="getList">
        <el-table-column type="selection" :selectable="checkSelectable" width="60"></el-table-column>
        <el-table-column label="IP地址" show-overflow-tooltip>
          <template slot-scope="scope" v-if="scope.row._level == 1">
            {{scope.row.ip}}
          </template>
        </el-table-column>
        <el-table-column label="agent名称" prop="name"></el-table-column>
        <el-table-column label="状态" prop="connectStatus" show-overflow-tooltip>
          <template slot-scope="scope" >
            <el-tag class="status-tag" type="info" v-if="scope.row.connectStatus == 'DISCONNECTED'">-</el-tag>
            <el-tag class="status-tag" type="success" v-else>{{scope.row.version}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作系统">
          <template slot-scope="scope" v-if="scope.row._level == 1">
            {{scope.row.os}}
          </template>
        </el-table-column>
      </tree-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerVisible = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="CMDB主机" :close-on-click-modal="false" :visible.sync="dialogServerCmdbVisible" append-to-body
               width="1200px" v-if="dialogServerCmdbVisible">
      <!-- 选择cmdb服务器 -->
      <select-host ref="cmdbSelectHost" :selectData="itemData.jumpServer.hostList" :isAgent="true"></select-host>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerCmdbVisible = false">取消</el-button>
        <el-button type="primary" @click.native="okCmdb">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
import { getWebEnvironment, getHostAgent } from 'services/task/inspect'
export default {
  components: {
    treeTable: () => import('views/bsm-cache/treeTable/index'),
    selectHost: () => import('views/bsm-cache/cmdbServer/selectHost')
  },
  props: {
    itemData: {
      type: Object
    },
    whoUse: {
      type: String
    }
  },
  data () {
    return {
      list: [],
      total: 0,
      listQuery: {},
      params: {
        page: 1,
        rows: 10
      },
      dialogServerVisible: false,
      dialogServerCmdbVisible: false,
      selType: '',
      webEnvironment: '',
      queryIdc: '',
      selectList: [],
      idList: [],
      currentAgent: 0
    }
  },
  created () {
    this.loadWebEnvironment()
  },
  methods: {
    checkSelectable (row) {
      return row._level == 1
    },
    getRowClass (row, index) {
      if (!row.row.children && row.row._level != 1) {
        return 'row-expand-cover'
      }
    },
    selectCmdb () {
      if (this.selType !== 'cmdb') {
        this.itemData.jumpServer.hostList = []
        this.selType = 'cmdb'
      }
      this.dialogServerCmdbVisible = true
    },
    selectServer () {
      if (this.selType !== 'server') {
        this.itemData.jumpServer.hostList = []
        this.selType = 'server'
      }
      // 初始化数据
      this.listQuery = {}
      this.params.page = 1
      this.selectList = []
      this.list = []
      this.total = 0
      this.queryIdc = ''
      this.itemData.jumpServer.hostList && this.itemData.jumpServer.hostList.forEach(data => {
        this.selectList.push({
          id: data.id,
          ip: data.host,
          os: data.os
        })
      })
      this.dialogServerVisible = true
      this.handleSearch()
    },
    clearServer () {
      this.$confirm('您确定要清空所选主机吗?', '操作确认', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.itemData.jumpServer.hostList = []
      })
    },
    delServer (id) {
      this.$confirm('您确定要删除该服务器吗?', '操作确认', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        for (let i = 0, len = this.itemData.jumpServer.hostList.length; i < len; i++) {
          if (this.itemData.jumpServer.hostList[i].id === id) {
            this.itemData.jumpServer.hostList.splice(i, 1)
            break
          }
        }
      })
    },
    loadWebEnvironment () {
      getWebEnvironment().then(data => {
        if (data.success) {
          this.webEnvironment = data.data;
        }
      })
    },
    changeQueryWebEnvironment (value) {
      if (this.listQuery.idc) {
        delete this.listQuery.idc;
      }
      if (!value) {
        this.queryIdc = [];
        return;
      }
      for (let i = 0; i < this.webEnvironment.length; i++) {
        const item = this.webEnvironment[i];
        if (item.name == value) {
          this.queryIdc = item.value;
        }
      }
    },
    handleSelectItem (selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id === row.id) {
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
      if (selection.length) {
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) === -1) {
            this.selectList.push(item)
          }
        })
      } else {
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id === row.id) {
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
        data.forEach(function (item) {
          setTimeout(function () {
            if (self.idList.indexOf(item.id) > -1) self.$refs.serverTable.toggleRowSelection(item, true)
          })
        })
      }
      getHostAgent(this.params).then(data => {
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
        webEnvironment: this.listQuery.webEnvironment,
        idc: this.listQuery.idc,
        'ip:lk': this.listQuery.ip
      })
      this.getList()
    },
    okCmdb () {
      this.itemData.jumpServer.hostList = [];
      const list = [];
      const cmdbSelectHost = this.$refs.cmdbSelectHost.save()
      for (const key in cmdbSelectHost) {
        list.push(cmdbSelectHost[key])
      }
      list.forEach(data => {
        const tmp = {
          id: data.id,
          host: data.service_ip || data.host,
          os: data.osCategory || data.category || data.operate_system || data.os
        }
        if (data.paramsList) {
          tmp.paramsList = data.paramsList
          tmp.params = data.params
        }
        this.itemData.jumpServer.hostList.push(tmp)
      })
      this.dialogServerCmdbVisible = false
    },
    ok () {
      // 跳板机模块只能选择一台机器
      if (this.selectList?.length > 1) {
        return this.$message.error('只能选择一台跳板机')
      }
      this.itemData.jumpServer.hostList = []
      this.selectList.forEach(data => {
        this.itemData.jumpServer.hostList.push({
          id: data.id,
          host: data.ip,
          os: data.os
        })
      })
      this.dialogServerVisible = false
    }
  }
}
</script>
<style scoped lang="scss">
.target-table .el-form-item.is-error {
  margin-bottom: 15px !important;
}
.ag-table {
  ::v-deep .row-expand-cover {
    .el-checkbox__inner {
      display: none;
    }
    td {
      background: #fafafa
    }
  }
}
.status-tag {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  min-width: 45px;
  text-align: center;
}
.s-params {
  margin-left: 5px;
  cursor: pointer
}
</style>
