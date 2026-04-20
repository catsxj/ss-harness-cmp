<template>
  <common-detail :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header">
        <header-content :detail="detail" :ip="detail.managerIp"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button :disabled="detail.status == 'STOPPED'" size="medium" @click="goWebConsole">控制台</el-button>
            <!-- <el-button v-else :disabled="detail.status != 'RUNNING' || detail.disabled" size="medium" @click="goVmrc">控制台</el-button> -->
            <el-button :disabled="detail.disStart || detail.disabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button :disabled="detail.disStop || detail.disabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button :disabled="detail.disRestart || detail.disabled" size="medium" @click="patchVm('restart', '重启')">重启</el-button>
            <el-button :disabled="detail.disStop || detail.disabled" size="medium" @click="patchVm('softstop', '软关机')">软关机</el-button>
            <el-button :disabled="detail.disRestart || detail.disabled" size="medium" @click="patchVm('softrestart', '软重启')">软重启</el-button>
            <el-button :disabled="detail.disSuspended || detail.disabled" size="medium" @click="patchVm('pause', '暂停')">暂停</el-button>
            <el-button :disabled="detail.status != 'PAUSED'" size="medium" @click="patchVm('recovery', '恢复')">恢复</el-button>
            <!-- <el-button :disabled="detail.disClone || detail.disabled || detail.tenantFlag" size="medium" @click="cloneVm(detail)">克隆</el-button> -->
            <!-- <el-dropdown style="margin-left: 10px">
              <el-button size="medium"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="upgradeSpec">配置变更</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown> -->
          </el-col>
        </el-row>
        <div style="clear: both"></div>
      </div>
      <el-divider></el-divider>
      <!-- <hr /> -->
      <el-row class="detail-body-body" style="padding: 0 10px 0 10px">
        <el-tabs v-model="active">
          <el-tab-pane label="详细信息" name="detail">
            <el-row :gutter="5">
              <el-col :span="24">
                <detailMsg @back="$emit('back', detail.id)" :detail="detail">
                  <div class="textBox">
                    <div class="label_txt">主机名称</div>
                    <div class="label_val" :title="detail.hostName">
                      <!-- <a style="color: #409eff" :href="'https://' + detail.hostName" target="_blank"> -->
                      {{ detail.hostName }}
                      <!-- </a> -->
                    </div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">主机IP</div>
                    <div class="label_val" :title="detail.hostIp">
                      <!-- <a style="color: #409eff" :href="'https://' + detail.hostIp" target="_blank"> -->
                      {{ detail.hostIp }}
                      <!-- </a> -->
                    </div>
                  </div>
                </detailMsg>
              </el-col>
              <el-col :span="24">
                <el-card :body-style="{ padding: 0 }">
                  <div slot="header" class="clearfix">
                    <span>网络配置</span>
                    <div class="pull-right">
                      <el-button class="add-btn" type="text" @click="addNetCard">新增</el-button>
                    </div>
                  </div>
                  <el-table :data="networkConfigs" style="width: 100%">
                    <el-table-column prop="label" label="网卡名称" show-overflow-tooltip> </el-table-column>
                    <el-table-column prop="mac" label="MAC地址" show-overflow-tooltip> </el-table-column>
                    <el-table-column prop="name" label="所属网络" show-overflow-tooltip></el-table-column>
                    <el-table-column prop="ip" label="IP地址" show-overflow-tooltip></el-table-column>
                    <el-table-column label="操作" show-overflow-tooltip width="140px">
                      <template slot-scope="scope">
                        <el-button type="text" @click="removeNetCard(scope.row)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
                <volume ref="volume" :detail="detail">
                  <div class="pull-right" slot="operate">
                    <!-- <el-button class="add-btn" type="text" @click="addNewDisk">新增虚拟卷</el-button> -->
                    <el-button class="add-btn" type="text" @click="addMountDisk">挂载虚拟卷</el-button>
                  </div>
                  <el-table-column label="操作" show-overflow-tooltip slot="el-table-column" width="100px">
                    <template slot-scope="scope">
                      <el-button type="text" @click="removeVolume(scope.row)" :disabled="scope.row.bootVolume">删除</el-button>
                    </template>
                  </el-table-column>
                </volume>
                <iso ref="iso" :detail="detail">
                  <div class="pull-right" slot="operate">
                    <el-button class="add-btn" type="text" @click="addMountISO">挂载CD-ROM</el-button>
                  </div>
                  <el-table-column label="操作" show-overflow-tooltip slot="el-table-column" width="100px">
                    <template slot-scope="scope">
                      <el-button type="text" @click="removeISO(scope.row.id)">删除</el-button>
                    </template>
                  </el-table-column>
                </iso>
                <snapshot :detail="detail">
                  <div slot="operate" class="pull-right add-btn">
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
          <el-tab-pane label="监控" name="monitor">
            <monitor :detail-id="detail.id" :instanceId="detail.instanceId" v-if="active === 'monitor'"></monitor>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <add-snapshot :add-data="addSnapshotData" v-if="addSnapshotData.dialog"></add-snapshot>
      <AddDisk @back="$refs.volume.getList()" :add-data="addDiskData" v-if="addDiskData.newdialog"></AddDisk>
      <mount-disk @back="$refs.volume.getList()" :add-data="addDiskData" v-if="addDiskData.diskdialog"></mount-disk>
      <mount-iso @back="$refs.volume.getList()" :add-data="addDiskData" v-if="addDiskData.isodialog"></mount-iso>
      <netCard :add-data="netCatdData" :poolGroupId="detail.poolGroupId" v-if="netCatdData.dialog"></netCard>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
    </div>
  </common-detail>
