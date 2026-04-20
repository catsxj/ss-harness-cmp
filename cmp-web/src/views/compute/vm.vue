<template>
  <el-card class="wrapper">
    <div v-if="!detailFlag">
      <el-form :inline="true">
        <el-form-item>
          <el-input class="search-item" placeholder="名称" v-model="listQuery.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input class="search-item" placeholder="IP" v-model="listQuery.privateIps"></el-input>
        </el-form-item>
        <el-form-item>
          <el-cascader placeholder="租户" v-model="listQuery.tenantId" :options="tenantList" clearable :props="{ emitPath: false, value: 'id', label: 'name', children: 'children' }" @change="handleSearch"></el-cascader>
        </el-form-item>
        <el-form-item>
          <el-select v-model="listQuery.projectId" clearable :placeholder="'请选择' + $store.getters.systemConfig.projectConfigLabel" filterable @change="handleSearch">
            <el-option v-for="item in projectList" :key="item.value" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="listQuery.vendorId" clearable placeholder="平台" filterable @change="handleSearch">
            <el-option v-for="item in platformData" :key="item.value" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="listQuery.status" clearable placeholder="请选择状态" @change="handleSearch">
            <el-option v-for="item in statusData" :key="item.value" :value="item.value" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" class="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button type="ghost" class="el-icon-refresh" @click="handleReset">重置</el-button>
          <el-button type="ghost" @click="handleImport()">
            <i class="el-icon-download"></i>
            导出
          </el-button>
        </el-form-item>
      </el-form>
      <AdvanceTable title="" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #ip="val, record">
          <div v-if="record.vendorType == 'OPENSTACK' || record.vendorType == 'EASYSTACK' || record.vendorType == 'MANAGEONE' || record.vendorType == 'FUSIONCLOUD'">
            <span v-for="item in record.privateIpsList" :key="item.networkId">
              <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
            </span>
          </div>
          <div
            v-else-if="
              record.vendorType == 'VMWARE' ||
              record.vendorType == 'INSPURRAIL' ||
              record.vendorType == 'CNWARE' ||
              record.vendorType == 'ZSTACK' ||
              record.vendorType == 'CECSTACK' ||
              record.vendorType == 'H3C' ||
              record.vendorType == 'SANGFOR' ||
              record.vendorType == 'CLOUDTOWER' ||
              record.vendorType == 'YYJQCLOUD'
            "
          >
            <div v-for="item in record.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </div>
          <div v-else-if="record.vendorType == 'USPHERE'">
            <div v-for="item in record.privateIpsList" :key="item.address || item.ip">
              <div>{{ item.address || item.ip }}</div>
              <div v-if="item.reserveIp">
                <div v-for="row in item.reserveIp" :key="row.id">{{ row.ip }}</div>
              </div>
            </div>
          </div>
          <div v-else-if="record.vendorType == 'HUAWEI' || record.vendorType == 'HCSO'">
            <div v-for="item in record.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </div>
          <div v-else-if="record.vendorType == 'QCLOUD'">
            <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item.address }}</div>
          </div>
          <div v-else-if="record.vendorType == 'AZURE' || record.vendorType == 'AWS'">
            <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
          </div>
          <div v-else-if="record.vendorType == 'JDCLOUD'">
            <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item }}</div>
          </div>
          <div v-else-if="record.vendorType == 'VOLCENGINE'">
            <div v-if="JSON.parse(record.privateIps)[0].primaryIpAddress">{{ JSON.parse(record.privateIps)[0].primaryIpAddress }}(内网)</div>
            <div v-if="JSON.parse(record.privateIps)[0].eipAddress">{{ JSON.parse(record.privateIps)[0].eipAddress }}(公网)</div>
          </div>
          <div v-else-if="record.vendorType == 'SMARTX'">
            <div>{{ record.managerIp ? '(内网)' + record.managerIp : '--' }}</div>
          </div>
          <div v-else-if="record.vendorType == 'SUGONCLOUD'">
            <div v-for="(item, index) in record.privateIpsList" :key="index">
              <div v-if="item.floatingAddress">公网：{{ item.floatingAddress }}</div>
              <div>内网：{{ item.fixedAddress }}</div>
            </div>
          </div>
          <div v-else>
            <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
          </div>
          <div v-if="record.floatingIp">(公网){{ record.floatingIp }}</div>
          <div v-if="record.vendorType == 'TENCENT' || record.vendorType == 'ALIYUN' || record.vendorType == 'AZURE' || record.vendorType == 'AWS' || record.vendorType == 'QCLOUD' || record.vendorType == 'CNWARE' || record.vendorType == 'CECSTACK' || record.vendorType == 'USPHERE'">
            <div v-for="(item, index) in record.publicIps" :key="index">(公网){{ item.address || item }}</div>
          </div>
        </template>
        <template #status="status">
          <status-icon :type="vmStatusColorFilter(status)">
            {{ openstackServerFilter(status) }}
          </status-icon>
        </template>
        <template #spec="val, record"> {{ (record.cpu ? record.cpu : 0) + 'C/' + (record.memory ? record.memory : 0) + 'GB/' }}{{ record.disk == null ? 0 : record.disk + 'GB' }} </template>
        <template #system="val, record">
          <div v-if="record.vendorType == 'VMWARE' || record.vendorType == 'TIANYI' || record.vendorType == 'HUAWEI'">
            {{ record.osName ? record.osName : record.osCategory }}
          </div>
          <div v-else-if="record.vendorType == 'SMARTX' || record.vendorType == 'ZSTACK'">
            {{ record.osVersion }}
          </div>
          <div v-else>
            {{ (record.osCategory ? record.osCategory : '') + ' ' + (record.osName ? record.osName : '') + ' ' + (record.osVersion ? record.osVersion : '') }}
          </div>
        </template>
        <template #cpuUsage="cpuUsage">
          <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="cpuUsage ? cpuUsage : 0"></el-progress>
        </template>
        <template #memUsage="memUsage">
          <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="memUsage ? memUsage : 0"></el-progress>
        </template>
        <template #operate="val, record">
          <el-button type="text" @click="handleMonitorDetail(record)"> 告警详情</el-button>
          <div class="action-divider"></div>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleLink(record)"> 关联规则 </el-dropdown-item>
              <el-dropdown-item @click.native="handlePolicy(record)">
                {{ `${record.alarmEnable ? '屏蔽' : '开启'}告警` }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </AdvanceTable>
      <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
      <el-dialog title="设置监控IP" :visible.sync="setIPFlag" v-if="setIPFlag">
        <el-row>
          <basic-form ref="setData" :model="setData" :status-icon="true">
            <el-col :span="24">
              <basic-form-item label="IP地址：" prop="ip" validate="required">
                <el-select clearable v-model="setData.ip">
                  <el-option v-for="(item, index) in ipData" :key="index" :label="item.address" :value="item.address"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </basic-form>
        </el-row>
        <span slot="footer" class="dialog-footer">
          <el-button type="ghost" @click.native="setIPFlag = false">取 消</el-button>
          <el-button type="primary" @click.native="setSubmit">确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <aliyun-detail v-if="detailData.vendorType == 'ALIYUN'" :detail-id="detailId" :instance-id="instanceId"></aliyun-detail>
        <yyjqcloud-detail v-if="detailData.vendorType == 'YYJQCLOUD'" :detail-id="detailId" :instance-id="instanceId"></yyjqcloud-detail>
        <qcloud-detail v-if="detailData.vendorType == 'QCLOUD'" :detail-id="detailId" :instance-id="instanceId"></qcloud-detail>
        <azure-detail v-if="detailData.vendorType == 'AZURE'" :detail-id="detailId" :instance-id="instanceId"></azure-detail>
        <cecstack-detail v-if="detailData.vendorType == 'CECSTACK'" :detail-id="detailId" :instance-id="instanceId"></cecstack-detail>
        <openstack-detail v-if="detailData.vendorType == 'OPENSTACK'" :detail-id="detailId" :instance-id="instanceId"></openstack-detail>
        <easystack-detail v-if="detailData.vendorType == 'EASYSTACK'" :detail-id="detailId" :instance-id="instanceId"></easystack-detail>
        <vcenter-detail v-if="detailData.vendorType == 'VMWARE'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :bios-uuid="biosUuid"></vcenter-detail>
        <inspurRailDetail v-if="detailData.vendorType == 'INSPURRAIL'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :bios-uuid="biosUuid"></inspurRailDetail>
        <huawei-detail v-if="detailData.vendorType == 'HUAWEI'" :detail-id="detailId" :instance-id="instanceId"></huawei-detail>
        <fcDetail v-if="detailData.vendorType == 'FUSIONSPHERE'" :detail="detailData" :detail-id="detailId" :instance-id="instanceId"></fcDetail>
        <smart-detail v-if="detailData.vendorType == 'SMARTX'" :detail-id="detailId" :instanceId="instanceId"></smart-detail>
        <cloudtower-detail v-if="detailData.vendorType == 'CLOUDTOWER'" :detail-id="detailId" :instanceId="instanceId"></cloudtower-detail>
        <zstack-detail v-if="detailData.vendorType == 'ZSTACK'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :bios-uuid="biosUuid" :instanceId="instanceId"></zstack-detail>
        <h3c-detail v-if="detailData.vendorType == 'H3C'" :detail-id="detailId" :instance-id="instanceId" :identifier="identifier"></h3c-detail>
        <cnware-detail v-if="detailData.vendorType == 'CNWARE'" :detail-id="detailId" :detailUuid="detailUuid" :detailVendorId="detailVendorId"></cnware-detail>
        <!-- version 目前不好保存在接口里面,现在只使用 SCP -->
        <sangforSCP-detail v-if="detailData.vendorType == 'SANGFOR'" :detail-id="detailId" :detailUuid="detailUuid"></sangforSCP-detail>
        <!-- <sangforHCI-detail v-if="detailData.vendorType == 'SANGFOR' && detailData.version.includes('6.3')" :detail-id="detailId" :detailUuid="detailUuid"></sangforHCI-detail> -->
        <!-- <sangforSCP-detail v-if="detailData.vendorType == 'SANGFOR' && detailData.version.includes('6.8')" :detail-id="detailId" :detailUuid="detailUuid"></sangforSCP-detail> -->
        <manageOneDetail v-if="detailData.vendorType == 'MANAGEONE'" :detail="detailData" :detail-id="detailId" :instance-id="instanceId" :detailData="detailData"></manageOneDetail>
      </div>
    </common-detail>
  </el-card>
</template>

<script>
import { vmStatusColorFilter, openstackServerFilter } from '@/filters/index'
import { getVms, setIps, getRuleGroupBind } from 'services/monitor/index.js'
import { getTenant } from 'services/system/tenant'
import { getProject } from 'services/system/project'
import { conditionCloudVendor } from 'services/platform/index'
import aliyunDetail from './cloud/aliyun/detail.vue'
import qcloudDetail from './cloud/qcloud/detail.vue'
import yyjqcloudDetail from './cloud/yyjqcloud/detail.vue'
import azureDetail from './cloud/azure/detail.vue'
import cecstackDetail from './cloud/cecStack/detail.vue'
import openstackDetail from './cloud/openstack/vm_detail.vue'
import easystackDetail from './cloud/easystack/vm_detail.vue'
import vcenterDetail from './cloud/vcenter/vm_detail.vue'
import inspurRailDetail from './cloud/inspurRail/vm_detail.vue'
import huaweiDetail from './cloud/huawei/detail.vue'
import smartDetail from './cloud/smart/vm_detail.vue'
import cloudtowerDetail from './cloud/cloudTower/vm_detail.vue'
import zstackDetail from './cloud/zstack/vm_detail.vue'
import fcDetail from './cloud/fc/vm_detail.vue'
import h3cDetail from './cloud/h3c/vm_detail.vue'
import cnwareDetail from './cloud/cnware/vm_detail.vue'
// import sangforHCIDetail from './cloud/sangforHCI/vm_detail.vue'
import sangforSCPDetail from './cloud/sangforSCP/vm_detail.vue'
import manageOneDetail from './cloud/manageone/vm_detail.vue'
import { customColorMethod, handleStart } from 'views/data'
import addPolicy from 'views/components/linkPolicy'
import { downloadFile } from 'utils/index'
export default {
  components: {
    aliyunDetail,
    cecstackDetail,
    openstackDetail,
    easystackDetail,
    vcenterDetail,
    huaweiDetail,
    smartDetail,
    addPolicy,
    zstackDetail,
    cloudtowerDetail,
    fcDetail,
    inspurRailDetail,
    qcloudDetail,
    azureDetail,
    h3cDetail,
    cnwareDetail,
    // sangforHCIDetail,
    sangforSCPDetail,
    manageOneDetail,
    yyjqcloudDetail
  },
  data() {
    return {
      vmStatusColorFilter,
      openstackServerFilter,
      listQuery: {
        name: ''
      },
      statusData: [
        { value: 'RUNNING', name: '运行中' },
        { value: 'BUILDING', name: '创建中' },
        { value: 'STOPPED', name: '关机' },
        { value: 'SUSPENDED', name: '挂起' },
        { value: 'EXCEPTION', name: '异常' },
        { value: 'UNKNOWN', name: '断开' }
      ],
      tenantList: [],
      projectList: [],
      platformData: [],
      columns: [
        {
          type: 'selection',
          disabled: true
        },
        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: 'IP',
          prop: 'privateIps',
          scopedSlots: { customRender: 'ip' }
        },
        {
          label: '平台',
          prop: 'vendorType'
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '规格',
          prop: 'spec',
          scopedSlots: { customRender: 'spec' }
        },
        {
          label: '操作系统',
          prop: 'system',
          scopedSlots: { customRender: 'system' }
        },
        {
          label: 'CPU利用率',
          prop: 'cpuUsage',
          scopedSlots: { customRender: 'cpuUsage' }
        },
        {
          label: '内存利用率',
          prop: 'memUsage',
          scopedSlots: { customRender: 'memUsage' }
        },
        {
          label: '所属租户',
          prop: 'tenantName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '操作',
          disabled: true,
          prop: 'id',
          width: '160px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      customColorMethod,
      handleStart,
      params: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      idList: [],
      selectList: [],
      detailFlag: false,
      detailId: null,
      detailUuid: '',
      detailVendorId: '',
      instanceId: '',
      setData: {},
      ipData: [],
      setIPFlag: false,
      loading: false,
      identifier: '',
      hostName: '',
      biosUuid: '',
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: '',
      detailData: {}
    }
  },
  methods: {
    // 导出
    handleImport() {
      downloadFile('/cms/v1/vms/download', {
        params: this.params.params
      })
    },
    goBackCloud() {
      history.go(-1)
    },
    getList() {
      this.refreshId()
      this.loading = true
      getVms(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            item.cpuUsage = Number(item.cpuUsage)
            item.memUsage = Number(item.memUsage)
            if (item.vendorType === 'SANGFOR' && item.privateIps) {
              item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map((item) => ({ address: Object.keys(item)[0] })))
            }
            if (item.privateIps) {
              item.privateIpsList = JSON.parse(item.privateIps)
            }
            if (item.publicIps) {
              item.publicIps = JSON.parse(item.publicIps)
            }
            switch (item.onOffStatus) {
              case '0':
                item.onOffStatus = '断开'
                break
              case '1':
                item.onOffStatus = '正常'
                break
              default:
                item.onOffStatus = '未知'
                break
            }
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.resourceMonitorTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    handleSelectItem(selection, row) {
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
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach((item) => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach((item) => {
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
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'privateIps:lk': this.listQuery.privateIps,
        'name:lk': this.listQuery.name,
        isTemplate: false,
        tenantId: this.listQuery.tenantId || '',
        projectId: this.listQuery.projectId || '',
        vendorId: this.listQuery.vendorId || '',
        status: this.listQuery.status || ''
      })
      this.getList()
    },
    handleReset() {
      this.listQuery = {}
      this.selectList = []
      this.handleSearch()
    },
    getPlatformData() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'listByTypes',
          types: ['OPENSTACK', 'EASYSTACK', 'VMWARE', 'INSPURRAIL', 'FUSIONCLOUD', 'HMC', 'MANAGEONE', 'KUBERNETES', 'TIANYI', 'HUAWEI', 'H3C', 'ALIYUN', 'QCLOUD', 'AZURE', 'TENCENT', 'AWS', 'SMARTX', 'CLOUDTOWER', 'ZSTACK', 'CECSTACK', 'FUSIONSPHERE', 'USPHERE', 'CNWARE', 'SANGFOR', 'APSARASTACK', 'LENOVO']
        })
      }).then((data) => {
        if (data.success) {
          this.platformData = data.data
        }
      })
    },
    getTenantList() {
      getTenant({
        condition: JSON.stringify({
          condition: 'listTopOrganization',
          isTree: true
        })
      }).then((data) => {
        if (data.success) {
          this.tenantList = data.data.rows
        }
      })
    },
    getProject() {
      getProject({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { queryAsManager: true }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.projectList = data.data.rows
        }
      })
    },
    handleLink(data) {
      this.ruleGroupIds = []
      this.resourceId = data.id
      this.resourceType = data.vendorType == 'VMWARE' ? 'MONITOR_VCENTER_VM' : `MONITOR_${data.vendorType}_VM`
      getRuleGroupBind(data.id).then((data) => {
        if (data.success) {
          this.ruleGroupIds = data.data
          this.addFlag = true
        }
      })
    },
    cancle() {
      this.addFlag = false
      this.getList()
    },
    handlePolicy(data) {
      this.resourceType = data.vendorType == 'VMWARE' ? 'MONITOR_VCENTER_VM' : `MONITOR_${data.vendorType}_VM`
      this.handleStart(this, data, this.resourceType)
    },
    getDetail(row) {
      this.detailId = row.id
      this.instanceId = row.instanceId
      this.identifier = row.name
      this.hostName = row.hostName
      this.biosUuid = row.biosUuid
      this.detailUuid = row.instanceId
      this.detailVendorId = row.vendorId
      this.$set(this, 'detailData', row)
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    },
    handleMonitorDetail(data) {
      this.resourceType = data.vendorType == 'VMWARE' ? 'MONITOR_VCENTER_VM' : `MONITOR_${data.vendorType}_VM`
      this.$router.push({
        name: 'MonitorDetailList',
        query: { id: data.id, name: data.name, type: this.resourceType }
      })
    },
    setIP(row) {
      this.setData = {
        id: row.id,
        ip: row.monitorIp
      }
      this.ipData = row.privateIps
      this.setIPFlag = true
    },
    setSubmit() {
      this.$refs.setData.validate((valid) => {
        if (valid) {
          setIps(this.setData).then((data) => {
            this.$notify({
              message: data.message,
              type: 'success'
            })
            this.setIPFlag = false
            this.getList()
          })
        }
      })
    }
  },
  created() {
    this.handleSearch()
    this.getTenantList()
    this.getProject()
    this.getPlatformData()
  }
}
</script>
<style scoped></style>
