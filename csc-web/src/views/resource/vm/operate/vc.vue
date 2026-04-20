<template>
  <div>
    <el-button type="text" @click="modify(scope)"> 编辑</el-button>
    <div class="action-divider"></div>
    <UnsubscribeService type="vm" url="vms" :data="scope" @getList="emit" :disabled="scope.status != 'STOPPED'"> </UnsubscribeService>
    <div class="action-divider"></div>
    <template v-if="$store.state.app.userData.accountCategory !== 'User'">
      <Assign :detail="scope" type="Computer" @back="emit"></Assign>
      <div class="action-divider"></div>
    </template>
    <el-dropdown @command="dropdownClick" trigger="click">
      <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
      <el-dropdown-menu slot="dropdown">
        <DelayService :data="scope" @getList="emit" style="width: 100%" v-if="scope.expiredTime && scope.expiredTime.indexOf('2099') === -1">
          <el-dropdown-item :disabled="scope.status == 'BUILDING'"> 延期 </el-dropdown-item>
        </DelayService>
        <el-dropdown-item :command="{ row: scope, index: 1 }" :disabled="scope.disControl || scope.isExpired || scope.allDisabled"> 控制台 </el-dropdown-item>
        <!-- <el-dropdown-item :command="{ row: scope, index: 11 }"> 堡垒机访问 </el-dropdown-item> -->
        <el-dropdown-item :command="{ row: scope, index: 4 }" :disabled="scope.disStart || scope.isExpired || scope.allDisabled || ((scope.vendorType == 'OPENSTACK' || scope.vendorType == 'EASYSTACK') && scope.status == 'SUSPENDED')"> 开机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 5 }" :disabled="scope.disStop || scope.isExpired || scope.allDisabled || ((scope.vendorType == 'OPENSTACK' || scope.vendorType == 'EASYSTACK') && scope.status == 'SUSPENDED')"> 关机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 6 }" :disabled="scope.disRestart || scope.isExpired || scope.allDisabled"> 重启 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 10 }" :disabled="scope.disSuspended || scope.isExpired || scope.allDisabled"> 挂起 </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <vc-hot :add-data="hotData" v-if="hotData.dialog" @back="emit"></vc-hot>
    <set-ip :add-data="setIpData" :ip-data="ipList" v-if="setIpData.dialog"></set-ip>
    <UpgradeSpec :config="upgradeDialog" v-if="upgradeDialog.visible"></UpgradeSpec>
    <ExpansionDisk :config="expansionDialog" v-if="expansionDialog.visible"></ExpansionDisk>
    <AddDisk :config="diskDialog" v-if="diskDialog.visible"></AddDisk>
    <Access :add-data="viewData" v-if="viewData.dialog" @back="viewData.dialog = false"></Access>
  </div>
</template>

