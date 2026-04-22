<template>
  <el-row :gutter="10">
    <el-col :span="24">
      <el-form-item label="服务器集：" class="m-b-sm">
        <el-button type="primary" size="small" class="pull-left" @click="selectServer">
          选择服务器
        </el-button>
        <el-button v-if="agentType === 'agent'" type="primary" size="small" class="pull-left" @click="selectCmdb">
          选择CMDB主机
        </el-button>
        <el-button type="danger" size="small" class="pull-right" @click="clearServer">
          <i class="el-icon-delete"></i>
          清空服务器
        </el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item>
        <div class="table-container">
          <el-table :data="itemData.hostList" class="target-table ag-table" header-cell-class-name="custom-header" stripe max-height="300">
            <el-table-column label="IP地址" prop="host" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作系统" prop="os"></el-table-column>
            <el-table-column label="操作" width="100px">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" @click="delServer(scope.row.id)">
                  <i class="el-icon-delete"></i>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-col>
    <el-dialog title="服务器列表" :close-on-click-modal="false" :visible.sync="dialogServerVisible" append-to-body
               width="1000px" v-if="dialogServerVisible">
      <select-agent-host ref="agentSelectHost" :agent-type="agentType" :selectData="itemData.hostList"></select-agent-host>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerVisible = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="CMDB主机" :close-on-click-modal="false" :visible.sync="dialogServerCmdbVisible" append-to-body
               width="1200px" v-if="dialogServerCmdbVisible">
      <!-- 选择cmdb服务器 -->
      <select-cmdb-host ref="cmdbSelectHost" :selectData="itemData.hostList" :isAgent="true"></select-cmdb-host>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerCmdbVisible = false">取消</el-button>
        <el-button type="primary" @click.native="okCmdb">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
export default {
  components: {
    selectCmdbHost: () => import('task/graph/cmdbServer/selectHost'),
    selectAgentHost: () => import('task/graph/agentServer/selectHost')
  },
  props: {
    itemData: {
      type: Object
    },
    agentType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      dialogServerVisible: false,
      dialogServerCmdbVisible: false,
      selType: '',
      selectList: [],
      currentAgent: 0
    }
  },
  methods: {
    selectCmdb () {
      if (this.selType !== 'cmdb') {
        this.itemData.hostList = []
        this.selType = 'cmdb'
      }
      this.dialogServerCmdbVisible = true
    },
    selectServer () {
      if (this.selType !== 'server') {
        this.itemData.hostList = []
        this.selType = 'server'
      }
      this.selectList = []
      this.itemData.hostList && this.itemData.hostList.forEach(data => {
        this.selectList.push({
          id: data.id,
          ip: data.host,
          os: data.os
        })
      })
      this.dialogServerVisible = true
    },
    clearServer () {
      this.$confirm('您确定要清空所选主机吗?', '操作确认', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.itemData.customParams = []
        this.itemData.hostList = []
      })
    },
    delServer (id) {
      this.$confirm('您确定要删除该服务器吗?', '操作确认', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.itemData.customParams = []
        for (let i = 0, len = this.itemData.hostList.length; i < len; i++) {
          if (this.itemData.hostList[i].id === id) {
            this.itemData.hostList.splice(i, 1)
            break
          }
        }
      })
    },
    okCmdb () {
      this.itemData.hostList = [];
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
        this.itemData.hostList.push(tmp)
      })
      if (this.itemData?.customParams) {
        this.itemData.resourceList = this.itemData.hostList.slice()
        this.itemData.resourceList.unshift({
          id: 0,
          rawName: '选择全部'
        })
        // 数据改变清空相关依赖
        this.itemData.customParams = []
      }
      this.dialogServerCmdbVisible = false
    },
    ok () {
      this.itemData.hostList = []
      const list = [];
      const agentSelectHost = this.$refs.agentSelectHost.save()
      for (const key in agentSelectHost) {
        list.push(agentSelectHost[key])
      }
      list.forEach(data => {
        this.itemData.hostList.push({
          id: data.id,
          host: data.ip || data.host,
          os: data.os
        })
      })
      if (this.itemData?.customParams) {
        this.itemData.resourceList = this.itemData.hostList.slice()
        this.itemData.resourceList.unshift({
          id: 0,
          host: '选择全部'
        })
        // 数据改变清空相关依赖
        this.itemData.customParams = []
      }
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
  /deep/ .row-expand-cover {
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
