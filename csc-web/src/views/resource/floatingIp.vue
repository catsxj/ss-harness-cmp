<template>
  <el-card class="wrapper">
    <table-search :configs="searchConfigs" :on-search="handleSearch">
      <template v-slot:operate>
        <el-button @click="dialog.dialog = true" type="primary">订购浮动IP</el-button>
      </template>
    </table-search>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="外网IP" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" @click="handleDetail(scope.row.id)">{{ scope.row.floatingIpAddress }}</el-button>
        </template>
      </el-table-column>

      <el-table-column label="内网IP" prop="fixedIpAddress" show-overflow-tooltip> </el-table-column>
      <el-table-column label="状态" show-overflow-tooltip>
        <template slot-scope="scope">
          <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | openstackNetworkStatus }} </status-icon>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
      <el-table-column label="过期时间" prop="expiredTime" show-overflow-tooltip> </el-table-column>
      <el-table-column label="所属平台" prop="vendorName" show-overflow-tooltip> </el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.isExpired" v-if="!scope.row.portUuid" @click="associate(scope.row.id, scope.row.floatingIpAddress)"><i class="iconfont icon-association"></i>关联</el-button>
          <el-button type="text" :disabled="scope.row.isExpired" v-if="scope.row.portUuid" @click="handleDelete(scope.row, 2)"><i class="iconfont icon-yichu"></i>解绑</el-button>
          <div class="action-divider" v-if="!scope.row.portUuid"></div>
          <UnsubscribeService :data="scope.row" @getList="getList"> </UnsubscribeService>
        </template>
      </el-table-column>
    </basic-table>
    <!--订单详情-->
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="floatIpDetail" @goBack="goBack"> </common-detail>
    <!--关联-->
    <el-dialog title="关联" :close-on-click-modal="false" v-if="associateVisible" :visible.sync="associateVisible" width="50%" @close="close(associateData)">
      <el-form :model="associateData" label-width="100px" status-icon :rules="rules" ref="associateData">
        <el-row>
          <el-col :span="24">
            <el-form-item label="浮动IP：" prop="floatingIpAddress">
              {{ floatIpDetail.floatingIpAddress }}
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="端口：" prop="portId">
              <el-select v-model="associateData.portId" placeholder="请选择端口">
                <el-option v-for="(item, index) in portData" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="associateVisible = false">取消</el-button>
        <el-button type="primary" @click.native="associateSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <selection-service :obj="{ suffix: 'eip' }" router="ServiceFloatIpCreate" code="network" v-if="dialog.dialog" :dialog="dialog"></selection-service>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { getFloatIp, removeFloatIp, detailFloatIp, floatIpPorts, removeFloatIpPorts, getFloatIpPorts, removeFirewalls } from 'services/platform/index'
import selectionService from '@/components/selectionService.vue'
import UnsubscribeService from '@/components/UnsubscribeService.vue'

const statusData = [
  { name: '运行中', id: 'RUNNING' },
  { name: '停止', id: 'STOPPED' }
]
const searchConfigs = [
  { type: 'Input', label: '外网IP', value: 'floatingIpAddress', sign: 'LK' },
  { type: 'Select', value: 'status', data: statusData }
]

export default {
  components: { selectionService, UnsubscribeService },
  mixins: [webSocket],
  filters: {
    chargeCategory(value) {
      const obj = {
        POSTCHARGE: '后付费',
        PREPCHARGE: '预付费'
      }
      return obj[value]
    }
  },
  data() {
    return {
      detailSetting: {
        type: 'ip',
        columns: [
          [
            { name: '浮动IP地址', value: 'floatingIpAddress' },
            {
              name: '状态',
              value: 'status'
            },
            { name: '资源池', value: 'networkName' }
          ],
          [
            { name: '所属平台', value: 'vendorName' },
            { name: '租户用户', value: 'targetName' },
            { name: '所属租户', value: 'tenantName' }
          ],
          [{ name: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectName' }]
        ]
      },
      statusData,
      searchConfigs,
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      detailFlag: false,
      vendorList: [],
      associateVisible: false,
      floatIpDetail: {},
      associateData: {},
      portData: [],
      dialog: {
        dialog: false
      },
      loading: false,
      rules: {
        vendorId: [{ required: true, message: '请选择平台', trigger: 'blur,change' }],
        networkId: [{ required: true, message: '请选择IP', trigger: 'blur,change' }],
        months: [{ required: true, message: '请填写内容', trigger: 'blur,change' }],
        count: [{ required: true, message: '请填写内容', trigger: 'blur.change' }],
        portId: [{ required: true, message: '请选择端口', trigger: 'blur.change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    close(data) {
      data = {}
    },
    onmessage(data) {
      this.getList()
    },
    getList() {
      getFloatIp(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(item => {
            const nowTime = new Date()
            const nowDate = nowTime.getTime()
            item.isExpired = false
            const expiredTimeDate = new Date(item.expiredTime).getTime()
            if (expiredTimeDate < nowDate) {
              item.isExpired = true
            }
          })
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getList()
    },
    // 详情
    handleDetail(id) {
      this.getDetail(id)
      if (this.floatIpDetail) {
        this.detailFlag = true
      }
    },
    goBack() {
      this.detailFlag = false
    },
    // 删除和解绑
    handleDelete(row, flag) {
      const id = row.id
      let url, tip
      switch (flag) {
        case 1:
          this.$confirm('是否释放浮动IP?', '提示', {
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          })
            .then(() => {
              removeFloatIp(id).then(data => {
                if (data.success) {
                  this.$message({
                    message: data.message,
                    type: 'success'
                  })
                  this.getList()
                }
              })
            })
            .catch(() => {})
          break
        case 2:
          this.$confirm('是否解绑浮动IP?', '提示', {
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          }).then(() => {
            removeFloatIpPorts({ id: id }).then(data => {
              if (data.success) {
                this.$message({
                  message: data.message,
                  type: 'success'
                })
                this.getList()
              }
            })
          })
          break
      }
    },
    // 获取详情
    getDetail(id) {
      detailFloatIp(id).then(data => {
        if (data.success) {
          this.floatIpDetail = data.data
        }
      })
    },
    // 获取端口
    getPort(id) {
      const that = this
      getFloatIpPorts({ id: id }).then(data => {
        if (data.success) {
          that.portData = data.data
        }
      })
    },
    associate(id, ip) {
      this.floatIpDetail.floatingIpAddress = ip
      this.getPort(id)
      this.associateData = {
        id: id,
        portId: ''
      }
      this.associateVisible = true
    },
    associateSubmit() {
      this.$refs.associateData.validate(valid => {
        if (valid) {
          this.loading = true
          floatIpPorts(this.associateData).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.associateVisible = false
              this.getList()
            }
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style></style>
