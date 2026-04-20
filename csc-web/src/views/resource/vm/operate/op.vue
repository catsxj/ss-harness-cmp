<template>
  <div>
    <el-button type="text" @click="modify(scope)">编辑</el-button>
    <div class="action-divider"></div>
    <UnsubscribeService type="vm" url="vms" :data="scope" @getList="emit" :disabled="scope.status != 'STOPPED'"> </UnsubscribeService>
    <div class="action-divider"></div>
    <el-dropdown @command="dropdownClick">
      <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item :command="{ row: scope, index: 1 }" :disabled="scope.disControl || scope.isExpired || scope.allDisabled"> 控制台 </el-dropdown-item>
        <!-- <el-dropdown-item :command="{row: scope,index:3}"
                          :disabled="scope.isSHELVED || scope.isExpired || scope.allDisabled">
          监控
        </el-dropdown-item> -->
        <el-dropdown-item :command="{ row: scope, index: 30 }" :disabled="(scope.disControl && scope.status != 'STOPPED') || scope.isExpired || scope.allDisabled"> 升级规格 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 4 }" :disabled="scope.disStart || scope.isExpired || scope.allDisabled || (scope.vendorType == 'OPENSTACK' && scope.status == 'SUSPENDED')"> 开机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 5 }" :disabled="scope.disStop || scope.isExpired || scope.allDisabled || (scope.vendorType == 'OPENSTACK' && scope.status == 'SUSPENDED')"> 关机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 6 }" :disabled="scope.disRestart || scope.isExpired || scope.allDisabled"> 硬重启 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 17 }" :disabled="scope.disRestart || scope.isExpired || scope.allDisabled"> 软重启 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 7 }" :disabled="scope.disShutoff || scope.isExpired || scope.allDisabled" v-if="!scope.disShutoff"> 停止 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 8 }" :disabled="scope.disActive || scope.isSHELVED || scope.isExpired || scope.allDisabled" v-if="!scope.disActive"> 恢复 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 10 }" v-if="!scope.disSuspended" :disabled="scope.disSuspended || scope.isExpired || scope.allDisabled"> 挂起 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 11 }" v-if="!scope.disRecover" :disabled="scope.isExpired || scope.allDisabled || scope.disRecover"> 恢复 </el-dropdown-item>
        <!-- <el-dropdown-item :command="{row: scope,index:12}"
                          :disabled="scope.disPassword ||scope.isExpired || scope.allDisabled">
          修改密码
        </el-dropdown-item> -->
        <!-- <el-dropdown-item :command="{row: scope,index:13}"
                          :disabled="scope.isSHELVED || scope.allDisabled || scope.disSnapshot || scope.isExpired">
          快照
        </el-dropdown-item>
        <el-dropdown-item :command="{row: scope,index:14}" :disabled="scope.disPostpone">
          延期
        </el-dropdown-item> -->
        <!-- <el-dropdown-item v-if="scope.status=='RUNNING'&& !scope.fipId"
          :disabled="scope.fipId || scope.isExpired"
          :command="{row: scope,index:15}">绑定IP
        </el-dropdown-item>
        <el-dropdown-item :disabled="!scope.fipId || scope.isExpired"  :command="{row: scope,index:16,vendorId: scope.vendorId}">解绑IP
        </el-dropdown-item>
        <el-dropdown-item :disabled="scope.status == 'EXCEPTION'"
                          :command="{row: scope, index:20}">
          加入安全组
        </el-dropdown-item>
        <el-dropdown-item :disabled="scope.status == 'EXCEPTION'"
                          :command="{row: scope, index:21}">
          移除安全组
        </el-dropdown-item>
        <el-dropdown-item :disabled="scope.status == 'EXCEPTION'"
                          :command="{row: scope, index:22}">
          设置QoS
        </el-dropdown-item>
        <el-dropdown-item
                          :command="{row: scope, index:23}">
          设置监控IP
        </el-dropdown-item> -->
      </el-dropdown-menu>
    </el-dropdown>
    <modify-pas :add-data="modifyPasswordData" v-if="modifyPasswordData.dialog"></modify-pas>
    <bind-ip :add-data="ipData" v-if="ipData.dialog"></bind-ip>
    <add-group :add-data="addGroupData" v-if="addGroupData.dialog"></add-group>
    <remove-group :add-data="removeGroupData" v-if="removeGroupData.dialog"></remove-group>
    <set-qos :add-data="setQosData" v-if="setQosData.dialog"></set-qos>
    <set-ip :add-data="setIpData" :ip-data="ipList" v-if="setIpData.dialog"></set-ip>
    <UpgradeSpec :config="upgradeDialog" v-if="upgradeDialog.visible"></UpgradeSpec>
  </div>