<script>
import vcHot from './dialog/vcHot.vue'
import setIp from './dialog/setIp.vue'
import { getVmTickets, patchVmId, detailCloudVendor } from 'services/platform/index'
import { getClient } from 'services/platform/security'
import UnsubscribeService from '../UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
import UpgradeSpec from './dialog/UpgradeSpec.vue'
import ExpansionDisk from './dialog/ExpansionDisk.vue'
import AddDisk from './dialog/AddDisk.vue'
import Access from './dialog/access.vue'
import Assign from '../assign/index.vue'
export default {
  props: {
    scope: {
      type: Object
    }
  },
  components: {
    vcHot,
    setIp,
    UnsubscribeService,
    DelayService,
    UpgradeSpec,
    ExpansionDisk,
    AddDisk,
    Access,
    Assign
  },
  data() {
    return {
      modifyPasData: {
        dialog: false,
        data: {}
      },
      hotData: {
        dialog: false,
        data: {}
      },
      setIpData: {
        dialog: false,
        data: {}
      },
      // 配置升级
      upgradeDialog: {
        visible: false
      },
      // 磁盘扩容
      expansionDialog: {
        visible: false
      },
      // 新增磁盘
      diskDialog: {
        visible: false
      },
      ipList: [],
      viewData: {
        dialog: false,
        data: {}
      },
      ClientUrl: '',
      vendorId: ''
    }
  },
  methods: {
    dropdownClick(command = {}) {
      console.log(command, '.....command')

      const row = command.row
      const flag = command.index
      this.rowData = row
      let action = ''
      let tip = ''
      switch (flag / 1) {
        case 1: // 控制台
          getVmTickets({ id: row.id }).then(data => {
            if (data.success) {
              data.data.id = row.id
              sessionStorage.setItem('console', JSON.stringify(data.data))
              window.open('/web-common-resource/terminal/vmks/terminal.html')
            }
          })
          break
        case 2: // 删除
          tip = '您确定要删除该主机？'
          action = 'recycle'
          this.message(tip, action, row.id)
          break
        case 3: // 监控
          detailCloudVendor(row.vendorId).then(data => {
            if (data.success) {
              this.$router.push({ name: 'VcMonitor', query: { vendorId: row.vendorId, identifier: row.name, id: row.id, hostName: row.hostName } }) // 可能需要重新定义路由以实现面包屑导航
            }
          })
          break
        case 4: // 开机
          tip = '您确定要启动该主机？'
          action = 'start'
          this.message(tip, action, row.id)
          break
        case 5: // 关机
          tip = '您确定要关闭该主机？'
          action = 'stop'
          this.message(tip, action, row.id)
          break
        case 6: // 重启
          tip = '您确定要重启该主机？'
          action = 'restart'
          this.message(tip, action, row.id)
          break
        case 10: // 挂起
          tip = '您确定要挂起该主机？'
          action = 'suspend'
          this.message(tip, action, row.id)
          break
        case 11: // 访问
          this.viewData = JSON.parse(JSON.stringify(command.row))
          this.$set(this.viewData, 'dialog', true)
          break
        case 13: // 快照
          this.$emit('snapshot', row)
          break
        case 14: // 延期
          this.$emit('time', row)
          return
        case 19: // 修改密码
          this.modifyPasData = {
            dialog: true,
            data: {
              id: row.id
            }
          }
          break
        case 20: // 升级配置
          this.upgradeDialog = {
            visible: true,
            data: { ...row, service: 'vmware.standard.server' }
          }
          break
        case 24: // 磁盘扩容
          this.expansionDialog = {
            visible: true,
            data: { ...row, service: 'vmware.standard.server' }
          }
          break
        case 25: // 新增磁盘
          this.diskDialog = {
            visible: true,
            data: { ...row, service: 'vmware.standard.server' }
          }
          break
        case 21: // 热插拔设置
          this.hotData = {
            dialog: true,
            data: {
              serverId: command.row.id,
              cpuHotEnable: command.row.cpuHotEnable,
              memHotEnable: command.row.memHotEnable
            }
          }
          break
        case 23:
          this.setIpData = {
            dialog: true,
            data: {
              id: command.row.id,
              vendorId: command.row.vendorId,
              ip: command.row.monitorIp
            }
          }
          this.ipList = []
          command.row.privateIpsList.forEach(item => {
            this.ipList.push(item.address)
          })
          break
        default:
      }
    },
    emit() {
      this.$emit('getList')
    },
    modify(data) {
      this.$emit('modify', data)
    },
    message(tip, action, id) {
      this.$confirm(tip, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchVmId(action, { id: id }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.emit()
          }
        })
      })
    },
    handleClientDownlod() {
      getClient({
        vendorId: this.vendorId,
        type: navigator.platform
      }).then(data => {
        if (data.success) {
          this.ClientUrl = data.data
          window.open(this.ClientUrl)
        }
      })
    }
  },
  created() {}
}
</script>

<style scoped></style>
