<template>
  <common-detail :data="detail" :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header">
        <header-content :detail="detail" :ip="networkConfigs.length ? networkConfigs[0].address : ''"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button :disabled="detail.status != 'RUNNING' || detail.disabled" size="medium" @click="goWebConsole">控制台</el-button>
            <el-button type="ghost" v-if="detail.status !== 'RUNNING'" :disabled="detail.disStart || detail.disabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button type="ghost" v-else :disabled="detail.disStop || detail.disabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button type="ghost" :disabled="detail.disRestart || detail.disabled" size="medium" @click="patchVm('restart', '重启')">重启</el-button>
            <el-button type="ghost" :disabled="detail.disSuspended || detail.disabled" size="medium" @click="patchVm('suspend', '挂起')">挂起</el-button>
            <el-button :disabled="(detail.disControl && detail.status != 'STOPPED') || detail.isExpired || detail.allDisabled" size="medium" @click="upgradeSpec">配置变更</el-button>
          </el-col>
        </el-row>
        <div style="clear: both"></div>
      </div>
      <el-row class="detail-body-body" style="padding: 0 10px 0 10px">
        <el-tabs v-model="active">
          <el-tab-pane label="详细信息" name="detail">
            <el-row :gutter="5">
              <el-col :span="24">
                <el-card :body-style="{ padding: 0 }">
                  <div slot="header">
                    <span>基本信息</span>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">名称</div>
                    <div class="label_input">
                      <div :title="detail.name">
                        <span class="hidden-txt">
                          {{ detail.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="textBox" v-if="detail.detail && detail.detail.cfgstorage">
                    <div class="label_txt">存储位置</div>
                    <div class="label_val" :title="detail.detail.cfgstorage.name">
                      <span class="hidden-txt">
                        {{ detail.detail.cfgstorage.name }}
                      </span>
                    </div>
                  </div>
                  <div class="textBox" v-if="diskList.length">
                    <div class="label_txt">存储策略</div>
                    <div class="label_val" :title="diskList[0].diskPolicieName">
                      <span class="hidden-txt">
                        {{ diskList[0].diskPolicieName }}
                      </span>
                    </div>
                  </div>
                  <div class="textBox" v-if="detail.detail">
                    <div class="label_txt">运行位置</div>
                    <div class="label_val" :title="detail.detail.host_config">
                      <span class="hidden-txt">
                        {{ detail.detail.host_config }}
                      </span>
                    </div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">虚拟机性能优化工具</div>
                    <div class="label_val" :title="detail.toolsInstalled">
                      <span class="hidden-txt">
                        {{ detail.toolsInstalled ? '已安装' : '未安装' }}
                      </span>
                    </div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">操作系统</div>
                    <div class="label_val" :title="detail.osName">
                      <span class="hidden-txt">
                        {{ detail.osName }}
                      </span>
                    </div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">主机名</div>
                    <div class="label_val" :title="detail.hostName">
                      <a style="color: #409eff" :href="'https://' + detail.hostName" target="_blank">{{ detail.hostName }}</a>
                    </div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">备注</div>
                    <div class="label_input">
                      <div>
                        <span class="hidden-txt">
                          {{ detail.remark }}
                        </span>
                      </div>
                    </div>
                  </div>
                </el-card>
                <el-card class="m-t" :body-style="{ padding: 0 }">
                  <div slot="header">组织信息</div>
                  <div class="textBox">
                    <div class="label_txt">地域</div>
                    <div class="label_val">{{ detail.regionName || detail.region }}</div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">可用区</div>
                    <div class="label_val">{{ detail.zoneName || detail.zone }}</div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">租户</div>
                    <div class="label_val">{{ detail.tenantName }}</div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">创建者</div>
                    <div class="label_val">{{ detail.creatorName }}</div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">所有者</div>
                    <div class="label_val">{{ detail.ownerName }}</div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">运维者</div>
                    <div class="label_val">{{ detail.menderName }}</div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">{{ $store.getters.systemConfig.serviceConfigLabel }}</div>
                    <div class="label_val">{{ detail.businessName }}</div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">{{ $store.getters.systemConfig.projectConfigLabel }}</div>
                    <div class="label_val">{{ detail.projectName }}</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="24">
                <el-card :body-style="{ padding: 0 }" class="m-t">
                  <div slot="header">配置信息</div>
                  <div class="textBox">
                    <div class="label_txt">处理器</div>
                    <div class="label_input">{{ detail.cpu }}核</div>
                  </div>
                  <div class="textBox">
                    <div class="label_txt">内存</div>
                    <div class="label_input">{{ detail.memory }}GB</div>
                  </div>
                </el-card>
                <el-card :body-style="{ padding: 0 }" class="m-t">
                  <div slot="header">
                    <span>磁盘信息</span>
                    <div class="pull-right" slot="operate" v-if="detail.showBtn">
                      <el-button class="add-btn" type="text" @click="addDisk">新增</el-button>
                    </div>
                  </div>
                  <basic-table :data="diskList" style="margin: 10px">
                    <el-table-column prop="name" label="磁盘名称" show-overflow-tooltip> </el-table-column>
                    <el-table-column prop="size" label="磁盘大小(GB)" show-overflow-tooltip> </el-table-column>
                    <el-table-column prop="dataStoreName" label="存储" show-overflow-tooltip> </el-table-column>
                    <el-table-column prop="diskPolicieName" label="存储策略" show-overflow-tooltip> </el-table-column>
                    <el-table-column label="操作" show-overflow-tooltip width="100px" v-if="detail.showBtn">
                      <template slot-scope="scope">
                        <el-button type="text" :disabled="detail.disControl || detail.isExpired || detail.allDisabled || scope.row.bootVolume" @click="dilatation(scope.row)">扩容</el-button>
                      </template>
                    </el-table-column>
                    <div slot="pagination"></div>
                  </basic-table>
                </el-card>
                <el-card class="m-t" :body-style="{ padding: 0 }">
                  <div slot="header" class="clearfix">
                    <span>网络配置</span>
                    <div class="pull-right">
                      <el-button class="add-btn" type="text" @click="addNetCard">新增</el-button>
                    </div>
                  </div>
                  <basic-table :data="detail.sangforNetworks" style="margin: 10px">
                    <el-table-column prop="name" label="连接到" show-overflow-tooltip> </el-table-column>
                    <el-table-column prop="macAddress" label="MAC地址" show-overflow-tooltip> </el-table-column>
                    <el-table-column prop="model" label="网卡型号" show-overflow-tooltip></el-table-column>
                    <el-table-column prop="ipAddress" label="IP地址" show-overflow-tooltip></el-table-column>
                    <div slot="pagination"></div>
                  </basic-table>
                </el-card>
                <snapshot :detail="detail" ref="snapshot">
                  <div slot="operate" class="pull-right add-btn">
                    <el-button type="text" :disabled="detail.disSnap || detail.disabled || detail.tenantFlag" @click="createSnapshot">创建快照</el-button>
                    <el-button type="text" v-if="detail.hasSnapshotTask" @click="patchVm('cancelSnapshotTask', '取消定时快照')">取消定时快照</el-button>
                  </div>
                </snapshot>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="operate" v-if="false">
            <res :detail="detail" v-if="active === 'operate'"></res>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <add-snapshot :add-data="addSnapshotData" v-if="addSnapshotData.dialog"></add-snapshot>
      <clone :add-data="cloneData" v-if="cloneData.dialog"></clone>
      <updete-tools :add-data="updeteToolsData" v-if="updeteToolsData.dialog"></updete-tools>
      <auto-tools :add-data="autoVmtoolsData" v-if="autoVmtoolsData.dialog"></auto-tools>
      <modify-pas :add-data="modifyPasData" v-if="modifyPasData.dialog"></modify-pas>
      <AddDisk @back="$refs.volume.getList()" :config="addDiskData" v-if="addDiskData.visible"></AddDisk>
      <dilatation :config="dilatationData" v-if="dilatationData.visible" @back="$refs.volume.getList()"></dilatation>
      <clone-to-template :add-data="cloneToTemplateData" v-if="cloneToTemplateData.dialog"></clone-to-template>
      <migrate :add-data="migrate" v-if="migrate.dialog"></migrate>
      <netCard :add-data="netCatdData" v-if="netCatdData.dialog"></netCard>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
      <el-dialog append-to-body :title="'编辑' + modifyData.title" :visible.sync="modifyData.dialog">
        <basic-form ref="data" :model="modifyData.data" :status-icon="true" label-width="80px">
          <basic-form-item key="1" v-if="modifyData.title == '名称'" label="名称：" prop="name" validate="required">
            <el-input v-model="modifyData.data.name"></el-input>
          </basic-form-item>
          <basic-form-item v-else key="2" label="备注：" prop="remark">
            <el-input v-model="modifyData.data.remark" type="textarea"></el-input>
          </basic-form-item>
        </basic-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="modifyData.dialog = false">取 消</el-button>
          <el-button type="primary" @click="ok">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </common-detail>
</template>

<script>
import { detailHost, modifyVm, patchDisk, detailCloudVendor, createVmTemplate, detailVm, vmVmtools, getVcConsole, getVmVnc, vmHotConfigEnable, getRes, getVolume, getVmConsole, removeFloatIpPorts, patchVmId, patchVmResize, conditionVoleme } from 'services/platform/index'
import webSocket from '@/common/mixins/getGlobalSocket'
import detailMsg from '../components/detailMsg.vue'
import headerContent from '../components/header.vue'
import snapshot from '../components/snapshot.vue'
import res from '../components/res.vue'
import addSnapshot from './dialog/addSnapshot.vue'
import clone from './dialog/clone/index.vue'
import migrate from './dialog/migrate.vue'
import updeteTools from './dialog/upGradeVmtools.vue'
import autoTools from './dialog/vmtoolsConfig.vue'
import modifyPas from './dialog/modifyPas.vue'
import dilatation from '../components/dilatation.vue'
import cloneToTemplate from './dialog/cloneToTemplate.vue'
import AddDisk from '../components/addDisk.vue'
import netCard from './dialog/netCard.vue'
import Upgrade from '../components/upgradeSpec.vue'

import '../index.scss'
export default {
  components: { headerContent, Upgrade, netCard, migrate, AddDisk, cloneToTemplate, dilatation, snapshot, res, addSnapshot, clone, updeteTools, autoTools, modifyPas },
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  mixins: [webSocket],
  computed: {
    cpuData() {
      return this.detail.detail.cpu_status
    },
    memData() {
      return this.filterSize(this.detail.detail.mem_status.total, 'GB')
    },
    networkData() {
      const { hardware_status } = this.detail.detail
      return Object.values(hardware_status).map(item => {
        let type = null
        const list = item.split(',').map((item, index) => {
          const value = item.split('=')
          if (index === 0) {
            type = value[0]
          }
          return value[1]
        })
        return {
          virtio: list[0],
          bridgename: list[5],
          ip: list[6],
          type
        }
      })
    }
  },
  data() {
    return {
      height: 600,
      active: 'detail',
      clone: {
        dialog: false,
        data: {}
      },
      migrate: {
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
        visible: false,
        data: {}
      },
      cloneToTemplateData: {
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
      volumeLength: 0,
      upgradeDialog: {
        visible: false,
        data: {}
      },
      modifyData: {
        dialog: false,
        title: '名称',
        data: {}
      },
      diskList: []
    }
  },
  watch: {
    detail() {
      this.setNetcards()
      this.getDiskList()
      // detailHost(this.detail.hostId, 'Vmware').then((data) => {
      //   if (data.success) {
      //     this.$set(this.detail, 'hostIp', data.data.manageIp);
      //   }
      // });
    }
  },
  created() {
    this.setNetcards()
    this.getDiskList()
    // detailHost(this.detail.hostId, 'Vmware').then((data) => {
    //   if (data.success) {
    //     this.$set(this.detail, 'hostIp', data.data.manageIp);
    //   }
    // });
  },
  methods: {
    setNetcards() {
      this.networkConfigs = this.detail.netcards
      const ary = []
      this.detail.netcards.forEach(item => {
        item.address = ''
        ary.push(item.mac)
      })
      // this.detail.privateIpsList.forEach((item) => {
      //   if (ary.indexOf(item.mac) > -1 && this.networkConfigs[ary.indexOf(item.mac)].address) {
      //     this.networkConfigs[ary.indexOf(item.mac)].address = this.networkConfigs[ary.indexOf(item.mac)].address + ',' + item.address;
      //   } else if (ary.indexOf(item.mac) > -1) {
      //     this.networkConfigs[ary.indexOf(item.mac)].address = item.address;
      //   }
      // });
    },
    addNetCard() {
      this.netCatdData = {
        dialog: true,
        title: '新增网络适配器',
        hostId: this.detail.hostId,
        id: this.detail.id,
        vendorId: this.detail.vendorId,
        sangforNetworks: this.detail.sangforNetworks,
        azId: this.detail.azUuid,
        data: {
          bridgename: '',
          bvsId: '',
          gateway: '',
          ip: '',
          mac: '',
          mask: '',
          portUuid: '',
          vifId: '',
          model: 'virtio'
        }
      }
    },
    modifyNetCard(data) {
      this.netCatdData = {
        dialog: true,
        title: '编辑网络适配器',
        hostId: this.detail.hostId,
        id: this.detail.id,
        data: {
          ...data,
          operation: 'EDIT'
        }
      }
    },
    upgradeSpec() {
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      console.log(privateIpsList)
      this.upgradeDialog = {
        visible: true,
        data: {
          ...this.detail,
          flavorId: '', // 暂时不做回显
          service: 'sangfor.standard.server',
          // 用来获取规格接口传参
          params: {},
          preview: [
            { label: '云主机名称', value: name },
            { label: '原规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(item => item.address).join('、') || '--' }
          ]
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
    setVolumeLength(data) {
      this.volumeLength = data
    },
    addDisk() {
      const detail = this.detail
      const { name, cpu, memory, disk, dataStoreId, datastore, privateIpsList } = this.detail
      this.addDiskData = {
        visible: true,
        length: this.volumeLength,
        data: {
          ...detail,
          service: 'sangfor.standard.server',
          params: {
            serviceCode: 'sangfor.storage.disk',
            osCategory: detail.osCategory,
            type: detail.vendorType,
            // 单块硬盘默认参数
            itemParam: {
              preallocate: 'metadata',
              dataStoreId,
              dataStoreUuid: datastore
            }
          },
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(item => item.address).join('、') || '--' }
          ]
        }
      }
    },
    removeVolume(data) {
      this.$confirm('您现在执行的删除硬盘是一个高风险操作，该操作可能导致系统无法启动。如果您在该磁盘上做过LVM配置，在操作前请对系统和数据进行迁移备份，执行该操作将会清除硬盘中所有数据和LVM相关配置，请确认是否删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$confirm('点击确定将删除此硬盘，请确定', '提示', {
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
              this.getDiskList()
            }
          })
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
      this.cloneData = {
        dialog: true,
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId,
          count: 1,
          isAddShterm: false
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
          ...detail,
          volumeId: data.id,
          service: 'sangfor.standard.server',
          params: { osCategory: detail.osCategory, type: detail.vendorType, serviceCode: 'sangfor.storage.disk' },
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(item => item.address).join('、') || '--' }
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
      if (data.operate.indexOf('snapshot') > -1) {
        this.$refs.snapshot.getSnapshot()
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
    // 控制台
    async goWebConsole() {
      const { data } = await getVmVnc({ vendorId: this.detail.vendorId, instanceId: this.detail.instanceId })
      data && window.open(data)
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
    },
    // 修改备注
    modifyRemark() {
      this.modifyData = {
        dialog: true,
        title: '备注',
        data: {
          remark: this.detail.remark,
          id: this.detail.id
        }
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          modifyVm(this.modifyData.data).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.modifyData.dialog = false
              this.$emit('back', this.detail.id)
            }
          })
        }
      })
    },
    filterSize(val, unit) {
      return `${val / 1024 / 1024 / 1024} ${unit}`
    },
    async getDiskList() {
      const { data } = await conditionVoleme({ condition: 'listByVmId', serverId: this.detail.id })
      this.diskList = data
    }
  }
}
</script>
<style lang="scss"></style>