</template>

<script>
import bindIp from './dialog/bindIp.vue'
import addGroup from './dialog/hwAddGroup.vue'
import removeGroup from './dialog/removeGroup.vue'
import setQos from './dialog/setQos.vue'
import setIp from './dialog/setIp.vue'
import UpgradeSpec from './dialog/UpgradeSpec.vue'
import UnsubscribeService from '../UnsubscribeService.vue'
import { removeFloatIpPorts, getVmConsole, patchVm, patchVmId } from 'services/platform/index'
export default {
  props: {
    scope: {
      type: Object
    }
  },
  components: {
    bindIp,
    addGroup,
    removeGroup,
    setQos,
    setIp,
    UpgradeSpec,
    UnsubscribeService
  },
  data() {
    return {
      modifyPasswordData: {
        dialog: false,
        data: {}
      },
      ipData: {
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
      setQosData: {
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
      ipList: []
    }
  },
  methods: {
    dropdownClick(command) {
      const row = command.row
      const flag = command.index
      this.rowData = row
      let action = ''
      let tip = ''
      switch (flag / 1) {
        case 1: // 控制台
          const newWindow = window.open()
          getVmConsole(row.id, {
            vncType: 'novnc',
            serverId: row.instanceId,
            id: row.vendorId,
            region: 'nova'
          }).then(data => {
            if (data.success) {
              newWindow.location.href = data.data.url ? data.data.url : data.data.uRL
            } else {
              newWindow.close()
            }
          })
          break
        case 2: // 删除
          tip = '您确定要删除该主机？'
          action = 'recycle'
          this.message(tip, action, row.id)
          break
        case 3: // 监控
          this.$router.push({ name: 'OpMonitor', query: { vendorId: row.vendorId, name: row.name, id: row.id, instanceId: row.instanceId } })
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
        case 7: // 停止
          tip = '您确定要停止该主机？'
          action = 'pause'
          this.message(tip, action, row.id)

          break
        case 8: // 恢复
          tip = '您确定要恢复该主机？'
          action = 'recovery'
          this.message(tip, action, row.id)

          break
        case 10: // 挂起
          tip = '您确定要挂起该主机？'
          action = 'suspend'
          this.message(tip, action, row.id)

          break
        case 11: // 恢复
          tip = '您确定要恢复该主机？'
          action = 'resume'
          this.message(tip, action, row.id)
          break
        case 12: // 修改密码
          this.modifyPasswordData = {
            dialog: true,
            data: {
              id: row.id,
              vendorId: row.vendorId
            }
          }
          break
        case 13: // 快照
          this.$emit('snapshot', row)
          break
        case 14: // 延期
          this.$emit('time', row)
          return
        case 15: // 绑定IP
          this.ipData = {
            dialog: true,
            data: {
              vendorId: row.vendorId,
              vmId: row.id
            }
          }
          return
        case 16: // 解绑IP
          this.$confirm('您确定要解绑该IP吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            removeFloatIpPorts({ id: row.fipId }).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.emit()
              }
            })
          })
          break
        case 17: // 重启
          tip = '您确定要重启该云主机吗？'
          action = 'softrestart'
          this.message(tip, action, row.id)
          break
        case 20: // 加入安全组
          this.addGroupData = {
            dialog: true,
            data: {
              id: row.id,
              groups: []
            }
          }
          break
        case 21: // 移除安全组
          this.removeGroupData = {
            dialog: true,
            data: {
              id: row.id,
              groups: []
            }
          }
          break
        case 22:
          this.setQosData = {
            dialog: true,
            data: {
              id: command.row.id,
              vendorId: command.row.vendorId
            }
          }
          break
        case 23:
          this.ipList = []
          this.setIpData = {
            dialog: true,
            data: {
              id: command.row.id,
              vendorId: command.row.vendorId,
              ip: command.row.monitorIp
            }
          }
          command.row.privateIpsList.forEach(item1 => {
            item1.addresses.forEach(item2 => {
              this.ipList.push(item2.address)
            })
          })
          if (command.row.floatingIp) {
            this.ipList.push(command.row.floatingIp)
          }
          break
        case 30:
          this.upgradeDialog = {
            visible: true,
            data: { ...row, service: 'openstack.standard.server' }
          }
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
    }
  },
  created() {}
}
</script>

<style scoped></style>
