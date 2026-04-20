<template>
  <common-detail :title="detail.name" @goBack="goBack">
    <div slot="custom_content">
      <div class="detail-body-header">
        <header-content :detail="detail" :ip="false"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button :disabled="detail.status == 'RESTORING' || detail.isStart || detail.isAlldisabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button :disabled="detail.status == 'RESTORING' || detail.isStop || detail.isAlldisabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button :disabled="detail.status == 'RESTORING' || detail.isRestart || detail.isAlldisabled" size="medium" @click="patchVm('restart', '重启')">重启</el-button>
            <el-button :disabled="detail.status == 'DEALLOCATE' || detail.isAlldisabled" size="medium" @click="patchVm('deallocate', '停止')">停止</el-button>
            <el-button :disabled="(detail.projectVisibility && detail.projectVisibility != 'GLOBAL_PROJECT') || detail.isAlldisabled" size="medium" @click="upgradeSpec">调整配置</el-button>
            <!-- <el-button v-if="!detail.publicIps.length" :disabled="(detail.projectVisibility && detail.projectVisibility != 'GLOBAL_PROJECT') || detail.isAlldisabled || detail.status == 'DEALLOCATE'" size="medium" @click="bind">绑定弹性IP</el-button>
          <el-button v-else :disabled="(detail.projectVisibility && detail.projectVisibility != 'GLOBAL_PROJECT') || detail.isAlldisabled || detail.status == 'DEALLOCATE'" size="medium" @click="unBind">解绑弹性IP</el-button> -->
            <el-button :disabled="detail.status != 'DEALLOCATE' || detail.isAlldisabled" size="medium" @click="startGeneral">开启通用化</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- <hr /> -->
      <el-row class="detail-body-body" style="padding: 0 10px 0 10px">
        <el-tabs v-model="active">
          <el-tab-pane label="详细信息" name="detail">
            <el-row :gutter="20">
              <el-col :span="24">
                <detailMsg @back="$emit('back', detail.id)" :detail="detail" :modify="[]"></detailMsg>
              </el-col>
              <el-col :span="24">
                <nic :detail="detail" ref="nics"></nic>
                <volume :detail="detail" ref="volume">
                  <div class="pull-right" slot="operate">
                    <el-button class="add-btn" type="text" @click="addDisk">挂载</el-button>
                  </div>
                  <el-table-column label="操作" show-overflow-tooltip slot="el-table-column" width="100px">
                    <template slot-scope="scope">
                      <el-button type="text" @click="removeVolume(scope.row)" :disabled="scope.row.bootVolume">卸载</el-button>
                    </template>
                  </el-table-column>
                </volume>
                <group :detail="detail" :operate="false"></group>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="operate">
            <res :detail="detail"></res>
          </el-tab-pane>
          <el-tab-pane label="监控" name="monitor">
            <monitor :detail="detail" v-if="active == 'monitor'"></monitor>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <mount :add-data="mountData" v-if="mountData.dialog"></mount>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
      <bind :add-data="bindData" v-if="bindData.dialog" :nic-list="nicList" @back="$emit('back', detail.id)"></bind>
    </div>
  </common-detail>
</template>

<script>
import { startGeneral, modifyVm, getRes, getVolume, getVmConsole, removeFloatIpPorts, patchVmId, patchVolume } from 'services/platform/index'
import { patchNics } from 'services/platform/azure'

import webSocket from '@/common/mixins/webSocket'
import Upgrade from '../components/upgradeSpec.vue'
import detailMsg from '../components/detailMsg.vue'
import res from '../components/res.vue'
import volume from '../components/volume.vue'
import group from './group.vue'
import monitor from './monitor.vue'
import bind from './dialog/bind.vue'
import mount from './dialog/mount.vue'
import nic from './nic/index.vue'
import headerContent from '../components/header.vue'
import '../index.scss'
export default {
  components: { headerContent, res, detailMsg, Upgrade, group, volume, monitor, bind, mount, nic },
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
      upgradeDialog: {
        visible: false,
        data: {}
      },
      bindData: {
        dialog: false,
        data: {}
      },
      active: 'detail',
      nicList: [],
      mountData: {
        dialog: false,
        data: {}
      }
    }
  },
  created() {},
  methods: {
    addDisk() {
      this.mountData = {
        dialog: true,
        regionId: this.detail.regionId,
        vendorId: this.detail.vendorId,
        resourceGroupId: this.detail.resourceGroupId,
        data: {
          serverId: this.detail.id
        }
      }
    },
    removeVolume(data) {
      this.$confirm('此操作将卸载该云硬盘, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchVolume('detach', { id: data.id }).then(data => {
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
    onmessage(data) {
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('resource') > -1) {
        this.$emit('back', this.detail.id)
      }
      if (data.operate.indexOf('nics') > -1 || data.operate.indexOf('resource') > -1) {
        this.$emit('back', this.detail.id)
        this.$refs.nics.getNics()
      }
    },
    goBack() {
      this.$emit('goBack')
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
    startGeneral() {
      this.$confirm('此操作将开启通用化, 通用化的云主机将不可被操作, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        startGeneral(this.detail.id).then(data => {
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
    unBind() {
      const obj = this.nicList.find(item => item.publicIPAddress == this.detail.ipList[this.detail.ipList.length - 1].value)
      this.$confirm('此操作将解绑弹性IP, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchNics('detachPublicIp', { id: obj.id }).then(data => {
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
    bind() {
      this.bindData = {
        dialog: true,
        data: this.detail
      }
    },
    upgradeSpec() {
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.upgradeDialog = {
        visible: true,
        data: {
          ...this.detail,
          flavorId: '', // 暂时不做回显
          service: 'azure.standard.server',
          // 用来获取规格接口传参
          params: { vendorId: this.detail.vendorId, regionId: this.detail.regionId, zone: this.detail.zone, serverId: this.detail.id },
          preview: [
            { label: '云主机名称', value: name },
            { label: '原规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.join('、') || '--' }
          ]
        }
      }
    }
  }
}
</script>
<style lang="scss"></style>
