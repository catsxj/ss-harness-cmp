<template>
  <common-detail :data="detail" :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header">
        <header-content :detail="detail" :ip="networks.length ? networks[0].address : ''"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button :disabled="detail.status == 'RESTORING' || detail.isStart || detail.isAlldisabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button :disabled="detail.status == 'RESTORING' || detail.isStop || detail.isAlldisabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button :disabled="detail.status == 'RESTORING' || detail.isRestart || detail.isAlldisabled" size="medium" @click="patchVm('restart', '重启')">重启</el-button>
            <el-button size="medium" :disabled="detail.isAlldisabled" @click="addImage">制作镜像</el-button>
            <el-button size="medium" :disabled="detail.isAlldisabled" @click="modifyPas">重设密码</el-button>
            <!-- <el-button size="medium" @click="modifyNet">调整网络</el-button> -->
            <!-- <el-button size="medium" :disabled="detail.isAlldisabled" @click="key(true)">绑定密钥</el-button>
            <el-button size="medium" :disabled="detail.isAlldisabled" @click="key(false)">解绑密钥</el-button> -->
            <el-button :disabled="detail.isAlldisabled || !detail.isStop" size="medium" @click="upgradeSpec">规格变更</el-button>
            <el-dropdown class="m-l-md">
              <el-button size="medium"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="detail.isAlldisabled" @click.native="resetOs">重装操作系统</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
        <div style="clear: both"></div>
      </div>
      <!-- <hr /> -->
      <el-row class="detail-body-body" style="padding: 0 10px 0 10px">
        <el-tabs v-model="active">
          <el-tab-pane label="详细信息" name="detail">
            <el-row :gutter="20">
              <el-col :span="24">
                <detailMsg @back="$emit('back', detail.id)" :detail="detail" :modify="['名称']"></detailMsg>
              </el-col>
              <el-col :span="24">
                <el-card class="m-t" :body-style="{ padding: 0 }">
                  <div slot="header" class="clearfix">
                    <span>网络配置</span>
                    <span class="pull-right add-btn">
                      <el-button v-if="!detail.fipId" :disabled="detail.isAlldisabled || detail.isFlotip" type="text" @click="bindIp">绑定IP</el-button>
                    </span>
                  </div>
                  <basic-table :data="networks" style="width: 100%">
                    <el-table-column prop="date" label="IP地址" width="200px">
                      <template slot-scope="scope">
                        {{ scope.row.address }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="networkName" label="类型">
                      <template slot-scope="scope">
                        {{ scope.row.type == 'floating' ? '公网' : '内网' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="date" label="操作">
                      <template slot-scope="scope">
                        <el-button v-if="scope.row.type == 'floating'" :disabled="detail.isAlldisabled" type="text" @click="unBindIp">解绑IP</el-button>
                      </template>
                    </el-table-column>
                    <div slot="pagination"></div>
                  </basic-table>
                </el-card>
                <volume :detail="detail" ref="volume">
                  <div class="pull-right" slot="operate" v-if="detail.showBtn">
                    <el-button class="add-btn" type="text" @click="addDisk">新增</el-button>
                  </div>
                  <el-table-column label="操作" slot="el-table-column" show-overflow-tooltip width="100px" v-if="detail.showBtn">
                    <template slot-scope="scope">
                      <el-button type="text" :disabled="detail.disControl || detail.isExpired || detail.allDisabled" @click="dilatation(scope.row)">扩容</el-button>
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
        </el-tabs>
      </el-row>
      <add-group :add-data="addGroupData" :vendor-id="detail.vendorId" v-if="addGroupData.dialog"></add-group>
      <remove-group :add-data="removeGroupData" :vendor-id="detail.vendorId" v-if="removeGroupData.dialog"></remove-group>
      <add-image :add-data="imageData" :vendor-id="detail.vendorId" v-if="imageData.dialog"></add-image>
      <modify-pas :add-data="modifyPasData" :vendor-id="detail.vendorId" v-if="modifyPasData.dialog"></modify-pas>
      <reset-os :add-data="resetOsData" :vendor-id="detail.vendorId" v-if="resetOsData.dialog"></reset-os>
      <key :add-data="keyData" :vendor-id="detail.vendorId" v-if="keyData.dialog"></key>
      <modify-net :add-data="modifyNetData" :vendor-id="detail.vendorId" v-if="modifyNetData.dialog"></modify-net>
      <bind-ip :add-data="bindIpData" v-if="bindIpData.dialog" @back="$emit('back', detail.id)"></bind-ip>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
      <AddDisk @back="$refs.volume.getList()" :config="addDiskData" v-if="addDiskData.visible"></AddDisk>
      <dilatation :config="dilatationData" v-if="dilatationData.visible"></dilatation>
    </div>
  </common-detail>
</template>

<script>
import { modifyVm, getRes, getVolume, getVmConsole, disAssociateElasticipsIp, patchVmId, patchVmResize } from 'services/platform/index'
import webSocket from '@/common/mixins/webSocket'
import addGroup from './dialog/addSgroup.vue'
import removeGroup from './dialog/removeGroup.vue'
import addImage from './dialog/addImage.vue'
import modifyPas from './dialog/modifyPas.vue'
import resetOs from './dialog/resetOs.vue'
import key from './dialog/key.vue'
import modifyNet from './dialog/modifyNet.vue'
import detailMsg from '../components/detailMsg.vue'
import volume from '../components/volume.vue'
import group from '../components/group.vue'
import res from '../components/res.vue'
import bindIp from './dialog/bindIp.vue'
import headerContent from '../components/header.vue'
import Upgrade from '../components/upgradeSpec.vue'
import AddDisk from '../components/addDisk.vue'
import dilatation from '../components/dilatation.vue'
import '../index.scss'
export default {
  components: { res, group, volume, detailMsg, addGroup, removeGroup, addImage, modifyPas, resetOs, key, modifyNet, bindIp, headerContent, Upgrade, AddDisk, dilatation },
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
      upgradeDialog: {
        visible: false,
        data: {}
      },
      imageData: {
        dialog: false,
        data: {}
      },
      modifyPasData: {
        dialog: false,
        data: {}
      },
      keyData: {
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
      removeGroupData: {
        dialog: false,
        data: {}
      },
      modifyNetData: {
        dialog: false,
        data: {}
      },
      name: true,
      remark: true,
      oldName: '',
      oldRemark: '',
      networks: [],
      bindIpData: {
        dialog: false,
        data: {}
      },
      active: 'detail',
      addDiskData: {
        visible: false,
        data: {}
      },
      dilatationData: {
        visible: false
      }
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
      this.networks = JSON.parse(this.detail.privateIps)
    },
    onmessage(data) {
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('resource') > -1) {
        this.$emit('back', this.detail.id)
      }
    },
    modifyName() {
      this.oldName = this.detail.name
      this.name = !this.name
    },
    modifyRemark() {
      this.oldRemark = this.detail.remark
      this.remark = !this.remark
    },
    modify(type) {
      const obj = { id: this.detail.id }
      if (type == 'name') {
        if (!this.oldName) return this.$message.error('请输出名称')
        obj.name = this.oldName
        obj.remark = this.detail.remark
      }
      if (type == 'remark') {
        obj.remark = this.oldRemark
        obj.name = this.detail.name
      }
      modifyVm(obj).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this[type] = true
          this.$emit('back', this.detail.id)
        }
      })
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
    // 修改密码
    modifyPas() {
      this.modifyPasData = {
        dialog: true,
        data: {
          id: this.detail.id
        }
      }
    },
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
    // 修改主机规格
    upgradeSpec() {
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.upgradeDialog = {
        visible: true,
        data: {
          ...this.detail,
          flavorId: '', // 暂时不做回显
          service: 'huawei.standard.server',
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
            { label: 'IP地址', value: privateIpsList.map(({ address }) => address).join('、') || '--' }
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
          service: 'huawei.standard.server',
          params: {
            serviceCode: 'huawei.standard.volume',
            osCategory: detail.osCategory,
            type: detail.vendorType,
            vendorId,
            regionId,
            zoneId: zone,
            instanceChargeType,
            itemParam: {
              deleteWithInstance: false
            }
          },
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(({ address }) => address).join('、') || '--' }
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
          service: 'huawei.standard.server',
          params: {
            osCategory: detail.osCategory,
            type: detail.vendorType,
            serviceCode: 'huawei.standard.volume',
            itemParam: {
              volumeId: data.id,
              editType: 'online'
            }
          },
          preview: [
            { label: '云主机名称', value: name },
            { label: '云主机规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(({ address }) => address).join('、') || '--' },
            { label: '硬盘名称', value: data.name }
          ]
        }
      }
    },
    // 重装操作系统
    resetOs() {
      this.resetOsData = {
        dialog: true,
        data: {
          id: this.detail.id,
          instanceId: this.detail.instanceId,
          regionId: this.detail.regionId
        }
      }
    },
    // 创建快照
    addImage() {
      this.imageData = {
        dialog: true,
        data: {
          serverId: this.detail.id,
          vendorId: this.detail.vendorId,
          status: this.detail.status,
          instanceId: this.detail.instanceId,
          regionId: this.detail.regionId
        }
      }
    },
    // 密钥
    key(flag) {
      this.keyData = {
        dialog: true,
        flag: flag,
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId
        }
      }
    },
    // 调整网络
    modifyNet() {
      this.modifyNetData = {
        dialog: true,
        data: {
          band: this.detail.internetMaxBandwidthOut,
          instanceId: this.detail.instanceId,
          id: this.detail.id,
          vendorId: this.detail.vendorId,
          internetChargeType: '',
          publicIpAssigned: ''
        }
      }
    },
    // 安全组
    addGroup() {
      this.addGroupData = {
        dialog: true,
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId,
          regionId: this.detail.regionId
        }
      }
    },
    removeGroup() {
      this.removeGroupData = {
        dialog: true,
        data: {
          id: this.detail.id
        }
      }
    },
    // 绑定解绑IP
    bindIp() {
      this.bindIpData = {
        dialog: true,
        data: {
          serverId: this.detail.id,
          vendorId: this.detail.vendorId,
          regionId: this.detail.regionId
        }
      }
    },
    unBindIp(action, value) {
      this.$confirm('此操作将解绑IP, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        disAssociateElasticipsIp(
          {
            action: 'disassociation'
          },
          this.detail.fipId
        ).then(data => {
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
