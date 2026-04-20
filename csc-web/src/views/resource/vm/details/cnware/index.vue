<template>
  <common-detail :data="detail" :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header">
        <header-content :detail="detail" :ip="networkConfigs.length ? networkConfigs[0].address : ''"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button :disabled="detail.disStart || detail.allDisabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button :disabled="detail.disStop || detail.allDisabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button :disabled="detail.disStop || detail.allDisabled" size="medium" @click="openConsole">控制台</el-button>
            <el-button :disabled="detail.disRestart || detail.allDisabled" size="medium" @click="patchVm('softrestart', '重启')">重启</el-button>
            <el-button :disabled="detail.disRestart || detail.allDisabled" size="medium" @click="patchVm('restart', '强制重启')">强制重启</el-button>
            <el-button :disabled="detail.disSuspended || detail.allDisabled" size="medium" @click="patchVm('suspend', '挂起')">挂起</el-button>
            <el-button :disabled="detail.disStart || detail.disStop || detail.allDisabled" size="medium" @click="patchVm('resume', '恢复')">恢复</el-button>
            <el-button :disabled="detail.disSuspended || detail.allDisabled" size="medium" @click="patchVm('pause', '休眠')">休眠</el-button>
            <!-- <el-button :disabled="detail.allDisabled" size="medium" @click="clone">克隆</el-button> -->
            <el-button :disabled="(detail.disControl && detail.status != 'STOPPED') || detail.isExpired || detail.allDisabled" size="medium" @click="upgradeSpec">配置变更</el-button>
          </el-col>
        </el-row>
        <div style="clear: both"></div>
      </div>
      <el-row class="detail-body-body" style="padding: 0 10px 0 10px">
        <el-tabs v-model="active">
          <el-tab-pane label="详细信息" name="detail">
            <el-row :gutter="20">
              <el-col :span="24">
                <detailMsg @back="$emit('back', detail.id)" :detail="detail"> </detailMsg>
              </el-col>
              <el-col :span="24">
                <el-card :body-style="{ padding: 0 }" class="m-t">
                  <div slot="header" class="clearfix">
                    <span>网络配置</span>
                    <div class="pull-right">
                      <el-button class="add-btn" type="text" @click="addNetCard">新增</el-button>
                    </div>
                  </div>
                  <basic-table :data="networkConfigs" border style="margin: 10px">
                    <el-table-column prop="switcher" label="虚拟交换机名称"> </el-table-column>
                    <el-table-column prop="portGroupName" label="端口组名称"></el-table-column>
                    <el-table-column prop="mac" label="MAC地址"> </el-table-column>
                    <el-table-column prop="address" label="IP地址"></el-table-column>
                    <el-table-column label="操作" show-overflow-tooltip width="100px">
                      <template slot-scope="scope">
                        <el-button type="text" @click="removeNetCard(scope.row)">删除</el-button>
                      </template>
                    </el-table-column>
                    <div slot="pagination"></div>
                  </basic-table>
                </el-card>
                <volume ref="volume" :detail="detail" @back="setVolumeLength">
                  <div class="pull-right" slot="operate">
                    <!-- <el-button class="add-btn" type="text" @click="mountDisk">挂载</el-button> -->
                    <el-button class="add-btn" type="text" @click="addDisk">新增</el-button>
                  </div>
                  <el-table-column label="操作" show-overflow-tooltip slot="el-table-column" width="100px">
                    <template slot-scope="scope">
                      <el-button type="text" :disabled="detail.disControl || detail.isExpired || detail.allDisabled || scope.row.bootVolume" @click="dilatation(scope.row)">扩容</el-button>
                    </template>
                  </el-table-column>
                </volume>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="operate">
            <res :detail="detail"></res>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <add-snapshot :add-data="addSnapshotData" v-if="addSnapshotData.dialog"></add-snapshot>
      <auto-tools :add-data="autoVmtoolsData" v-if="autoVmtoolsData.dialog"></auto-tools>
      <clone-to-template :add-data="cloneToTemplateData" v-if="cloneToTemplateData.dialog" @goBack="goBack"></clone-to-template>
      <dilatation :config="dilatationData" v-if="dilatationData.visible"></dilatation>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
      <netCard :add-data="netCatdData" v-if="netCatdData.dialog"></netCard>
      <AddDisk @back="$refs.volume.getList()" :config="addDiskData" v-if="addDiskData.visible"></AddDisk>
      <mount-disk @back="$refs.volume.getList()" :add-data="mountDiskData" v-if="mountDiskData.dialog"></mount-disk>
    </div>
  </common-detail>
</template>

