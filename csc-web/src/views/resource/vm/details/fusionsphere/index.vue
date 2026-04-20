<template>
  <common-detail :data="detail" :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header">
        <header-content :detail="detail" :ip="netcardList.length ? netcardList[0].ipAddress : ''"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button :disabled="detail.disStart || detail.disabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button :disabled="detail.disStop || detail.disabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button :disabled="detail.disRestart || detail.disabled" size="medium" @click="patchVm('restart', '重启')">重启</el-button>
            <el-button :disabled="detail.disSuspended || detail.disabled" size="medium" v-if="!detail.tenantId" @click="patchVm('hibernated', '休眠')">休眠</el-button>
            <!-- <el-button :disabled="detail.disClone || detail.disabled || detail.tenantFlag" size="medium" @click="cloneVm(detail)">克隆</el-button> -->
            <!-- <el-button :disabled="detail.disMig || detail.disabled" size="medium" @click="migrateVm">迁移</el-button> -->
            <el-button v-if="detail.cdRomStatus == 'empty'" :disabled="detail.isCdrom" size="medium" @click="attachCdrom()">挂载光驱</el-button>
            <el-button v-else size="medium" :disabled="detail.isCdrom" @click="detachCdrom()">卸载光驱</el-button>
            <el-button :disabled="detail.status != 'STOPPED'" size="medium" @click="upgradeSpec">配置变更</el-button>
            <!-- <el-button :disabled="!detail.toolsRunning || detail.status != 'RUNNING'" size="medium" @click="modifyVmPas" v-if="detail.vendorType!='FUSIONSPHERE'">修改密码</el-button> -->
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
                    <div class="label_txt">CPU</div>
                    <div class="label_input" :title="detail.cpu">
                      {{ detail.cpu }}C
                      <div style="clear: both"></div>
                    </div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">内存</div>
                    <div class="label_input" :title="detail.memory">
                      {{ detail.memory }}GB
                      <div style="clear: both"></div>
                    </div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">磁盘</div>
                    <div class="label_val" :title="detail.disk">{{ detail.disk }}GB</div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">主机名称</div>
                    <div class="label_val" :title="detail.hostName">
                      {{ detail.hostName }}
                    </div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">主机IP</div>
                    <div class="label_val" :title="detail.hostIp">
                      {{ detail.hostIp }}
                    </div>
                  </div>
                </detailMsg>
              </el-col>
              <el-col :span="24">
                <el-card :body-style="{ padding: 0 }">
                  <div slot="header">配置信息</div>
                  <div class="textBox" style="position: relative">
                    <div class="label_txt">VMTOOL</div>
                    <div class="label_input" style="position: absolute">
                      <div class="pull-left m-t">
                        {{ (detail.toolsInstalled ? (detail.toolsRunning ? '运行中' : '未运行') : '未安装') + (detail.toolsExpired ? '(已过期)' : '') }}
                      </div>
                      <div class="pull-right m-t">
                        <el-dropdown>
                          <span class="el-dropdown-link" style="display: inline-block; width: 100px"> 操作 </span>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item v-if="detail.status == 'RUNNING'" :disabled="detail.toolsInstalled" @click.native="mountToolsInstaller">挂载VMware Tools ISO</el-dropdown-item>
                            <el-dropdown-item v-if="detail.status == 'RUNNING'" :disabled="!detail.toolsInstalled" @click.native="unmounttoolsinstaller">卸载VMware Tools ISO</el-dropdown-item>
                            <!-- <el-dropdown-item v-if="detail.status == 'RUNNING'" @click.native="updeteVmTools">手动升级VMware Tools</el-dropdown-item>
                            <el-dropdown-item @click.native="autoVmtools">自动升级VMware Tools</el-dropdown-item> -->
                          </el-dropdown-menu>
                        </el-dropdown>
                      </div>
                    </div>
                  </div>
                </el-card>
                <el-card class="m-t" :body-style="{ padding: 0 }">
                  <div slot="header" class="clearfix">
                    <span>网络配置</span>
                    <div class="pull-right">
                      <el-button class="add-btn" type="text" @click="addNetCard">新增</el-button>
                    </div>
                  </div>
                  <basic-table :data="netcardList" :params="paramsNetcard" :total="totalNetcard" :get-list="getNetcardsList" style="margin: 10px">
                    <el-table-column prop="name" label="网卡名称" show-overflow-tooltip> </el-table-column>
                    <!-- <el-table-column prop="portGroupName" label="端口组" show-overflow-tooltip> </el-table-column>
                    <el-table-column prop="switcherName" label="所属分布式交换机" show-overflow-tooltip> </el-table-column> -->
                    <el-table-column prop="mac" label="MAC" show-overflow-tooltip> </el-table-column>
                    <el-table-column prop="ipAddress" label="IP" show-overflow-tooltip></el-table-column>
                    <el-table-column label="操作" show-overflow-tooltip width="140px">
                      <template slot-scope="scope">
                        <el-button type="text" @click="removeNetCard(scope.row.id)">删除</el-button>
                        <el-button type="text" :disabled="!scope.row.enableSecurityGroup" @click="configGroup(scope.row)">配置安全组</el-button>
                      </template>
                    </el-table-column>
                  </basic-table>
                </el-card>
                <volume ref="volume" :detail="detail" @back="setVolumeLength">
                  <div class="pull-right" slot="operate">
                    <el-button class="add-btn" type="text" @click="dilatation">挂载</el-button>
                  </div>
                  <el-table-column label="操作" show-overflow-tooltip slot="el-table-column">
                    <template slot-scope="scope">
                      <el-button type="text" v-if="scope.row.status == 'IN_USE'" @click="unDilatation(scope.row)" :disabled="scope.row.bootVolume">卸载</el-button>
                      <el-button type="text" @click="modifyCapacity(scope.row)">扩容</el-button>
                      <!-- <el-button type="text" @click="removeVolume(scope.row)" :disabled="scope.row.bootVolume">删除</el-button> -->
                    </template>
                  </el-table-column>
                </volume>
                <snapshot :detail="detail" ref="snapshot">
                  <div slot="operate" class="pull-right add-btn">
                    <el-button type="text" :disabled="detail.disSnap || detail.disabled || detail.tenantFlag" @click="createSnapshot">创建快照</el-button>
                  </div>
                </snapshot>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="operate">
            <res :detail="detail" v-if="active === 'operate'"></res>
          </el-tab-pane>
          <el-tab-pane label="性能监控" name="monitor" style="padding: 10px">
            <!-- <monitor v-if="active == 'monitor'" :detail-id="detail.id" :identifier="detail.name" :host-name="detail.hostName" :bios-uuid="detail.biosUuid" :is-show="false"></monitor> -->
            <monitor v-if="active == 'monitor'" :detailData="detail" target="vm"></monitor>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <add-snapshot :add-data="addSnapshotData" v-if="addSnapshotData.dialog"></add-snapshot>
      <updete-tools :add-data="updeteToolsData" v-if="updeteToolsData.dialog"></updete-tools>
      <auto-tools :add-data="autoVmtoolsData" v-if="autoVmtoolsData.dialog"></auto-tools>
      <modify-pas :add-data="modifyPasData" v-if="modifyPasData.dialog"></modify-pas>
      <dilatation :add-data="dilatationData" v-if="dilatationData.dialog"></dilatation>
      <clone-to-template :add-data="cloneToTemplateData" v-if="cloneToTemplateData.dialog"></clone-to-template>
      <migrate :add-data="migrate" v-if="migrate.dialog"></migrate>
      <netCard :add-data="netCatdData" :vendor-id="detail.vendorId" v-if="netCatdData.dialog" @back="getNetcardsList"></netCard>
      <config-sgroup :add-data="configSGroup" :vendor-id="detail.vendorId" v-if="configSGroup.dialog" @back="getNetcardsList"></config-sgroup>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
      <cdrom :add-data="cdromData" :vendor-id="detail.vendorId" v-if="cdromData.dialog" @back="$emit('back', this.detail.id)"></cdrom>
      <modify-capacity :config="capacityData" v-if="capacityData.visible" @back="$emit('back', this.detail.id)"></modify-capacity>
    </div>
  </common-detail>
