<template>
  <el-row :gutter="10">
    <el-col :span="24" v-if="!isPreview">
      <el-form-item label="服务器集：" class="m-b-sm">
        <!--   CMDB服务器-->
        <el-button type="primary" size="small" class="pull-left" @click="selectCmdbServer">

          CMDB主机
        </el-button>
        <el-button type="danger" size="small" class="pull-right" @click="clearServer" icon="el-icon-delete">
          清空服务器
        </el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item :label="(isPreview?'CMDB主机:':'')">
        <div class="table-container">
          <el-table :data="itemData.hostList" class="target-table" header-cell-class-name="custom-header" stripe max-height="300">
            <el-table-column label="主机名称" prop="rawName" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="IP">
              <template slot-scope="scope">
                <el-input v-model="scope.row.host">
                </el-input>
              </template>
            </el-table-column>
            <el-table-column label="端口">
              <template slot-scope="scope">
                <basic-form-item class="m-b-none" :prop="'hostList.'+scope.$index+'.port'" validate="required,port"
                              required-message="请填写端口号">
                  <el-input v-model="scope.row.port" type="number" min="1"></el-input>
                </basic-form-item>
              </template>
            </el-table-column>
            <el-table-column label="用户名" v-if="itemData.authenMode=='SINGLE'">
              <template slot-scope="scope">
                <basic-form-item class="m-b-none" :prop="'hostList.'+scope.$index+'.user'" validate="required"
                              required-message="请填写用户名" key="user">
                  <el-input v-model="scope.row.user"></el-input>
                </basic-form-item>
              </template>
            </el-table-column>
            <el-table-column label="密码" v-if="itemData.authenMode=='SINGLE'">
              <template slot-scope="scope">
                <basic-form-item class="m-b-none" :prop="'hostList.'+scope.$index+'.pasd'"
                              validate="required" required-message="请填写密码" key="pasd">
                  <el-input v-model="scope.row.pasd" type="password"></el-input>
                </basic-form-item>
              </template>
            </el-table-column>
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
    <el-dialog title="CMDB主机" :close-on-click-modal="false" :visible.sync="dialogServerCmdbVisible" append-to-body
               width="1200px" v-if="dialogServerCmdbVisible">
      <!-- 选择cmdb服务器 -->
      <select-host ref="cmdbSelectHost" :selectData="itemData.hostList"></select-host>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerCmdbVisible = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
import show from 'views/task/graph/mixins/show'

export default {
  mixins: [show],
  components: {
    selectHost: () => import('../../graph/cmdbServer/selectHost')
  },
  props: {
    itemData: {
      type: Object
    }
  },
  data () {
    return {
      list: null,
      dialogServerCmdbVisible: false,
      selectParams: [],
      currentServer: null
    }
  },
  methods: {
    selectCmdbServer () {
      this.dialogServerCmdbVisible = true;
    },
    clearServer () {
      this.$confirm('您确定要清空所选主机吗?', '提示', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.itemData.customParams = []
        this.itemData.hostList = []
      })
    },
    delServer (id) {
      this.$confirm('您确定要删除该主机吗?', '操作确认', {
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
    ok () {
      this.itemData.hostList = [];
      const list = [];
      const cmdbSelectHost = this.$refs.cmdbSelectHost.save()
      for (const key in cmdbSelectHost) {
        list.push(cmdbSelectHost[key])
      }
      list.forEach(data => {
        const tmp = {
          id: data.id,
          rawName: data.name || data.rawName,
          host: data.host || data.service_ip,
          user: data.user || data.account,
          pasd: data.password || data.pasd,
          port: data.osCategory === 'Windows' ? 5986 : 22,
          category: data.osCategory || data.category
          // privateIps: data.privateIps
        }
        if (data.paramsList) {
          tmp.paramsList = data.paramsList
          tmp.params = data.params
        }
        this.itemData.hostList.push(tmp)
        this.itemData.resourceList = this.itemData.hostList.slice()
        this.itemData.resourceList.unshift({
          id: 0,
          rawName: '选择全部'
        })
      })
      // 数据改变清空相关依赖
      this.itemData.customParams = []
      this.dialogServerCmdbVisible = false
    }
  }
}
</script>
<style scoped>
  .target-table .el-form-item.is-error {
    margin-bottom: 15px !important;
  }
  .s-params {
    margin-left: 5px;
    cursor: pointer
  }
</style>
