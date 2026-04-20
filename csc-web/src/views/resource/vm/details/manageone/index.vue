<template>
  <common-detail :data="detail" :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header">
        <header-content :detail="detail" :ip="networks.length ? networks[0].address : ''"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button :disabled="detail.status == 'RESTORING' || detail.isControl || detail.isAlldisabled" size="medium" @click="goVnc">控制台</el-button>
            <el-button v-if="detail.isShowStart" :disabled="detail.status == 'RESTORING' || detail.isStart || detail.isAlldisabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button v-if="detail.isShowStop" :disabled="detail.status == 'RESTORING' || detail.isStop || detail.isAlldisabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button v-if="detail.isShowRestart" :disabled="detail.status == 'RESTORING' || detail.isRestart || detail.isAlldisabled" size="medium" @click="patchVm('restart', '重启')">硬重启</el-button>
            <el-button v-if="detail.isShowRestart" :disabled="detail.status == 'RESTORING' || detail.isRestart || detail.isAlldisabled" size="medium" @click="patchVm('softrestart', '重启')">软重启</el-button>
            <el-button :disabled="detail.status == 'PAUSED' || detail.isAlldisabled || detail.isException1" size="medium" @click="online">在线迁移</el-button>
            <el-button :disabled="detail.isAlldisabled || detail.isOffline" size="medium" @click="offLine">离线迁移</el-button>
            <el-button :disabled="detail.isAlldisabled || detail.affirmModify || detail.isModifyConfig" size="medium" @click="upgradeSpec">修改配置</el-button>
            <el-button v-if="detail.affirmModify" :disabled="detail.status == 'RESTORING' || detail.status == 'SHELVED' || detail.isBuilding || detail.isAlldisabled" size="medium" @click="confirmResize">确认修改</el-button>
            <el-button v-if="detail.affirmModify" :disabled="detail.status == 'RESTORING' || detail.status == 'SHELVED' || detail.isBuilding || detail.isAlldisabled" size="medium" @click="revertResize"> 回滚配置</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- <hr /> -->
      <el-row class="detail-body-body" style="padding: 0 10px 0 10px">
        <el-tabs v-model="active">
          <el-tab-pane label="详细信息" name="detail">
            <el-row :gutter="5">
              <el-col :span="24">
                <detailMsg @back="$emit('back', detail.id)" :detail="detail"></detailMsg>
              </el-col>
              <el-col :span="24">
                <el-card class="m-t" :body-style="{ padding: 0 }">
                  <div slot="header" class="clearfix">
                    <span>网络配置</span>
                    <span class="pull-right add-btn">
                      <el-button :disabled="detail.status == 'RESIZING' || detail.status == 'SUSPENDED' || detail.status == 'PAUSED' || detail.affirmModify || detail.isAlldisabled || detail.isMount" type="text" @click="mount">挂载网卡</el-button>
                      <el-button v-if="!detail.fipId" :disabled="detail.isAlldisabled || detail.isFlotip" type="text" @click="bindIp">绑定IP</el-button>
                    </span>
                  </div>
                  <basic-table :data="networks" style="margin: 10px">
                    <el-table-column prop="date" label="IP地址" width="200px">
                      <template slot-scope="scope">
                        <div v-if="scope.row.flag">
                          <el-input v-model="scope.row.ip"></el-input>
                        </div>
                        <div v-else>{{ scope.row.address }}</div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="networkName" label="类型">
                      <template slot-scope="scope">
                        {{ scope.row.value ? scope.row.value : '内网' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="networkName" label="网络名称"> </el-table-column>
                    <el-table-column prop="date" label="操作">
                      <template slot-scope="scope">
                        <div v-if="scope.row.flag">
                          <el-button type="text" @click="modifyIpOk(scope.row)">确定</el-button>
                          <el-button type="text" @click="scope.row.flag = false">取消</el-button>
                        </div>
                        <div v-else>
                          <div v-if="scope.row.value">
                            <el-button v-if="detail.fipId" :disabled="detail.isAlldisabled" type="text" @click="unBindIp">解绑IP</el-button>
                          </div>
                          <div v-else>
                            <el-button type="text" @click="modifyIp(scope.row, scope.$index)">修改</el-button>
                            <el-button type="text" :disabled="detail.status == 'RESIZING' || detail.status == 'SUSPENDED' || detail.status == 'PAUSED' || !detail.privateIps || detail.affirmModify || detail.isAlldisabled || detail.isUnload" @click="unMount(scope.row)">移除</el-button>
                          </div>
                        </div>
                      </template>
                    </el-table-column>
                    <div slot="pagination"></div>
                  </basic-table>
                </el-card>
                <snapshot :detail="detail">
                  <div slot="operate" class="pull-right add-btn">
                    <el-button :disabled="detail.isBackup || detail.isAlldisabled" size="small" @click="addSnapshot">创建快照</el-button>
                  </div>
                  <el-table-column prop="name" width="160px" label="操作" slot="el-table-column">
                    <template slot-scope="scope">
                      <el-button type="text" @click="removeSnapshot(scope.row.id)"> 删除 </el-button>
                      <el-button type="text" @click="revertSnapshot(scope.row.id)"> 恢复 </el-button>
                    </template>
                  </el-table-column>
                </snapshot>
                <volume :detail="detail" ref="volume">
                  <div class="pull-right" slot="operate" v-if="detail.showBtn">
                    <el-button class="add-btn" type="text" @click="addDisk">新增</el-button>
                  </div>
                  <el-table-column label="操作" slot="el-table-column" show-overflow-tooltip width="100px" v-if="detail.showBtn">
                    <template slot-scope="scope">
                      <el-button type="text" :disabled="detail.bootVolume || detail.disControl || detail.isExpired || detail.allDisabled" @click="dilatation(scope.row)">扩容</el-button>
                    </template>
                  </el-table-column>
                </volume>
                <group :detail="detail"></group>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="operate">
            <res :detail="detail" v-if="active === 'operate'"></res>
          </el-tab-pane>
          <!-- <el-tab-pane label="性能监控" name="monitor" style="padding: 10px">
            <monitor v-if="active == 'monitor'" :detail="detail" :is-show="false"></monitor>
          </el-tab-pane> -->
        </el-tabs>
      </el-row>
      <bind-ip :add-data="bindIpData" v-if="bindIpData.dialog" @back="$emit('back', detail.id)"></bind-ip>
      <mount :add-data="mountData" v-if="mountData.dialog" @back="$emit('back', detail.id)"></mount>
      <online :add-data="onLineData" v-if="onLineData.dialog" @back="$emit('back', detail.id)"></online>
      <offline :add-data="offLineData" v-if="offLineData.dialog" @back="$emit('back', detail.id)"></offline>
      <un-mount :add-data="unMountData" v-if="unMountData.dialog" @back="$emit('back', detail.id)"></un-mount>
      <add-snapshot :add-data="addSnapshotData" v-if="addSnapshotData.dialog" @back="$emit('back', detail.id)"></add-snapshot>
      <modify-ip :add-data="modifyIpData" v-if="modifyIpData.dialog" @back="$emit('back', detail.id)"></modify-ip>
      <AddDisk @back="$refs.volume.getList()" :config="addDiskData" v-if="addDiskData.visible"></AddDisk>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
      <dilatation :config="dilatationData" v-if="dilatationData.visible"></dilatation>
    </div>
  </common-detail>
</template>

<script>
import { patchSnapshot, removeSnapshot, modifyVm, getRes, getVolume, getVmConsole, removeFloatIpPorts, patchVmId, patchVmResize, vmDeleteNetwork, modifyPort } from 'services/platform/index'
import { resetSnapshot } from 'services/platform/huasanyun'

import bindIp from './dialog/bindIp.vue'
import mount from './dialog/mount.vue'
import unMount from './dialog/unMount.vue'
import modifyIp from './dialog/modifyIp.vue'
import addSnapshot from './dialog/addSnapshot.vue'
import online from './dialog/online.vue'
import offline from './dialog/offline.vue'
import webSocket from '@/common/mixins/webSocket'
import detailMsg from '../components/detailMsg.vue'
import volume from '../components/volume.vue'
import group from '../components/group.vue'
import snapshot from '../components/snapshot.vue'
import res from '../components/res.vue'
import headerContent from '../components/header.vue'
import Upgrade from '../components/upgradeSpec.vue'
import AddDisk from '../components/addDisk.vue'
import dilatation from '../components/dilatation.vue'
import '../index.scss'

export default {
  components: { headerContent, snapshot, group, volume, detailMsg, modifyIp, bindIp, mount, unMount, addSnapshot, online, offline, res, Upgrade, AddDisk, dilatation },
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
      resList: [],
      resTotal: 0,
      paramd: {
        page: 1,
        rows: 10
      },
      mountList: [],
      mountTotal: 0,
      paramt: {
        page: 1,
        rows: 10
      },
      bindIpData: {
        dialog: false,
        data: {}
      },
      mountData: {
        dialog: false,
        data: {}
      },
      unMountData: {
        dialog: false,
        data: {}
      },
      addSnapshotData: {
        dialog: false,
        data: {}
      },
      modifyIpData: {
        dialog: false,
        data: {}
      },
      onLineData: {
        dialog: false,
        data: {}
      },
      offLineData: {
        dialog: false,
        data: {}
      },
      upgradeDialog: {
        visible: false,
        data: {}
      },
      active: 'detail',
      addDiskData: {
        visible: false,
        data: {}
      },
      dilatationData: {
        visible: false
      },
      networks: []
    }
  },
  created() {
    this.setNetworks()
  },
  watch: {
    detail() {
      this.setNetworks()
      if (this.$refs.volume) this.$refs.volume.getList()
    }
  },
  methods: {
    setNetworks() {
      this.networks = []
      this.detail.privateIpsList.forEach(item => {
        item.addresses.forEach(item1 => {
          this.networks.push(Object.assign({ networkName: item.networkName }, item1))
        })
      })
      if (this.detail.floatingIp && this.detail.privateIpsList.length) {
        this.networks.push({
          address: this.detail.floatingIp,
          networkName: this.detail.floatingIpName,
          type: 'public',
          value: '公网'
        })
      }
    },
    removeSnapshot(id) {
      this.$confirm('此操作将永久删除该快照, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeSnapshot(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
          }
        })
      })
    },
    revertSnapshot(id) {
      this.$confirm('此操作将恢复该快照, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchSnapshot('revert', { id: id }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
          }
        })
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('resource') > -1) {
        this.$emit('back', this.detail.id)
      }
    },
    goBack() {
      this.$emit('goBack')
    },
    // 详情操作记录
    getRes(page) {
      this.paramd.page = page || this.paramd.page
      const params = {
        page: this.paramd.page,
        rows: this.paramd.rows
      }
      const searchParam = []
      searchParam.push({ param: { resourceId: this.detail.id, vendorId: this.detail.vendorId, object: 'VM' }, sign: 'EQ' })
      params.params = JSON.stringify(searchParam)
      getRes(params).then(data => {
        if (data.success) {
          if (data.data) {
            this.resList = data.data.rows
            this.resTotal = data.data.total
          }
        }
      })
    },
    // 操作
    // 控制台
    goVnc() {
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
    // 开关机等操作
    patchVm(action, value) {
      this.$confirm('此操作将' + value + '云主机, 是否继续?', '提示', {
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
    // 绑定解绑IP
    bindIp() {
      this.bindIpData = {
        dialog: true,
        data: {
          vmId: this.detail.id,
          vendorId: this.detail.vendorId
        }
      }
    },
    unBindIp(action, value) {
      this.$confirm('此操作将解绑IP, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFloatIpPorts({ id: this.detail.fipId }).then(data => {
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
    // 挂载卸载网卡
    mount() {
      this.mountData = {
        dialog: true,
        data: {
          id: this.detail.id,
          routerUuid: this.detail.routerUuid,
          vendorId: this.detail.vendorId
        }
      }
    },
    unMount(data) {
      this.$confirm('此操作将移除该网卡, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        vmDeleteNetwork({
          id: this.detail.id,
          portId: data.addresses[0].portId,
          vendorId: this.detail.vendorId
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
    // 创建快照
    addSnapshot() {
      this.addSnapshotData = {
        dialog: true,
        data: {
          serverId: this.detail.id
        }
      }
    },
    // 修改IP
    modifyIp(data, index) {
      this.$set(data, 'ip', data.address)
      this.$set(data, 'flag', true)
    },
    modifyIpOk(data) {
      this.$confirm('此操作将修改该IP, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        modifyPort({
          id: data.portId,
          ipAddress: data.ip,
          vmId: this.detail.id,
          oldIpAddress: data.address,
          vendorId: this.detail.vendorId
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
    // 迁移
    online() {
      this.onLineData = {
        dialog: true,
        data: {
          serverId: this.detail.id,
          oldHostId: this.detail.hostId,
          live: true,
          vendorId: this.detail.vendorId,
          cpuModel: this.detail.cpuModel,
          modelName: this.detail.modelName,
          diskOverCommit: false,
          blockMigration: false
        }
      }
    },
    offLine() {
      this.$confirm('你已经选择了' + this.detail.name + ', 请确认你的选择。迁移实例可能会引起一些不可恢复的结果?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const obj = {
          id: this.detail.vendorId,
          serverId: this.detail.id,
          live: false
        }
        patchVmId('OSMigrate', obj).then(data => {
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
    upgradeSpec() {
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.upgradeDialog = {
        visible: true,
        data: {
          ...this.detail,
          flavorId: '', // 暂时不做回显
          service: 'manageone.standard.server',
          // 用来获取规格接口传参
          params: {
            condition: JSON.stringify({
              condition: 'listAvailable',
              vendorId: this.detail.vendorId,
              regionId: this.detail.regionId,
              zoneId: this.detail.zone,
              instanceChargeType: this.detail.instanceChargeType,
              imageUuid: this.detail.imageUuid
            })
          },
          preview: [
            { label: '云主机名称', value: name },
            { label: '原规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            {
              label: 'IP地址',
              value:
                privateIpsList
                  .map(({ addresses }) => addresses.map(({ address }) => address))
                  .flat(Infinity)
                  .join('、') || '--'
            }
          ]
        }
      }
    },
    addDisk() {
      const detail = this.detail
      const { name, cpu, memory, disk, privateIpsList, vendorId, zone, regionId, instanceChargeType } = this.detail
      this.addDiskData = {
        visible: true,
        length: this.volumeLength,
        data: {
          ...detail,
          service: 'manageone.standard.server',
          params: {
            serviceCode: 'manageone.standard.volume',
            osCategory: detail.osCategory,
            type: detail.vendorType,
            vendorId,
            regionId,
            zoneId: zone,
            instanceChargeType,
            itemParam: {
              // deleteWithInstance: false
            }
          },
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            {
              label: 'IP地址',
              value:
                privateIpsList
                  .map(({ addresses }) => addresses.map(({ address }) => address))
                  .flat(Infinity)
                  .join('、') || '--'
            }
          ]
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
          service: 'manageone.standard.server',
          params: {
            osCategory: detail.osCategory,
            type: detail.vendorType,
            serviceCode: 'manageone.standard.volume',
            itemParam: {
              volumeId: data.id
              // editType: 'online'
            }
          },
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            {
              label: 'IP地址',
              value:
                privateIpsList
                  .map(({ addresses }) => addresses.map(({ address }) => address))
                  .flat(Infinity)
                  .join('、') || '--'
            },
            { label: '硬盘名称', value: data.name }
          ]
        }
      }
    },
    confirmResize() {
      this.$confirm('确定要修改该云主机嘛？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchVmResize('confirmResize', { id: this.detail.id }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            sessionStorage.setItem('platformId', this.detail.vendorId)
          }
        })
      })
    },
    revertResize() {
      this.$confirm('确定要回滚该云主机嘛？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchVmResize('revertResize', { id: this.detail.id }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            sessionStorage.setItem('platformId', this.detail.vendorId)
          }
        })
      })
    }
  }
}
</script>
<style lang="scss"></style>
