<template>
  <common-detail :data="detail" :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header" v-if="detail.showBtn">
        <header-content :detail="detail" :ip="networkConfigs.length ? networkConfigs[0].address : ''"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button v-if="cloudDetail.version != '5.5'" :disabled="detail.status != 'RUNNING' || detail.disabled" size="medium" @click="goWebConsole">控制台</el-button>
            <el-button v-else :disabled="detail.status != 'RUNNING' || detail.disabled" size="medium" @click="goVmrc">控制台</el-button>
            <el-button v-if="detail.status == 'STOPPED'" :disabled="detail.disStart || detail.disabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button v-else :disabled="detail.disStop || detail.disabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button :disabled="detail.disRestart || detail.disabled" size="medium" @click="patchVm('restart', '重启')">重启</el-button>
            <el-button :disabled="detail.disSuspended || detail.disabled" size="medium" @click="patchVm('suspend', '挂起')">挂起</el-button>
            <!-- <el-button :disabled="detail.disClone || detail.disabled || detail.tenantFlag" size="medium" @click="cloneVm">克隆</el-button> -->
            <el-button :disabled="!detail.toolsRunning || detail.status != 'RUNNING'" size="medium" @click="modifyVmPas">修改密码</el-button>
            <el-button :disabled="(detail.disControl && detail.status != 'STOPPED') || detail.isExpired || detail.allDisabled" size="medium" @click="upgradeSpec">配置变更</el-button>
          </el-col>
        </el-row>
        <div style="clear: both"></div>
      </div>
      <!-- <hr /> -->
      <el-row class="detail-body-body" style="padding: 0 10px 0 10px">
        <el-tabs v-model="active">
          <el-tab-pane label="详细信息" name="detail">
            <el-row :gutter="5">
              <el-col :span="24">
                <detailMsg @back="$emit('back', detail.id)" :detail="detail">
                  <div class="textBox">
                    <div class="label_txt">所属主机</div>
                    <div class="label_val" :title="detail.hostIp">
                      <a style="color: #409eff" :href="'https://' + detail.hostIp" target="_blank">{{ detail.hostIp }}</a>
                    </div>
                  </div>
                </detailMsg>
              </el-col>
              <el-col :span="24">
                <el-card :body-style="{ padding: 0 }" class="m-t">
                  <div slot="header">配置信息</div>
                  <div class="textBox">
                    <div class="label_txt">CPU热插拔</div>
                    <div class="label_input">
                      <el-switch v-model="detail.cpuHotEnable" @change="hotEnable" :disabled="detail.status != 'STOPPED' || detail.isExpired" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
                    </div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">内存热插拔</div>
                    <div class="label_input">
                      <el-switch v-model="detail.memHotEnable" @change="hotEnable" :disabled="detail.status != 'STOPPED' || detail.isExpired" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
                    </div>
                  </div>
                </el-card>
                <el-card class="m-t" :body-style="{ padding: 0 }">
                  <div slot="header" class="clearfix">
                    <span>网络配置</span>
                    <div class="pull-right" v-if="detail.showBtn">
                      <el-button class="add-btn" type="text" @click="addNetCard">新增</el-button>
                    </div>
                  </div>
                  <basic-table :data="networkConfigs" border style="margin: 10px">
                    <el-table-column prop="label" label="网卡名称"> </el-table-column>
                    <el-table-column prop="mac" label="MAC地址"> </el-table-column>
                    <el-table-column prop="name" label="所属网络"></el-table-column>
                    <el-table-column prop="address" label="IP地址"></el-table-column>
                    <el-table-column label="操作" show-overflow-tooltip width="140px" v-if="detail.showBtn">
                      <template slot-scope="scope">
                        <el-button type="text" @click="modifyNetCard(scope.row)">编辑</el-button>
                        <el-button type="text" @click="removeNetCard(scope.row)">删除</el-button>
                      </template>
                    </el-table-column>
                    <div slot="pagination"></div>
                  </basic-table>
                </el-card>
                <volume ref="volume" :detail="detail" @back="setVolumeLength">
                  <div class="pull-right" slot="operate" v-if="detail.showBtn">
                    <el-button class="add-btn" type="text" @click="addDisk">新增</el-button>
                  </div>
                  <el-table-column label="操作" slot="el-table-column" show-overflow-tooltip width="100px" v-if="detail.showBtn">
                    <template slot-scope="scope">
                      <el-button type="text" :disabled="detail.disControl || detail.isExpired || detail.allDisabled || scope.row.bootVolume" @click="dilatation(scope.row)">扩容</el-button>
                    </template>
                  </el-table-column>
                </volume>
                <snapshot :detail="detail" ref="snapshot">
                  <div slot="operate" class="pull-right add-btn" v-if="detail.showBtn">
                    <el-button type="text" :disabled="detail.disSnap || detail.disabled || detail.tenantFlag" @click="createSnapshot">创建快照</el-button>
                    <el-button type="text" v-if="detail.hasSnapshotTask" @click="patchVm('cancelSnapshotTask', '取消定时快照')">取消定时快照</el-button>
                  </div>
                </snapshot>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="operate">
            <res :detail="detail" v-if="active === 'operate'"></res>
          </el-tab-pane>
          <el-tab-pane label="性能监控" name="monitor" style="padding: 10px">
            <monitor v-if="active == 'monitor'" :detail-id="detail.id" :identifier="detail.name" :host-name="detail.hostName" :bios-uuid="detail.biosUuid" :is-show="false"></monitor>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <add-snapshot :add-data="addSnapshotData" v-if="addSnapshotData.dialog" @back="$emit('back', detail.id)"></add-snapshot>
      <clone :add-data="cloneData" v-if="cloneData.dialog"></clone>
      <updete-tools :add-data="updeteToolsData" v-if="updeteToolsData.dialog"></updete-tools>
      <auto-tools :add-data="autoVmtoolsData" v-if="autoVmtoolsData.dialog"></auto-tools>
      <modify-pas :add-data="modifyPasData" v-if="modifyPasData.dialog"></modify-pas>
      <AddDisk @back="$refs.volume.getList()" :config="addDiskData" v-if="addDiskData.visible"></AddDisk>
      <dilatation :config="dilatationData" v-if="dilatationData.visible"></dilatation>
      <clone-to-template :add-data="cloneToTemplateData" v-if="cloneToTemplateData.dialog"></clone-to-template>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
      <netCard :add-data="netCatdData" v-if="netCatdData.dialog"></netCard>
    </div>
  </common-detail>
