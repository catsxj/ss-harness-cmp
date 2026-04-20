<template>
  <div class="wrapper">
    <!-- list列表 -->
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceFloatIpCreate', params: { type: 'HUAWEI' } }" class="m-l-xs">
          <el-button type="primary">订购浮动IP</el-button>
        </router-link>
      </template>
      <template #publicIp="val, record">
        {{ record.publicIp }}
        <div v-if="record.publicIpv6Address">
          {{ record.publicIpv6Address }}
        </div>
      </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #bandwidthDetail="val, record">
        {{ record.bandwidthChargeMode == 'traffic' ? `按流量计费: ${record.bandwidth} Mbit/s` : `按带宽计费: ${record.bandwidth} Mbit/s` }}
      </template>
      <template #tag="tag, record">
        <tag :detail="record" type="FLOATING_IP" @back="getData"></tag>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="associate(record)" :disabled="record.instanceName != null && record.instanceName != ''">关联</el-button>
        <el-button type="text" :disabled="record.instanceId == null || record.instanceId == ''" @click="disassociation(record)">取消关联</el-button>
        <div class="action-divider"></div>
        <UnsubscribeService :data="record" @getList="getData" type="fip"> </UnsubscribeService>
        <div class="action-divider"></div>
        <el-button type="text" @click="editBandWidth(record)">修改带宽</el-button>
      </template>
    </AdvanceTable>
    <!-- 关联弹窗 -->
    <el-dialog title="绑定弹性公网IP" :visible.sync="bandIpDialog" width="50%" @close="close">
      <el-row>
        <basic-form :model="publicIpForm" ref="publicIpRef">
          <el-col :span="24">
            <basic-form-item label="弹性公网IP：">
              <span>{{ publicIp }}</span>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="IPv6地址：" v-if="publicIpv6Address">
              <span>{{ publicIpv6Address }}</span>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="选择实例：">
              <el-radio-group v-model="publicIpForm.instance">
                <el-radio label="云服务器" border></el-radio>
                <el-radio label="裸金属服务器" border disabled></el-radio>
                <el-radio label="虚拟IP地址" border disabled></el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item>
              <el-select v-model="publicIpForm.instanceId" @change="changeVm" @close="close">
                <el-option v-for="item in vmList" :key="item.id" :label="item.name" :value="item.instanceId"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="网卡：" validate="required" prop="portUuid">
              <el-select v-model="publicIpForm.portUuid" placeholder="请选择网卡">
                <el-option v-for="item in portList" :key="item.id" :label="`IP: ${item.portFixedIps.length ? item.portFixedIps[0].ipAddress : item.deviceName}, MAC: ${item.macAddress}`" :value="item.portUuid"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </basic-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="bandIpDialog = false">取 消</el-button>
        <el-button type="primary" @click="bandOk">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改带宽弹窗 -->
    <el-dialog title="修改带宽" :visible.sync="editBandWidthDialog" width="50%" @close="$refs.editBandwidthRef.resetFields()">
      <el-row style="background-color: #f4f5f6">
        <basic-form>
          <h4 style="margin-left: 18px">当前带宽</h4>
          <el-col :span="12">
            <basic-form-item label="带宽名称：">{{ currentData.bandwidthName }}</basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="弹性公网IP：">{{ currentData.publicIp }}</basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="带宽大小：">{{ currentData.bandwidth + 'Mbit/s' }}</basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="计费方式：">{{ currentData.bandwidthChargeMode == 'bandwidth' ? '按带宽计费' : '按流量计费' }}</basic-form-item>
          </el-col>
        </basic-form>
      </el-row>
      <el-row>
        <basic-form :model="editBandWidthData" ref="editBandwidthRef">
          <h4 style="margin-left: 18px">变更规格</h4>
          <el-col :span="12">
            <basic-form-item label="带宽名称：" prop="bandwidthName" validate="required">
              <el-input v-model="editBandWidthData.bandwidthName"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="计费方式：" prop="bandwidthChargeMode" validate="required">
              <el-radio-group v-model="editBandWidthData.bandwidthChargeMode">
                <el-radio label="bandwidth" border>按带宽计费</el-radio>
                <el-radio label="traffic" border>按流量计费</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="带宽大小：" prop="bandwidth" validate="required">
              <el-input-number v-model="editBandWidthData.bandwidth" :min="1" :max="editBandWidthData.bandwidthChargeMode == 'bandwidth' ? 2000 : 300" label="描述文字"></el-input-number>
              <span v-if="editBandWidthData.bandwidthChargeMode == 'bandwidth'" class="range">带宽范围：1-2,000 Mbit/s</span>
              <span class="range" v-else>带宽范围：1-300 Mbit/s</span>
            </basic-form-item>
          </el-col>
        </basic-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editBandWidthDialog = false">取 消</el-button>
        <el-button type="primary" @click="editOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getRegion, getElasticips, unreleaseElasticips, releaseElasticips, disAssociateElasticipsIp, editElasticipsIp, conditionVm, getPort, associateElasticipsIp, editBandwidth } from 'services/platform/index'
