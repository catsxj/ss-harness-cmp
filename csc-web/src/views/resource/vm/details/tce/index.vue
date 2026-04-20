<template>
  <common-detail :data="detail" :title="detail.name" @goBack="goBack" class="vm_conmon_detial">
    <div slot="custom_content">
      <div class="detail-body-header">
        <div class="detailBox">
          <div class="borders_top" :gutter="10">
            <div style="width: 6%; font-weight: bold" :span="2" class="valueBox">名称：</div>
            <div style="width: 15%" :span="4" class="valueBox lines1">
              {{ detail.name }}
            </div>
            <div style="width: 6%; padding-left: 10px; font-weight: bold" :span="2" class="valueBox">规格：</div>
            <div style="width: 15%" :span="3" class="valueBox lines1">{{ (detail.cpu ? detail.cpu : 0) + 'C/' + (detail.memory ? detail.memory : 0) + 'GB/' }}{{ detail.disk == null ? 0 : detail.disk + 'GB' }}</div>
            <div style="width: 6%; padding-left: 10px; font-weight: bold" :span="2" class="valueBox">系统：</div>
            <div style="width: 15%" :span="2" class="valueBox lines1">
              {{ detail.osCategory }}
            </div>
            <div style="width: 6%; padding-left: 10px; font-weight: bold" :span="2" class="valueBox">IP：</div>
            <div style="width: 15%" class="valueBox">
              <el-tooltip placement="bottom">
                <div slot="content">
                  <div v-for="(item, index) in detail.privateIpsList" :key="index">{{ item }}</div>
                </div>
                <div>
                  {{ detail.privateIpsList ? detail.privateIpsList[0] : '' }}
                </div>
              </el-tooltip>
            </div>
            <!-- <span class="lines1"></span> -->
            <div style="clear: both"></div>
          </div>
          <el-row class="borders_btm" :gutter="10" style="margin-top: 2px">
            <el-col :span="24">
              <el-button v-if="detail.isShowStart" :disabled="detail.status == 'RESTORING' || detail.isStart || detail.isAlldisabled" size="medium" @click="patchVm('start', '开机')">开机</el-button>
              <el-button v-if="detail.isShowStop" :disabled="detail.status == 'RESTORING' || detail.isStop || detail.isAlldisabled" size="medium" @click="patchVm('stop', '关机')">关机</el-button>
              <el-button v-if="detail.isShowRestart" :disabled="detail.status == 'RESTORING' || detail.isRestart || detail.isAlldisabled" size="medium" @click="patchVm('restart', '重启')">重启</el-button>
              <el-button size="medium" @click="addImage">制作镜像</el-button>
              <el-button size="medium" @click="modifyPas">重设密码</el-button>
              <el-button size="medium" @click="key(true)">绑定密钥</el-button>
              <el-button size="medium" @click="key(false)">解绑密钥</el-button>
              <el-dropdown class="m-l-md">
                <el-button size="medium"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="upgradeSpec">修改主机规格</el-dropdown-item>
                  <el-dropdown-item @click.native="resetOs">重装操作系统</el-dropdown-item>
                  <!-- <el-dropdown-item  @click.native="addGroup">加入安全组</el-dropdown-item>
                <el-dropdown-item @click.native="removeGroup">移除安全组</el-dropdown-item> -->
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>
        </div>
        <div style="clear: both"></div>
      </div>
      <!-- <hr /> -->
      <el-row class="detail-body-body" style="padding: 0 10px 0 10px">
        <el-tabs v-model="active">
          <el-tab-pane label="详细信息" name="detail">
            <el-row :gutter="20">
              <el-col :span="12">
                <detailMsg @back="$emit('back', detail.id)" :detail="detail" :modify="['名称']"></detailMsg>
              </el-col>
              <el-col :span="12">
                <el-card class="m-t" :body-style="{ padding: 0 }">
                  <basic-table :data="detail.privateIpsList" border style="width: 100%">
                    <el-table-column prop="date" label="IP地址">
                      <template slot-scope="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                    <div slot="pagination"></div>
                  </basic-table>
                </el-card>
                <volume :detail="detail"></volume>
                <group :detail="detail"></group>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="操作记录" name="operate">
            <basic-table v-if="active === 'operate'" :data="resList" :params="paramd" :get-list="getRes" :total="resTotal">
              <el-table-column prop="content" label="操作内容" show-overflow-tooltip></el-table-column>
              <el-table-column prop="result" label="操作结果" show-overflow-tooltip></el-table-column>
              <el-table-column prop="operator" label="操作人" show-overflow-tooltip></el-table-column>
              <el-table-column prop="gmtOperate" label="操作时间" show-overflow-tooltip></el-table-column>
            </basic-table>
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
    </div>
  </common-detail>
</template>

<script>
import { modifyVm, getRes, getVolume, getVmConsole, removeFloatIpPorts, patchVmId, patchVmResize } from 'services/platform/index'
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
import '../index.scss'
export default {
  components: { group, volume, detailMsg, addGroup, removeGroup, addImage, modifyPas, resetOs, key, modifyNet },
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
      active: 'detail'
    }
  },
  created() {
    this.getRes()
    this.getVolumeData()
  },
  methods: {
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
    getVolumeData(page) {
      this.paramt.page = page || this.paramt.page
      const params = {
        page: this.paramt.page,
        rows: this.paramt.rows
      }
      params.params = JSON.stringify([
        {
          param: { serverId: this.id, vendorId: this.detail.vendorId },
          sign: 'EQ'
        }
      ])
      getVolume(params).then(data => {
        if (data.success) {
          this.mountList = data.data.rows
          this.mountTotal = data.data.total
          this.mountList.forEach((data, index) => {
            if (data.status == 'AVAILABLE') {
              data.status1 = '可用'
              data.statusColor = 'primary'
            } else if (data.status == 'IN_USE' || data.status == 'IN-USE') {
              data.status1 = '正在使用'
              data.statusColor = 'success'
            } else if (data.status == 'BUILDING') {
              data.status1 = '创建中'
              data.statusColor = 'warning'
            } else if (data.status == 'DELETING') {
              data.status1 = '删除中'
              data.statusColor = 'warning'
            } else {
              data.status1 = '异常'
              data.statusColor = 'danger'
            }
          })
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
          service: 'tec.standard.server',
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
          id: this.detail.id,
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
    }
  }
}
</script>
<style lang="scss"></style>
