<template>
  <div class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading" ref="multipleTable">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceFloatIpCreate', params: { type: 'EASYSTACK' } }" class="m-l-xs">
          <el-button type="primary">订购浮动IP</el-button>
        </router-link>
      </template>
      <template #floatingIpAddress="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackNetworkStatus }}</status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" v-if="!record.portUuid" @click="associate(record.id, record.floatingIpAddress)"><i class="iconfont icon-association"></i>关联</el-button>
        <el-button type="text" v-if="record.portUuid" @click="handleDelete(record, 2)"><i class="iconfont icon-yichu"></i>解绑</el-button>
        <!-- <UnsubscribeService :data="record" @getList="getData" type="fip">
        </UnsubscribeService> -->
      </template>
    </AdvanceTable>
    <common-detail-right v-if="detailFlag" :title="detail.floatingIpAddress" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="浮动IP地址">{{ detail.floatingIpAddress }}</common-detail-item>
        <common-detail-item label="状态">
          <status-icon :type="detail.status | vmStatusColor">{{ detail.status | openstackNetworkStatus }}</status-icon>
        </common-detail-item>
        <common-detail-item label="openstack项目">{{ detail.osTenantName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.serviceConfigLabel">{{ detail.businessName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel">{{ detail.projectName }}</common-detail-item>
        <common-detail-item label="创建者">{{ detail.creatorName }}</common-detail-item>
        <common-detail-item label="所有者">{{ detail.ownerName }}</common-detail-item>
        <common-detail-item label="维护者">{{ detail.menderName }}</common-detail-item>
      </template>
    </common-detail-right>
    <!--关联-->
    <el-dialog title="关联" :close-on-click-modal="false" v-if="associateVisible" :visible.sync="associateVisible" width="50%">
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
  </div>
</template>

<script>
import { getFloatIp, removeFloatIp, detailFloatIp, floatIpPorts, removeFloatIpPorts, getFloatIpPorts, removeFirewalls } from 'services/platform/index'
import selectionService from '@/components/selectionService.vue'
import UnsubscribeService from '@/components/UnsubscribeService.vue'

const statusData = [
  { name: '运行中', id: 'RUNNING' },
  { name: '停止', id: 'STOPPED' }
]
const searchConfigs = [
  { type: 'Input', label: '外网IP', value: 'floatingIpAddress', sign: 'LK' },
  { type: 'Select', value: 'status', data: statusData },
  { type: 'Const', value: 'vendorType', initValue: 'EASYSTACK' }
]

export default {
  components: { selectionService },
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
      columns: [
        {
          label: '浮动IP',
          prop: 'floatingIpAddress'
        },
        {
          label: '内网IP',
          prop: 'fixedIpAddress'
        },
        {
          label: '浮动IP池',
          prop: 'networkName'
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: this.$store.getters.systemConfig.serviceConfigLabel,
          prop: 'businessName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '创建者',
          prop: 'creatorName'
        },
        {
          label: '所有者',
          prop: 'ownerName'
        },
        {
          label: '维护者',
          prop: 'menderName'
        },
        {
          label: '操作',
          width: '220px',
          scopedSlots: { customRender: 'operate' },
          disabled: true
        }
      ],
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
  methods: {
    getData() {
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
                  this.getData()
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
                this.getData()
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
              this.getData()
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