</template>

<script>
import { detailHost, createVmTemplate, detailVm, vmVmtools, getVcConsole, getVmTickets, vmHotConfigEnable, getRes, getVolume, getVmConsole, patchVmId, patchVolume } from 'services/platform/index'
import { getNics, removeNics, operateCdrom } from 'services/platform/fc'
import webSocket from '@/common/mixins/webSocket'
import detailMsg from '../components/detailMsg.vue'
import volume from '../components/volume.vue'
import modifyCapacity from './dialog/modifyCapacity.vue'
import snapshot from '../components/snapshot.vue'
import res from '../components/res.vue'
import addSnapshot from './dialog/addSnapshot.vue'
import migrate from './dialog/migrate.vue'
import updeteTools from './dialog/upGradeVmtools.vue'
import autoTools from './dialog/vmtoolsConfig.vue'
import modifyPas from './dialog/modifyPas.vue'
import dilatation from '../components/dilatation.vue'
import cloneToTemplate from './dialog/cloneToTemplate.vue'
import monitor from './dialog/monitor.vue'
import netCard from './dialog/netCard.vue'
import Upgrade from '../components/upgradeSpec.vue'
import configSgroup from './dialog/sgroup.vue'
import cdrom from './dialog/cdrom.vue'
import '../index.scss'
export default {
  components: { netCard, migrate, monitor, cloneToTemplate, dilatation, snapshot, volume, detailMsg, res, addSnapshot, updeteTools, autoTools, modifyPas, configSgroup, cdrom, Upgrade, modifyCapacity },
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
      migrate: {
        dialog: false,
        data: {}
      },
      updeteToolsData: {
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
        dialog: false,
        data: {}
      },
      cloneToTemplateData: {
        dialog: false,
        data: {}
      },
      netCatdData: {
        dialog: false,
        data: {}
      },
      cdromData: {
        dialog: false,
        data: {}
      },
      cloudDetail: {},
      netcardList: [],
      paramsNetcard: {
        page: 1,
        rows: 10
      },
      totalNetcard: 0,
      volumeLength: 0,
      upgradeDialog: {
        visible: false,
        data: {}
      },
      configSGroup: {
        dialog: false,
        data: {}
      },
      capacityData: {
        visible: false,
        data: {}
      },
      configFlag: false
    }
  },
  watch: {
    detail() {
      this.getNetcardsList()
      if (this.$refs.volume) this.$refs.volume.getList()
      if (this.detail.hostId) {
        detailHost(this.detail.hostId, 'Vmware').then(data => {
          if (data.success) {
            this.$set(this.detail, 'hostIp', data.data.serviceIp)
          }
        })
      }
    }
  },
  created() {
    this.getNetcardsList()
    if (this.detail.hostId) {
      detailHost(this.detail.hostId, 'Vmware').then(data => {
        if (data.success) {
          this.$set(this.detail, 'hostIp', data.data.serviceIp)
        }
      })
    }
  },
  methods: {
    modifyCapacity(data) {
      const detail = this.detail
      this.capacityData = {
        visible: true,
        id: data.id,
        instanceId: data.uuid,
        data: { ...detail, volumeId: data.id, service: 'fusionsphere.standard.server' }
      }
    },
    upgradeSpec() {
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.upgradeDialog = {
        visible: true,
        data: {
          ...this.detail,
          flavorId: '', // 暂时不做回显
          service: 'fusionsphere.standard.server',
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
    attachCdrom() {
      this.cdromData = {
        dialog: true,
        data: {
          vmId: this.detail.id,
          protocol: 'file',
          devicePath: ''
        }
      }
    },
    detachCdrom() {
      this.$confirm('确定要卸载光驱吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        operateCdrom('detach', {
          vmId: this.detail.id
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
    getNetcardsList() {
      this.paramsNetcard.params = this.$tools.handleSearchParam({
        serverId: this.detail.id
      })
      getNics(this.paramsNetcard).then(data => {
        if (data.success) {
          this.netcardList = data.data.rows
          this.totalNetcard = data.data.total
        }
      })
    },
    addNetCard() {
      this.netCatdData = {
        dialog: true,
        title: '新增网卡',
        cpu: this.detail.cpu,
        data: {
          serverId: this.detail.id,
          hostId: this.detail.hostId,
          vendorId: this.detail.vendorId,
          type: '1',
          switcherId: '',
          portGroupId: '',
          vringbuf: 256,
          queues: 1,
          enableSecurityGroup: false,
          securityGroupId: ''
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
    removeNetCard(id) {
      if (this.netcardList.length == 1) return this.$message.error('云主机需保留至少一块网卡')
      this.$confirm('确定要删除该网卡吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeNics(id).then(data => {
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
    configGroup(data) {
      this.configSGroup = {
        dialog: true,
        data: {
          serverId: this.detail.id,
          networkCardId: data.id,
          groupId: data.securityGroupId
        }
      }
      this.configFlag = true
    },
    setVolumeLength(data) {
      this.volumeLength = data
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
    cloneVm(data) {
      this.$router.push({ name: 'FusionSphereVmClone', params: { id: data.id + '#' + data.name, vendorId: data.vendorId } })
    },
    modifyVmPas() {
      this.modifyPasData = {
        dialog: true,
        data: {
          id: this.detail.id
        }
      }
    },
    dilatation() {
      this.dilatationData = {
        dialog: true,
        isNeedvolumeId: true,
        vendorId: this.detail.vendorId,
        data: {
          id: this.detail.id,
          accessMode: 0,
          pciType: 'VIRTIO',
          ioMode: 'dataplane'
        }
      }
    },
    unDilatation(data) {
      const obj = {
        id: data.id
      }
      this.$confirm('请确定是否卸载?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          patchVolume('detach', obj).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              if (this.$refs.volume) this.$refs.volume.getList()
            }
          })
        })
        .catch(() => {})
    },
    // 迁移VM
    migrateVm() {
      this.migrate = {
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
        id: this.detail.id
      }).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.$emit('back', this.detail.id)
        }
      })
    },
    unmounttoolsinstaller() {
      vmVmtools('unmounttoolsinstaller', {
        id: this.detail.id
      }).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.$emit('back', this.detail.id)
        }
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('vm') > -1) {
        this.$emit('back', this.detail.id)
      }
      if (data.operate.indexOf('resource.computer') > -1) {
        this.$emit('back', this.detail.id)
      }
      if (data.operate.indexOf('fusionsphere.volume') > -1) {
        if (this.$refs.volume) this.$refs.volume.getList()
      }
      if (data.operate.indexOf('fusionsphere.snapshot') > -1) {
        this.$refs.snapshot.getSnapshot()
      }
      if (data.operate.indexOf('fusionsphere.networkcard') > -1) {
        this.getNetcardsList()
      }
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
          snapshotType: 'NORMAL',
          needMemoryShot: false,
          isConsistent: false
        }
      }
    }
  }
}
</script>
<style lang="scss"></style>