</template>

<script>
import { detailHost, modifyVm, patchDisk, createVmTemplate, detailVm, vmVmtools, getVcConsole, getVmConsole, patchVmId, patchSnapshot } from 'services/platform/index'
import webSocket from '@/common/mixins/webSocket'
import detailMsg from './detailMsg.vue'
import volume from './volume.vue'
import iso from './iso.vue'
import snapshot from '../components/snapshot.vue'
import res from '../components/res.vue'
import addSnapshot from './dialog/addSnapshot.vue'
import AddDisk from '../components/addDisk.vue'
import mountDisk from './dialog/mountDisk.vue'
import mountIso from './dialog/mountISO.vue'
import netCard from './dialog/netCard.vue'
import Upgrade from '../components/upgradeSpec.vue'
import monitor from 'views/monitor/virtual/smartx/detail.vue'
import headerContent from '../components/header.vue'

import '../index.scss'
export default {
  components: { headerContent, Upgrade, netCard, AddDisk, mountDisk, mountIso, snapshot, volume, iso, detailMsg, res, addSnapshot, monitor },
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
      resetOsData: {
        dialog: false,
        data: {}
      },
      addGroupData: {
        dialog: false,
        data: {}
      },
      addSnapshotData: {
        dialog: false,
        data: {}
      },
      addDiskData: {
        dialog: false,
        data: {}
      },
      netCatdData: {
        dialog: false,
        data: {}
      },
      cloudDetail: {},
      networkConfigs: [],
      upgradeDialog: {
        visible: false,
        data: {}
      }
    }
  },
  watch: {
    detail() {
      this.setNetcards()
      if (this.$refs.volume) this.$refs.volume.getList()
      detailHost(this.detail.hostId, 'Vmware').then(data => {
        if (data.success) {
          this.$set(this.detail, 'hostIp', data.data.manageIp)
        }
      })
    }
  },
  created() {
    this.setNetcards()
    detailHost(this.detail.hostId, 'Vmware').then(data => {
      if (data.success) {
        this.$set(this.detail, 'hostIp', data.data.manageIp)
      }
    })
  },
  methods: {
    setNetcards() {
      this.networkConfigs = this.detail.netcards
      const ary = []
      this.detail.netcards.forEach(item => {
        item.ip = ''
        ary.push(item.mac)
      })
      this.detail.privateIpsList.forEach(item => {
        if (ary.indexOf(item.mac) > -1 && this.networkConfigs[ary.indexOf(item.mac)].ip) {
          this.networkConfigs[ary.indexOf(item.mac)].ip = this.networkConfigs[ary.indexOf(item.mac)].ip + ',' + item.ip
        } else if (ary.indexOf(item.mac) > -1) {
          this.networkConfigs[ary.indexOf(item.mac)].ip = item.ip
        } else {
          this.networkConfigs.push(item)
        }
      })
    },
    addNetCard() {
      this.netCatdData = {
        dialog: true,
        title: '新增网络适配器',
        vendorId: this.detail.vendorId,
        id: this.detail.id,
        data: {
          operation: 'CREATE'
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
          service: 'smartx.standard.server',
          // 用来获取规格接口传参
          params: {},
          preview: [
            { label: '云主机名称', value: name },
            { label: '原规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(({ address }) => address).join('、') || '--' }
          ]
        }
      }
    },
    removeNetCard(data) {
      if (this.networkConfigs.length == 1) return this.$message.error('云主机需保留至少一块网卡')
      this.$confirm('确定要删除该网卡吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        modifyVm({ id: this.detail.id, operations: [{ networkCardId: data.id, operation: 'REMOVE' }] }).then(data => {
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
    addNewDisk() {
      this.addDiskData = {
        newdialog: true,
        vendorId: this.detail.vendorId,
        serverId: this.detail.id,
        data: {
          type: 'newDisk'
        }
      }
    },
    addMountDisk() {
      this.addDiskData = {
        diskdialog: true,
        vendorId: this.detail.vendorId,
        serverId: this.detail.id,
        data: {
          type: 'mountDisk',
          id: ''
        }
      }
    },
    addMountISO() {
      this.addDiskData = {
        isodialog: true,
        vendorId: this.detail.vendorId,
        serverId: this.detail.id,
        data: {
          type: 'mountISO',
          id: '',
          disabled: false
        }
      }
    },
    removeVolume(data) {
      let msg = '您现在执行的删除硬盘是一个高风险操作，该操作可能导致系统无法启动。请确认是否删除？'
      if (!data.multiattach) {
        msg = '当前云硬盘为非共享盘，执行卸载操作会删除当前云硬盘，确定执行卸载并删除该云硬盘吗？'
      }
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchDisk({
          action: 'delete',
          serverId: this.detail.id,
          diskIds: [data.id]
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
    removeISO(id) {
      this.$confirm('您确定要删除该ISO映像吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchDisk({
          action: 'deleteISO',
          serverId: this.detail.id,
          diskIds: [id]
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.$refs.iso.getList()
          }
        })
      })
    },
    cloneVm(data) {
      this.$router.push({ name: 'SmartVmClone', params: { id: data.id, vendorId: data.vendorId } })
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
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('server') > -1 || data.operate.indexOf('resource') > -1) {
        this.$emit('back', this.detail.id)
      }
      if (data.operate.indexOf('smartx.vm') > -1 && data.success && data.message.indexOf('转化为模板') > -1) {
        this.$emit('goBack')
      }
    },
    goBack() {
      this.$emit('goBack')
    },
    // 操作
    // 控制台
    goWebConsole() {
      getVmConsole(this.detail.id, { serverId: this.detail.instanceId }).then(data => {
        if (data.success) {
          data.data.id = this.detail.id
          localStorage.setItem('console', JSON.stringify(data.data))
          localStorage.setItem('access-token', data.data.token)
          window.open('/web-common-resource/terminal/smartxKs/terminal.html')
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
    backTemplate() {
      this.$emit('back', this.detail.id)
      sessionStorage.setItem('platformId', this.platformObject.vendorId)
    },
    // 新增快照
    createSnapshot() {
      this.addSnapshotData = {
        dialog: true,
        data: {
          id: this.detail.vendorId,
          serverId: this.detail.id
        }
      }
    }
  }
}
</script>
<style lang="scss"></style>
