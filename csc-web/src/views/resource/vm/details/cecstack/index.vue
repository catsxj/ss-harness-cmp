<template>
  <common-detail :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header">
        <header-content :detail="detail" :ip="networks.length ? networks[0].value : ''"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button type="ghost" :disabled="detail.status == 'RESTORING' || detail.status == 'RUNNING' || detail.isStart || detail.isAlldisabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button type="ghost" :disabled="detail.status == 'RESTORING' || detail.isStop || detail.isAlldisabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button type="ghost" :disabled="detail.status == 'RESTORING' || detail.isRestart || detail.isAlldisabled" size="medium" @click="patchVm('restart', '重启')">重启</el-button>
            <el-button type="ghost" :disabled="detail.status == 'DEALLOCATE' || detail.isStart || detail.isAlldisabled" size="medium" @click="patchVm('lock', '锁定')">锁定</el-button>
            <el-button type="ghost" :disabled="detail.status == 'DEALLOCATE' || detail.isStart || detail.isAlldisabled" size="medium" @click="patchVm('unlock', '解锁')">解锁</el-button>
            <el-button type="ghost" :disabled="detail.status == 'RESTORING' || detail.status != 'RUNNING' || detail.isAlldisabled" size="medium" @click="patchVm('suspend', '挂起')">挂起</el-button>
            <el-button type="ghost" v-if="detail.status === 'PAUSED'" :disabled="detail.isAlldisabled" size="medium" @click="patchVm('resume', '恢复')">恢复</el-button>
            <!-- <el-button type="ghost" :disabled="(detail.projectVisibility && detail.projectVisibility != 'GLOBAL_PROJECT') || detail.isAlldisabled || detail.status != 'STOPPED'" size="medium" @click="upgradeSpec">规格变更</el-button> -->
            <!-- <el-button type="ghost" :disabled="(detail.projectVisibility && detail.projectVisibility != 'GLOBAL_PROJECT') || detail.isAlldisabled" size="medium" @click="upgradeSpec">规格变更</el-button> -->
            <!-- <el-button type="ghost" size="medium" :disabled="detail.isAlldisabled" @click="modifyPas">重设密码</el-button> -->
            <!-- <el-button size="medium" :disabled="detail.isAlldisabled" @click="addImage">添加镜像</el-button> -->
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
                <detailMsg @back="$emit('back', detail.id)" :detail="detail" :modify="['名称', '描述']"></detailMsg>
              </el-col>
              <el-col :span="24">
                <el-card :body-style="{ padding: '0px' }" class="m-t">
                  <div slot="header" class="clearfix">
                    <span>网络配置</span>
                    <span class="pull-right add-btn">
                      <!-- <el-button :disabled="detail.status == 'RESIZING'||detail.status == 'SUSPENDED' ||detail.status == 'PAUSED'||detail.affirmModify || detail.isAlldisabled || detail.isMount" type="text" @click="mount">挂载网卡</el-button> -->
                      <!-- <el-button v-if="!detail.fipId" :disabled="detail.isAlldisabled || detail.isFlotip" type="text" @click="bindIp">绑定IP</el-button> -->
                    </span>
                  </div>
                  <basic-table :data="networks" style="margin: 10px">
                    <el-table-column prop="date" label="IP地址" width="200px">
                      <template slot-scope="scope">
                        {{ scope.row.value }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="networkName" label="类型">
                      <template slot-scope="scope">
                        {{ scope.row.type == 'public' ? '公网' : '内网' }}
                      </template>
                    </el-table-column>
                    <!-- <el-table-column prop="date" label="操作">
                      <template slot-scope="scope">
                        <el-button v-if="scope.row.type == 'public'" :disabled="detail.isAlldisabled" type="text" @click="unBindIp">解绑IP</el-button>
                      </template>
                    </el-table-column> -->
                    <div slot="pagination"></div>
                  </basic-table>
                </el-card>
                <volume :detail="detail" ref="volume">
                  <el-table-column label="是否共享盘" show-overflow-tooltip slot="el-table-column" width="100px">
                    <template slot-scope="scope">
                      {{ scope.row.multiattach | booleanFilter }}
                    </template>
                  </el-table-column>
                </volume>
                <group :detail="detail" :operate="false"></group>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="operate">
            <res :detail="detail" v-if="active === 'operate'"></res>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <add-image :add-data="imageData" :vendor-id="detail.vendorId" v-if="imageData.dialog"></add-image>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
      <bind-ip :add-data="bindIpData" v-if="bindIpData.dialog" @back="$emit('back', detail.id)"></bind-ip>
      <modify-pas :add-data="modifyPasData" :vendor-id="detail.vendorId" v-if="modifyPasData.dialog"></modify-pas>
    </div>
  </common-detail>
</template>

<script>
import { modifyVm, getRes, getVolume, getVmConsole, disAssociateElasticipsIp, patchVmId, patchVmResize } from 'services/platform/index'
import webSocket from '@/common/mixins/webSocket'
import Upgrade from '../components/upgradeSpec.vue'
import detailMsg from '../components/detailMsg.vue'
import res from '../components/res.vue'
import volume from '../components/volume.vue'
import group from '../components/group.vue'
import bindIp from './dialog/bindIp.vue'
import modifyPas from './dialog/modifyPas.vue'
import addImage from './dialog/addImage.vue'
import headerContent from '../components/header.vue'
import '../index.scss'
export default {
  components: { headerContent, addImage, res, detailMsg, Upgrade, group, volume, bindIp, modifyPas },
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
      bindIpData: {
        dialog: false,
        data: {}
      },
      modifyPasData: {
        dialog: false,
        data: {}
      },
      imageData: {
        dialog: false,
        data: {}
      },
      active: 'detail'
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
    addImage() {
      this.imageData = {
        dialog: true,
        data: {
          serverId: this.detail.id,
          regionId: this.detail.regionId,
          vendorId: this.detail.vendorId
        }
      }
    },
    setNetworks() {
      this.networks = []
      this.detail.privateIpsList.forEach(item => {
        this.networks.push({
          value: item.address
        })
      })
      this.detail.publicIpsList.forEach(item => {
        this.networks.push({
          value: item.address,
          type: 'public'
        })
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('cecstack') > -1 || data.operate.indexOf('resource') > -1) {
        this.$emit('back', this.detail.id)
      }
    },
    modifyPas() {
      this.modifyPasData = {
        dialog: true,
        data: {
          id: this.detail.id
        }
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
    upgradeSpec() {
      const { name, cpu, memory, disk, privateIpsList } = this.detail
      this.upgradeDialog = {
        visible: true,
        data: {
          ...this.detail,
          flavorId: '', // 暂时不做回显
          service: 'cecstack.standard.server',
          // 用来获取规格接口传参
          params: {},
          preview: [
            { label: '云主机名称', value: name },
            { label: '原规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.join('、') || '--' }
          ]
        }
      }
    },
    // 绑定解绑IP
    bindIp() {
      this.bindIpData = {
        dialog: true,
        data: {
          serverId: this.detail.instanceId,
          vendorId: this.detail.vendorId,
          regionId: this.detail.regionId,
          resourceGroupUuid: this.detail.resourceGroupUuid
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