import UnsubscribeService from '@/components/UnsubscribeService.vue'
import tag from '@/components/tag/index.vue'

export default {
  components: { UnsubscribeService, tag },
  computed: {
    searchConfigs() {
      return [
        { type: 'Input', label: 'IP地址', value: 'publicIp' },
        { type: 'Const', value: 'vendorType', initValue: 'HUAWEI' }
      ]
    }
  },
  data() {
    return {
      columns: [
        {
          label: '弹性公网IP',
          scopedSlots: { customRender: 'publicIp' }
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '所属地域',
          prop: 'regionName'
        },
        {
          label: '带宽',
          prop: 'bandwidthName'
        },
        {
          label: '标签',
          prop: 'tag',
          scopedSlots: { customRender: 'tag' }
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
          label: '带宽详情',
          scopedSlots: { customRender: 'bandwidthDetail' }
        },
        {
          label: '已绑定实例',
          prop: 'instanceName'
        },
        {
          label: '操作',
          width: '220px',
          scopedSlots: { customRender: 'operate' },
          disabled: true
        }
      ],
      loading: false,
      searchData: {
        name: '',
        regionId: ''
      },
      total: 0,
      params: {
        page: 1,
        rows: 20
      },
      tableData: [],
      regionList: [],
      addDialog: false,
      ipVersion: false,
      addForm: {
        bandwidthName: '',
        bandwidthShareType: 'PER',
        regionId: '',
        bandwidthChargeMode: 'bandwidth',
        bandwidth: '1',
        ipVersion: '4'
      },
      bandIpDialog: false,
      publicIpForm: {
        instance: '云服务器',
        instanceId: '',
        portUuid: '',
        regionId: '',
        associateId: 0
      },
      publicIp: '',
      publicIpv6Address: '',
      vmList: [],
      portList: [],
      editBandWidthDialog: false,
      currentData: {},
      editBandWidthData: {}
    }
  },
  methods: {
    getData() {
      this.loading = true
      getElasticips(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    associate(row) {
      this.associateId = row.id
      this.publicIpForm.regionId = row.regionId
      this.publicIpForm.vendorId = row.vendorId
      this.publicIp = row.publicIp
      this.publicIpv6Address = row.publicIpv6Address ? row.publicIpv6Address : null
      this.bandIpDialog = true
      this.getVm(row.regionId, row.vendorId)
    },
    close() {
      try {
        this.$refs.addFormRef.resetFields()
      } catch {
        this.$refs.publicIpRef.resetFields()
      }
    },
    cancel() {
      this.addDialog = false
      this.ipVersion = false
      this.addForm.regionId = ''
    },
    // 释放
    release(row) {
      const params = JSON.parse(this.params.params)
      const h = this.$createElement
      this.$msgbox({
        title: '释放弹性ip地址',
        message: h('div', null, [h('p', null, '弹性公网IP释放后无法恢复。您确定要释放以下弹性公网IP吗？实例：'), h('p', null, `${row.elasticIpUuid} / ${row.publicIp}`)]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(action => {
        if (action === 'confirm') {
          releaseElasticips(row.id).then(data => {
            const val = data.success ? 'success' : 'error'
            this.$message({
              type: val,
              message: data.message
            })
            this.getData()
          })
        }
      })
    },
    // 解绑
    disassociation(row) {
      const h = this.$createElement
      this.$msgbox({
        title: '取消关联弹性ip地址',
        message: h('div', null, [h('p', null, '您确定要解绑该弹性公网IP绑定的资源吗？'), h('p', null, '弹性公网IP实例ID：'), h('ul', null, [h('li', null, `${row.publicIp}`)]), h('p', null, '实例ID：'), h('ul', null, [h('li', null, `${row.instanceId}`)])]),
        showCancelButton: true,
        confirmButtonText: '取消关联',
        cancelButtonText: '取消'
      }).then(action => {
        if (action === 'confirm') {
          disAssociateElasticipsIp(
            {
              action: 'disassociation'
            },
            row.id
          ).then(data => {
            const val = data.success ? 'success' : 'error'
            this.$message({
              type: val,
              message: data.message
            })
            this.getData()
          })
        }
      })
    },
    // 开启关闭ipv6
    editIpv6(row) {
      const h = this.$createElement
      this.$msgbox({
        title: row.ipVersion == '4' ? '开启Ipv6' : '关闭Ipv6',
        message: row.ipVersion == '4' ? h('div', null, [h('p', null, '您确定开启Ipv6吗')]) : h('div', null, [h('p', null, '您确定关闭Ipv6吗')]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(action => {
        if (action == 'confirm') {
          if (row.ipVersion == '4') {
            row.ipVersion = '6'
          } else {
            row.ipVersion = '4'
          }
          editElasticipsIp(row.id, row).then(data => {
            const val = data.success ? 'success' : 'error'
            this.$message({
              type: val,
              message: data.message
            })
            this.getData()
          })
        }
      })
    },
    // 获取云服务器下拉菜单
    getVm(regionId, vendorId) {
      const params = {
        condition: 'hicUnBindEip',
        vendorId: vendorId,
        regionId
      }
      conditionVm(params).then(data => {
        if (data.success) {
          this.vmList = data.data
        }
      })
    },
    changeVm() {
      this.publicIpForm.portUuid = ''
      this.getPortList()
    },
    // 获取下拉网卡
    getPortList() {
      const params = JSON.stringify([
        { param: { vendorId: this.publicIpForm.vendorId, regionId: this.publicIpForm.regionId, deviceUuid: this.publicIpForm.instanceId }, sign: 'EQ' },
        { param: { deviceOwner: 'compute' }, sign: 'LK' }
      ])
      getPort({ ...this.params, params }).then(data => {
        if (data.success) {
          this.portList = data.data.rows
        }
      })
    },
    bandOk() {
      this.$refs.publicIpRef.validate(valid => {
        if (valid) {
          const params = {
            action: 'association',
            instanceId: this.publicIpForm.portUuid
          }
          associateElasticipsIp(this.associateId, params).then(data => {
            if (data.success) {
              const type = data.success ? 'success' : 'error'
              this.$message({
                type: type,
                message: data.message
              })
              this.bandIpDialog = false
              this.getData()
            }
          })
        }
      })
    },
    // 点击修改带宽按钮
    editBandWidth(row) {
      this.currentData = row
      this.editBandWidthData = JSON.parse(JSON.stringify(row))
      this.editBandWidthDialog = true
    },
    // 确认修改带宽
    editOk() {
      this.$refs.editBandwidthRef.validate(valid => {
        if (valid) {
          const editParams = {
            id: this.editBandWidthData.id,
            regionId: this.editBandWidthData.regionId,
            bandwidthUuid: this.editBandWidthData.bandwidthUuid,
            bandwidthName: this.editBandWidthData.bandwidthName,
            bandwidthChargeMode: this.editBandWidthData.bandwidthChargeMode,
            bandwidth: this.editBandWidthData.bandwidth
          }
          editBandwidth(this.editBandWidthData.id, editParams).then(data => {
            const type = data.success ? 'success' : 'error'
            this.$message({
              type: type,
              message: data.message
            })
            this.editBandWidthDialog = false
            this.getData()
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.range {
  margin-left: 20px;
  font-size: 12px;
  color: #e37d29;
}
</style>