</template>

<script>
import { detailHost, modifyVm, patchDisk, createVmTemplate, detailVm, vmVmtools, getVcConsole, getVmTickets, vmHotConfigEnable, getRes, getVolume, getVmConsole, removeFloatIpPorts, patchVmId, patchVmResize } from 'services/platform/index'
import webSocket from '@/common/mixins/webSocket'
import detailMsg from '../components/detailMsg.vue'
import volume from '../components/volume.vue'
import snapshot from '../components/snapshot.vue'
import res from '../components/res.vue'
import addSnapshot from './dialog/addSnapshot.vue'
import clone from './dialog/clone.vue'

import updeteTools from './dialog/upGradeVmtools.vue'
import autoTools from './dialog/vmtoolsConfig.vue'
import modifyPas from './dialog/modifyPas.vue'
import dilatation from '../components/dilatation.vue'
import cloneToTemplate from './dialog/cloneToTemplate.vue'
import AddDisk from '../components/addDisk.vue'
import monitor from '@/views/monitor/virtual/vcenter/vm.vue'
import Upgrade from '../components/upgradeSpec.vue'
import netCard from './dialog/netCard.vue'
import headerContent from '../components/header.vue'

import '../index.scss'
import { cloneDeep } from 'lodash-es'
export default {
  components: { headerContent, netCard, Upgrade, monitor, AddDisk, cloneToTemplate, dilatation, snapshot, volume, detailMsg, res, addSnapshot, clone, updeteTools, autoTools, modifyPas },
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  mixins: [webSocket],
  computed: {},
  data() {
    return {
      height: 600,
      active: 'detail',
      clone: {
        dialog: false,
        data: {}
      },
      migrateData: {
        dialog: false,
        data: {}
      },
      updeteToolsData: {
        dialog: false,
        data: {}
      },
      cloneData: {
        dialog: false,
        data: {}
      },
      resetOsData: {
        dialog: false,
        data: {}
      },
      addGroupData: {
        dialog: false,
        data: {}
      },
      autoVmtoolsData: {
        dialog: false,
        data: {}
      },
      addSnapshotData: {
        dialog: false,
        data: {}
      },
      modifyPasData: {
        dialog: false,
        data: {}
      },
      dilatationData: {
        visible: false
      },
      cloneToTemplateData: {
        dialog: false,
        data: {}
      },
      addDiskData: {
        visible: false,
        data: {}
      },
      cloudDetail: {},
      networkConfigs: [],
      volumeLength: 0,
      upgradeDialog: {
        visible: false,
        data: {}
      },
      netCatdData: {
        dialog: false,
        data: {}
      }
    }
  },
  watch: {
    detail() {
      this.setNetCards()
      if (this.$refs.volume) this.$refs.volume.getList()
      detailHost(this.detail.hostId).then(data => {
        if (data.success) {
          this.$set(this.detail, 'hostIp', data.data.manageIp)
        }
      })
    }
  },
  created() {
    this.setNetCards()
    detailHost(this.detail.hostId).then(data => {
      if (data.success) {
        this.$set(this.detail, 'hostIp', data.data.manageIp)
      }
    })
  },
  methods: {
    setNetCards() {
      this.networkConfigs = cloneDeep(this.detail.netcards)
      const ary = []
      this.detail.netcards.forEach(item => {
        ary.push(item.mac)
      })
      this.detail.privateIpsList.forEach(item => {
        if (ary.indexOf(item.mac) > -1) {
          this.networkConfigs[ary.indexOf(item.mac)].address = item.address
        } else {
          this.networkConfigs.push(item)
        }
      })
    },
    addNetCard() {
      this.netCatdData = {
        dialog: true,
        title: '新增',
        hostId: this.detail.hostId,
        id: this.detail.id,
        poolGroupId: this.detail.poolGroupId,
        data: {
          operation: 'ADD'
        }
      }
    },
    modifyNetCard(data) {
      this.netCatdData = {
        dialog: true,
        title: '编辑',
        hostId: this.detail.hostId,
        id: this.detail.id,
        poolGroupId: this.detail.poolGroupId,
        data: Object.assign(data, { operation: 'EDIT' })
      }
    },
    formatNetworks(data) {
      const toObjFormat = function (obj) {
        for (const a in obj) {
          if (obj[a] === '') delete obj[a]
        }
        return obj
      }
      const arr = []
      const obj = toObjFormat({
        name: data.name,
        type: data.type,
        portType: data.portType,
        mac: data.mac,
        label: data.label,
        operation: 'REMOVE',
        ipId: data.ipId,
        address: data.address,
        ciscoSubnetId: data.ciscoSubnetId,
        disLabel: data.disLabel
      })
      if (data.type == undefined) {
        delete data.type
      }
      arr.push(obj)
      return arr
    },
    removeNetCard(data) {
      if (this.networkConfigs.length == 1) return this.$message.error('云主机需保留至少一块网卡')
      this.$confirm('确定要删除该网卡吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        modifyVm({ id: this.detail.id, operations: this.formatNetworks(data) }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.$emit('back', this.detail.id)
          }
        })
      })
    },
    upgradeSpec() {
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.upgradeDialog = {
        visible: true,
        data: {
          ...this.detail,
          service: 'vmware.standard.server',
          preview: [
            { label: '云主机名称', value: name },
            { label: '原规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(item => item.address).join('、') || '--' }
          ]
        }
      }
    },
    setVolumeLength(data) {
      this.volumeLength = data
    },
    addDisk() {
      const detail = this.detail
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.addDiskData = {
        visible: true,
        length: this.volumeLength,
        data: {
          ...detail,
          service: 'vmware.standard.server',
          params: {
            serviceCode: 'vmware.storage.disk',
            osCategory: detail.osCategory,
            type: detail.vendorType
          },
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(item => item.address || item.ipAddress).join('、') || '--' }
          ]
        }
      }
    },
    removeVolume(data) {
      this.$confirm('确定要删除该硬盘吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchDisk({
          action: 'delete',
          serverId: this.detail.id,
          diskNames: [data.name]
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            if (this.$refs.volume) this.$refs.volume.getList()
          }
        })
      })
    },
    hotEnable() {
      vmHotConfigEnable({
        serverId: this.detail.id,
        cpuHotEnable: this.detail.cpuHotEnable,
        memHotEnable: this.detail.memHotEnable
      }).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.$emit('back', this.detail.id)
        }
      })
    },
    cloneVm() {
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.cloneData = {
        dialog: true,
        data: {
          instance: this.detail.uuid,
          name: '',
          poolGroupId: this.detail.poolGroupId,
          templateId: this.detail.id,
          vendorId: this.detail.vendorId,
          networkCards: this.detail.netcards.map(({ id }) => ({
            addresses: [],
            checkIpv6: false,
            ipPolicy: 'Auto',
            ipPoolId: '',
            ipv6Addresses: [],
            ipv6Policy: 'Auto',
            ipv6PoolId: '',
            networkPoolId: '',
            portGroupId: '',
            networkCardId: id,
            ipPoolList: [],
            loading: false,
            freezeIps: [],
            showIps: []
          })),
          isAddShterm: false,
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(item => item.address || item.ipAddress).join('、') || '--' }
          ]
        }
      }
    },
    modifyVmPas() {
      this.modifyPasData = {
        dialog: true,
        data: {
          id: this.detail.id
        }
      }
    },
    dilatation(data) {
      const detail = this.detail
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.dilatationData = {
        visible: true,
        id: data.id,
        instanceId: data.uuid,
        data: {
          id: detail.id,
          name: detail.name,
          uuid: detail.uuid,
          expiredTime: detail.expiredTime,
          volumeId: data.id,
          service: 'vmware.standard.server',
          params: { osCategory: detail.osCategory, type: detail.vendorType, serviceCode: 'vmware.storage.disk' },
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(item => item.address || item.ipAddress).join('、') || '--' }
          ]
        }
      }
    },
    vmCloneToTemplate() {
      this.cloneToTemplateData = {
        dialog: true,
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId
        }
      }
    },
    // 迁移VM
    migrateVm() {
      this.migrateData = {
        dialog: true,
        data: {
          id: this.detail.id,
          oldHostId: this.detail.hostId,
          vendorId: this.detail.vendorId,
          hostId: '',
          storeId: ''
        }
      }
    },
    // 挂载VMTOOLS
    mountToolsInstaller() {
      vmVmtools('mountToolsInstaller', {
        id: this.detail.id,
        options: ''
      }).then(data => {
        if (data.success) {
          this.$message.success(data.message)
        }
      })
    },
    unmounttoolsinstaller() {
      vmVmtools('unmounttoolsinstaller', {
        id: this.detail.id
      }).then(data => {
        if (data.success) {
          this.$message.success(data.message)
        }
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('resource') > -1) {
        this.$emit('back', this.detail.id)
      }
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('snapshot') > -1) {
        this.$refs.snapshot.getSnapshot()
      }
    },
    resize(e) {
      this.height = document.documentElement.clientHeight - 162
    },
    goBack() {
      this.$emit('goBack')
    },
    // 操作
    // 升级vmtools
    updeteVmTools() {
      this.updeteToolsData = {
        dialog: true,
        data: {
          id: this.detail.id,
          type: false
        }
      }
    },
    autoVmtools() {
      detailVm(this.detail.id).then(data => {
        if (data.success) {
          const array = ['id', 'status', 'powerOffType', 'resetType', 'suspendType', 'afterPowerOn', 'afterResume', 'beforeGuestShutdown', 'beforeGuestStandby', 'syncTimeWithHost', 'toolsUpgradePolicy']
          const config = data.data.toolsConfig ? JSON.parse(data.data.toolsConfig) : { power: {}, tools: {} }
          const obj = Object.assign(config.power, config.tools, data.data)
          const obj1 = {}
          array.forEach(item => {
            obj1[item] = obj[item]
          })
          const flag = true
          const flag1 = false
          obj1.toolsUpgradePolicy = obj1.toolsUpgradePolicy === 'upgradeAtPowerCycle' ? flag : flag1
          obj1.status = obj1.status === 'STOPPED' ? flag1 : flag
          this.autoVmtoolsData = {
            dialog: true,
            data: obj1
          }
        }
      })
    },
    // 控制台
    goWebConsole() {
      getVmTickets({ id: this.detail.id }).then(data => {
        if (data.success) {
          data.data.id = this.detail.id
          sessionStorage.setItem('console', JSON.stringify(data.data))
          window.open('/web-common-resource/terminal/vmks/terminal.html')
        }
      })
    },
    goVmrc() {
      this.$confirm('请确保您已安装VMware-VMRC客户端，否则将无法使用该功能，若已安装，请忽略此提示?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          getVcConsole(this.detail.id, {
            action: 'vc',
            params: JSON.stringify({ id: this.detail.id })
          }).then(data => {
            if (data.success) {
              location.href = data.data
            }
          })
        })
        .catch(() => {})
    },
    // 开关机等操作
    patchVm(action, value) {
      this.$confirm('此操作将' + value + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchVmId(action, { id: this.detail.id }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.$emit('back', this.detail.id)
          }
        })
      })
    },
    // 转为模板
    toTemplate() {
      this.$confirm('确定要转为模板吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        createVmTemplate({ id: this.detail.id }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.$emit('back', this.detail.id)
            sessionStorage.setItem('platformId', this.platformObject.vmwareId)
          }
        })
      })
    },
    // 新增快照
    createSnapshot() {
      this.addSnapshotData = {
        dialog: true,
        data: {
          id: this.detail.vendorId,
          serverId: this.detail.id,
          way: 'immediately'
        }
      }
    }
  }
}
</script>
<style lang="scss"></style>
