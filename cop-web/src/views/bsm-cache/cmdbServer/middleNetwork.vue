<template>
  <el-row :gutter="10">
    <el-col :span="24">
      <el-form-item label-width="0" class="m-b-sm">
        <el-button type="primary" size="small" class="pull-left" @click="selectServer">
          选择网络设备
        </el-button>
        <el-button type="danger" size="small" class="pull-right" @click="clearServer">
          <i class="el-icon-delete"></i>
          清空网络设备
        </el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item label-width="0">
        <div class="table-container">
          <el-table :data="itemData.hostList" class="target-table" header-cell-class-name="custom-header" stripe max-height="300">
            <el-table-column label="设备名称" prop="name" show-overflow-tooltip></el-table-column>
            <el-table-column label="IP" prop="host"></el-table-column>
            <el-table-column label="端口号">
              <template slot-scope="scope">
                <basic-form-item class="m-b-none" :prop="'hostList.'+scope.$index+'.port'" validate="required,port"
                              required-message="请填写端口号">
                  <el-input v-model="scope.row.port" type="number" min="1"></el-input>
                </basic-form-item>
              </template>
            </el-table-column>
            <el-table-column label="管理账号" v-if="itemData.authenMode=='SINGLE'">
              <template slot-scope="scope">
                <basic-form-item class="m-b-none" :prop="'hostList.'+scope.$index+'.user'" validate="required"
                              required-message="请填写管理账号">
                  <el-input v-model="scope.row.user"></el-input>
                </basic-form-item>
              </template>
            </el-table-column>
            <el-table-column label="管理密码" v-if="itemData.authenMode=='SINGLE'">
              <template slot-scope="scope">
                <basic-form-item class="m-b-none" :prop="'hostList.'+scope.$index+'.pasd'" validate="required"
                              required-message="请填写管理密码">
                  <el-input v-model="scope.row.pasd" type="password"></el-input>
                </basic-form-item>
              </template>
            </el-table-column>
            <el-table-column label="enable密码" v-if="itemData.authenMode=='SINGLE'">
              <template slot-scope="scope">
                <basic-form-item class="m-b-none" :prop="'hostList.'+scope.$index+'.enable'">
                  <el-input v-model="scope.row.enable" type="password"></el-input>
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
    <el-dialog title="网络设备列表" :close-on-click-modal="false" :visible.sync="dialogServerVisible" append-to-body
               width="60%" v-if="dialogServerVisible">
      <select-network
        ref="cmdbSelectNetwork"
        :selectData="selectData"
        dictType="CMDB_NETWORK_DEVICE"
        :moduleCode="moduelCode"
      >
      </select-network>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerVisible = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>

export default {
  components: {
    selectNetwork: () => import('./selectNetwork')
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
      dialogServerVisible: false,
      selectData: [],
      moduelCode: ''
    }
  },
  methods: {
    selectServer () {
      // 初始化数据
      this.selectData = []
      this.itemData.hostList.forEach(data => {
        this.selectData.push({
          id: data.id,
          code: data.code,
          name: data.name,
          service_ip: data.host,
          account: data.user,
          pasd: data.pasd,
          port: data.port
        })
      })
      this.dialogServerVisible = true
    },
    clearCustomParams () {
      if (this.hasResource) {
        this.itemData.customParams = []
      }
    },
    clearServer () {
      this.$confirm('您确定要清空所选网络设备吗?', '操作确认', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.clearCustomParams()
        this.itemData.hostList = []
      })
    },
    delServer (id) {
      this.$confirm('您确定要删除该网络设备吗?', '操作确认', {
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
    ok () {
      this.itemData.hostList = []
      const { data, code } = this.$refs.cmdbSelectNetwork.save()
      this.moduelCode = code
      data.forEach(data => {
        const tmp = {
          id: data.id,
          code: data.code,
          name: data.name,
          host: data.outbond_manage_ip || data.inbond_manage_ip || data.service_ip || data.ip,
          user: data.account || data.username || data.manage_users,
          pasd: data.pasd || data.password,
          port: data.port || data.manage_port || data.enable_port
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
