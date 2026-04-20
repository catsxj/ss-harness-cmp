<template>
  <div>
    <el-button type="text" @click="modify(scope)">编辑</el-button>
    <div class="action-divider"></div>
    <el-button type="text" :disabled="scope.disDel || scope.allDisabled || scope.terminationProtected" @click="dropdownClick({ index: 2, row: scope })"><i class="el-icon-delete"></i> 移入回收站 </el-button>
    <div class="action-divider"></div>
    <el-dropdown @command="dropdownClick">
      <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item :command="{ row: scope, index: 4 }" :disabled="scope.disStart || scope.isExpired || scope.allDisabled || (scope.vendorType == 'OPENSTACK' && scope.status == 'SUSPENDED')"> 开机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 5 }" :disabled="scope.disStop || scope.isExpired || scope.allDisabled || (scope.vendorType == 'OPENSTACK' && scope.status == 'SUSPENDED')"> 关机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 6 }" :disabled="scope.disRestart || scope.isExpired || scope.allDisabled"> 重启 </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <modify-pas :add-data="modifyPasswordData" v-if="modifyPasswordData.dialog"></modify-pas>
    <bind-ip :add-data="ipData" v-if="ipData.dialog"></bind-ip>
  </div>
</template>

<script>
import modifyPas from './dialog/opModifyPas.vue'
import bindIp from './dialog/bindIp.vue'
import { removeFloatIpPorts, getVmConsole, patchVm, patchVmId } from 'services/platform/index'
export default {
  props: {
    scope: {
      type: Object
    }
  },
  components: {
    modifyPas,
    bindIp
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
      }
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
          getVmConsole({
            vncType: 'novnc',
            serverId: row.instanceId,
            id: row.vendorId,
            region: 'nova'
          }).then(data => {
            if (data.success) {
              newWindow.location.href = data.data.url
            } else {
              newWindow.close()
            }
          })
          break
        case 2: // 删除
          tip = `您确定要将【${row.name}】移入回收站吗？`
          action = 'recycle'
          this.message(tip, action, row.id)
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
        case 20: // 升级配置
          this.$emit('upgradec', row)
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
