<template>
  <el-row :gutter="10">
    <el-col :span="24">
      <el-form-item label="服务器集：" class="m-b-sm">
        <!--   CMDB服务器-->
        <el-button type="primary" size="small" class="pull-left" @click="selectCmdbServer">
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
          <el-table :data="itemData.hostList" class="target-table" header-cell-class-name="custom-header" stripe max-height="300">
            <el-table-column label="主机名称" prop="rawName" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="IP">
              <template slot-scope="scope">
                <el-input v-model="scope.row.host" readonly>
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
    <el-dialog title="CMDB主机" :close-on-click-modal="false" :visible.sync="dialogServerCmdbVisible" append-to-body
               width="1200px" v-if="dialogServerCmdbVisible">
      <!-- 选择cmdb服务器 -->
      <select-host ref="cmdbSelectHost" :selectData="selectData"></select-host>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerCmdbVisible = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>

export default {
  components: {
    selectHost: () => import('./selectHost')
  },
  props: {
    itemData: {
      type: Object
    },
    hasResource: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selectData: [],
      dialogServerCmdbVisible: false
    }
  },
  methods: {
    selectCmdbServer () {
      // 初始化数据
      this.selectData = []
      this.itemData.hostList.forEach(data => {
        this.selectData.push({
          id: data.id,
          name: data.rawName,
          service_ip: data.host,
          account: data.user,
          password: data.pasd
        })
      })
      this.dialogServerCmdbVisible = true;
    },
    clearCustomParams () {
      if (this.hasResource) {
        this.itemData.customParams = []
      }
    },
    clearServer () {
      this.$confirm('您确定要清空所选主机吗?', '提示', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.clearCustomParams()
        this.itemData.hostList = []
      })
    },
    delServer (id) {
      this.$confirm('您确定要删除该主机吗?', '操作确认', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.clearCustomParams()
        for (let i = 0, len = this.itemData.hostList.length; i < len; i++) {
          if (this.itemData.hostList[i].id === id) {
            this.itemData.hostList.splice(i, 1)
            break
          }
        }
      })
    },
    async ok () {
      this.itemData.hostList = [];
      const list = [];
      const cmdbSelectHost = await this.$refs.cmdbSelectHost.save()
      for (const key in cmdbSelectHost) {
        list.push(cmdbSelectHost[key])
      }
      list.forEach(data => {
        const tmp = {
          id: data.id,
          rawName: data.name,
          host: data.service_ip || data.ip,
          user: data.account,
          pasd: data.pasd || data.password,
          category: data.category,
          port: data.category === 'Windows' ? 5986 : 22
        }
        if (data.paramsList) {
          tmp.paramsList = data.paramsList
          tmp.params = data.params
        }
        this.itemData.hostList.push(tmp)
      })
      if (this.hasResource) {
        // 主机数据改变时需要更新resource数据
        this.itemData.resourceList = this.itemData.hostList.slice()
        this.itemData.resourceList.unshift({
          id: 0,
          rawName: '选择全部'
        })
      }
      this.clearCustomParams()
      this.dialogServerCmdbVisible = false
    }
  }
}
</script>
<style scoped>
  .target-table .el-form-item.is-error {
    margin-bottom: 15px !important;
  }
</style>
