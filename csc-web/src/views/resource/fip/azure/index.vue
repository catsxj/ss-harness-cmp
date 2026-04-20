<template>
  <el-card class="wrapper">
    <AdvanceTable :card-border="false" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceFloatIpCreate', params: { type: 'AZURE' } }" class="m-l-xs">
          <el-button type="primary">订购浮动IP</el-button>
        </router-link>
      </template>
      <template #floatingIpAddress="val, record">
        <el-button type="text" @click="handleDetail(record.id)">{{ record.floatingIpAddress }}</el-button>
      </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.isExpired" v-if="!record.portUuid" @click="associate(record.id, record.floatingIpAddress)"><i class="iconfont icon-association"></i>关联</el-button>
        <el-button type="text" :disabled="record.isExpired" v-if="record.portUuid" @click="handleDelete(record, 2)"><i class="iconfont icon-yichu"></i>解绑</el-button>
        <div class="action-divider" v-if="record.portUuid || record.portUuid"></div>
        <el-button type="text" @click="bindIp(record)" v-if="record.status === 'UNBIND'"> <i class="el-icon-bind"></i> 绑定云主机 </el-button>
        <el-button type="text" @click="unBind(record)" v-if="record.status != 'UNBIND'"> <i class="el-icon-bind"></i> 解绑云主机 </el-button>
        <div class="action-divider"></div>
        <UnsubscribeService :data="record" @getList="getList"> </UnsubscribeService>
      </template>
    </AdvanceTable>
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
    <bind :add-data="bindData" v-if="bindData.dialog"></bind>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { getFloatIp, removeFloatIp, detailFloatIp, floatIpPorts, removeFloatIpPorts, getFloatIpPorts, removeFirewalls } from 'services/platform/index'
import selectionService from '@/components/selectionService.vue'
import UnsubscribeService from '@/components/UnsubscribeService.vue'
import bind from './bind.vue'
const statusData = [
  { name: '运行中', id: 'RUNNING' },
  { name: '停止', id: 'STOPPED' }
]
const searchConfigs = [
  { type: 'Input', label: '外网IP', value: 'floatingIpAddress', sign: 'LK' },
  { type: 'Select', value: 'status', data: statusData }
]

const columns = [
  {
    label: '外网IP',
    prop: 'floatingIpAddress',
    scopedSlots: { customRender: 'floatingIpAddress' }
  },
  {
    label: '内网IP',
    prop: 'fixedIpAddress'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '过期时间',
    prop: 'expiredTime'
  },
  {
    label: '所属平台',
    prop: 'vendorName'
  },
  {
    label: '操作',
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]

export default {
  components: { selectionService, UnsubscribeService, bind },
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
      columns,
      loading: false,
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
      rules: {
        vendorId: [{ required: true, message: '请选择平台', trigger: 'blur,change' }],
        networkId: [{ required: true, message: '请选择IP', trigger: 'blur,change' }],
        months: [{ required: true, message: '请填写内容', trigger: 'blur,change' }],
        count: [{ required: true, message: '请填写内容', trigger: 'blur.change' }],
        portId: [{ required: true, message: '请选择端口', trigger: 'blur.change' }]
      },
      bindData: {
        dialog: false,
        data: {}
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    bindIp(data) {
      this.bindData = {
        dialog: true,
        data: {
          id: data.id,
          vendorId: data.vendorId,
          regionId: data.regionId
        }
      }
    },
    unBind(data) {
      this.$confirm('是否解绑该浮动IP？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFloatIpPorts({ id: data.id }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
          }
        })
      })
    },
    close(data) {
      data = {}
    },
    onmessage(data) {
      this.getList()
    },
    getList() {
      this.loading = true
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
        this.loading = false
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
