<template>
  <common-detail :data="detail" :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header">
        <header-content :detail="detail" :ip="networks.length ? networks[0].address : ''"></header-content>
        <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
          <el-col :span="24">
            <el-button size="medium" @click="toWebConsole(detail.instanceId)" :disabled="detail.status === 'STOPPED'">控制台</el-button>
            <el-button :disabled="detail.status == 'RESTORING' || detail.status == 'RUNNING' || detail.isStart || detail.isAlldisabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
            <el-button :disabled="detail.status == 'RESTORING' || detail.isStop || detail.isAlldisabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
            <el-button :disabled="detail.status == 'RESTORING' || detail.isRestart || detail.isAlldisabled" size="medium" @click="patchVm('restart', '重启')">重启</el-button>
            <el-button :disabled="detail.isAlldisabled" size="medium" @click="upgradeSpec">规格变更</el-button>
            <el-button size="medium" :disabled="detail.isAlldisabled || detail.status != 'RUNNING'" @click="modifyPas">重设密码</el-button>
            <!-- <el-button size="medium" :disabled="detail.isAlldisabled || detail.status == 'RUNNING'" @click="addImage">制作镜像</el-button> -->
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
              <el-col :span="24" class="m-t">
                <el-card class="m-t" :body-style="{ padding: 0 }">
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
                        {{ scope.row.address || scope.row.value }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="networkName" label="类型">
                      <template slot-scope="scope">
                        {{ scope.row.type == 'public' ? '公网' : '内网' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="date" label="操作">
                      <template slot-scope="scope">
                        <el-button v-if="scope.row.type == 'public'" :disabled="detail.isAlldisabled" type="text" @click="unBindIp">解绑IP</el-button>
                      </template>
                    </el-table-column>
                    <div slot="pagination"></div>
                  </basic-table>
                </el-card>
                <volume :detail="detail" ref="volume"></volume>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="operate">
            <res :detail="detail" v-if="active === 'operate'"></res>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <Upgrade :config="upgradeDialog" v-if="upgradeDialog.visible"></Upgrade>
      <bind-ip :add-data="bindIpData" v-if="bindIpData.dialog" @back="$emit('back', detail.id)"></bind-ip>
      <modify-pas :add-data="modifyPasData" :vendor-id="detail.vendorId" v-if="modifyPasData.dialog"></modify-pas>
      <add-image :add-data="addImageData" :vendor-id="detail.vendorId" v-if="addImageData.dialog"></add-image>
    </div>
  </common-detail>
</template>

<script>
import { removeFloatIpPorts, patchVmId } from 'services/platform/index'
import webSocket from '@/common/mixins/getGlobalSocket'
import Upgrade from '../components/upgradeSpec.vue'
import detailMsg from '../components/detailMsg.vue'
import res from '../components/res.vue'
import volume from '../components/volume.vue'
import bindIp from './dialog/bindIp.vue'
import modifyPas from './dialog/modifyPas.vue'
import addImage from './dialog/addImage.vue'
import headerContent from '../components/header.vue'

import '../index.scss'
export default {
  components: { headerContent, res, detailMsg, Upgrade, volume, bindIp, modifyPas, addImage },
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
      addImageData: {
        dialog: false,
        data: {}
      },
      restSystemData: {
        dialog: false,
        data: {}
      },
      keyData: {
        dialog: false,
        data: {},
        flag: true
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
      this.addImageData = {
        dialog: true,
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId,
          status: this.detail.status,
          instanceId: this.detail.instanceId,
          regionId: this.detail.regionId
        }
      }
    },
    resetOs() {
      this.restSystemData = {
        dialog: true,
        data: {
          id: this.detail.id,
          instanceId: this.detail.instanceId,
          regionId: this.detail.regionId
        }
      }
    },
    bindKey() {
      this.keyData = {
        dialog: true,
        flag: true,
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId
        }
      }
    },
    unbindKey() {
      this.keyData = {
        dialog: true,
        flag: false,
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId
        }
      }
    },
    setNetworks() {
      this.networks = []
      this.detail.privateIpsList.forEach(item => {
        this.networks.push(item)
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('resource') > -1 || data.operate.indexOf('zstack') > -1) {
        this.$emit('back', this.detail.id)
      }
    },
    modifyPas() {
      this.modifyPasData = {
        dialog: true,
        osCategory: this.detail.osCategory,
        data: {
          id: this.detail.id
        }
      }
    },
    goBack() {
      this.$emit('goBack')
    },
    // 操作
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
          service: 'zstack.standard.server',
          // 用来获取规格接口传参
          params: { vendorId: this.detail.vendorId, serverId: this.detail.id, vendorType: this.detail.vendorType },
          preview: [
            { label: '云主机名称', value: name },
            { label: '原规格', value: `${cpu}核/${memory}GB/${disk}GB` },
            { label: 'IP地址', value: privateIpsList.map(({ address }) => address).join('、') || '--' }
          ]
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
          regionId: this.detail.regionId,
          resourceGroupUuid: this.detail.resourceGroupUuid
        }
      }
    },
    toWebConsole(instanceId) {
      const { protocol, hostname } = location
      // window.open(`${protocol}//${hostname}:6080/cmp.html?path=path%3Ftoken%3D/${instanceId}`, '_blank')
      window.open(`https://${hostname}:60008/api/vnc/cmp.html?path=api/vnc/path%3Ftoken%3D${instanceId}`, '_blank')
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
            this.getData()
          }
        })
      })
    }
  }
}
</script>
<style lang="scss"></style>