<script>
import { getVmConsole, modifyVm, patchDisk, detailHost, getVcConsole, getVmTickets, patchVmId, createVmTemplate } from 'services/platform/index'
import webSocket from '@/common/mixins/webSocket'
import detailMsg from '../components/detailMsg.vue'
import headerContent from '../components/header.vue'
import volume from '../components/volume.vue'
import res from '../components/res'
import addSnapshot from './dialog/addSnapshot'
import '../index.scss'
import cloneToTemplate from './dialog/cloneToTemplate.vue'
import Upgrade from '../components/upgradeSpec.vue'
import netCard from './dialog/netCard.vue'
import AddDisk from '../components/addDisk.vue'
import mountDisk from './dialog/mountDisk.vue'
import dilatation from '../components/dilatation.vue'
export default {
  components: {
    volume,
    detailMsg,
    headerContent,
    res,
    addSnapshot,
    cloneToTemplate,
    Upgrade,
    netCard,
    AddDisk,
    mountDisk,
    dilatation
  },
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
      autoVmtoolsData: {
        dialog: false,
        data: {}
      },
      addSnapshotData: {
        dialog: false,
        data: {}
      },
      cloudDetail: {},
      networkConfigs: [],
      volumeLength: 0,
      cloneToTemplateData: {
        dialog: false,
        data: {}
      },
      upgradeDialog: {
        visible: false,
        data: {}
      },
      netCatdData: {
        dialog: false,
        data: {}
      },
      addDiskData: {
        visible: false,
        data: {}
      },
      mountDiskData: {
        dialog: false,
        data: {}
      },
      dilatationData: {
        visible: false
      }
    }
  },
  watch: {
    detail() {
      this.setNetcards()
      if (this.$refs.volume) this.$refs.volume.getList()
      detailHost(this.detail.hostId).then(data => {
        if (data.success) {
          this.$set(this.detail, 'hostIp', data.data.manageIp)
        }
      })
    }
  },
  created() {
    this.setNetcards()
    detailHost(this.detail.hostId).then(data => {
      if (data.success) {
        this.$set(this.detail, 'hostIp', data.data.manageIp)
      }
    })
  },
  methods: {
    clone() {
      this.$router.push({
        name: 'CNwareVmClone',
        params: {
          vid: this.detail.vendorId,
          sid: this.detail.id,
          hid: this.detail.hostId
        }
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('resource') > -1) {
        this.$emit('back', this.detail.id)
      }
    },
    setNetcards() {
      this.networkConfigs = this.detail.netcards
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
    setVolumeLength(data) {
      this.volumeLength = data
    },
    mountDisk() {
      this.mountDiskData = {
        dialog: true,
        data: {
          vendorId: this.detail.vendorId,
          serverId: this.detail.id,
          hostId: this.detail.hostId
        }
      }
    },
    addDisk() {
      const detail = this.detail
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.addDiskData = {
        visible: true,
        length: this.volumeLength,
        data: {
          ...detail,
          service: 'cnware.standard.server',
          params: {
            serviceCode: 'cnware.standard.volume',
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
    openConsole() {
      const newWindow = window.open()
      getVmConsole(this.detail.id, {
        serverId: this.detail.instanceId
      }).then(data => {
        if (data.success) {
          newWindow.location.href = data.data
        } else {
          newWindow.close()
        }
      })
    },
    removeVolume(data) {
      this.$confirm('你确定删除此硬盘吗？', '提示', {
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
    goBack() {
      this.$emit('goBack')
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
            params: JSON.stringify({
              id: this.detail.id
            })
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
        patchVmId(action, {
          id: this.detail.id
        }).then(data => {
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
    vmCloneToTemplate() {
      this.cloneToTemplateData = {
        dialog: true,
        action: 'cloneAsTemplate',
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId,
          hostId: this.detail.hostId,
          storageType: 2
        }
      }
    },
    // 转为模板
    toTemplate() {
      this.cloneToTemplateData = {
        dialog: true,
        action: 'convertAsTemplate',
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId,
          hostId: this.detail.hostId,
          storageType: 2
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
          service: 'cnware.standard.server',
          params: { osCategory: detail.osCategory, type: detail.vendorType, serviceCode: 'cnware.standard.volume' },
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(item => item.address || item.ipAddress).join('、') || '--' }
          ]
        }
      }
    },
    upgradeSpec() {
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.upgradeDialog = {
        visible: true,
        data: {
          ...this.detail,
          flavorId: '', // 暂时不做回显
          service: 'cnware.standard.server',
          // 用来获取规格接口传参
          params: {},
          preview: [
            { label: '云主机名称', value: name },
            { label: '原规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList?.map(item => item.address || item.ipAddress).join('、') || '--' }
          ]
        }
      }
    },
    addNetCard() {
      this.netCatdData = {
        dialog: true,
        title: '新增网络适配器',
        hostId: this.detail.hostId,
        id: this.detail.id,
        data: {
          netCardType: 1,
          operation: 'ADD'
        }
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
        id: data.id,
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
      if (this.networkConfigs.length == 1) return this.$message.error('虚拟机需保留至少一块网卡')
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
    }
  }
}
</script>

<style lang="scss"></style>
