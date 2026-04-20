<template>
  <div>
    <el-button type="text" @click="modify(scope)">编辑</el-button>
    <div class="action-divider"></div>
    <UnsubscribeService type="vm" url="vms" :data="scope" @getList="emit"> </UnsubscribeService>
    <div class="action-divider"></div>
    <el-dropdown @command="dropdownClick">
      <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
      <el-dropdown-menu slot="dropdown">
        <DelayService :data="scope" @getList="emit" style="width: 100%" v-if="(scope.expiredTime || '').indexOf('2099') === -1">
          <el-dropdown-item :disabled="scope.status == 'BUILDING'"> 延期 </el-dropdown-item>
        </DelayService>
        <el-dropdown-item :command="{ row: scope, index: 1 }" :disabled="scope.disControl || scope.isExpired || scope.allDisabled"> 控制台 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 4 }" :disabled="scope.disStart || scope.isExpired || scope.allDisabled"> 开机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 5 }" :disabled="scope.disStop || scope.isExpired || scope.allDisabled"> 关机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 6 }" :disabled="scope.disRestart || scope.isExpired || scope.allDisabled"> 重启 </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { patchVmId, getVmConsole } from 'services/platform/index'
import UnsubscribeService from '../UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
export default {
  props: {
    scope: {
      type: Object
    }
  },
  components: {
    UnsubscribeService,
    DelayService
  },
  data() {
    return {
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
        case 1:
          const newWindow = window.open()
          const obj = {
            serverId: command.row.instanceId
          }
          if (command.row.vendorType == 'OPENSTACK') {
            obj.id = row.vendorId
            obj.region = 'nova'
            obj.vncType = 'novnc'
          }
          getVmConsole(command.row.id, obj).then(data => {
            if (data.success) {
              if (command.row.vendorType == 'OPENSTACK') newWindow.location.href = data.data.url ? data.data.url : data.data.uRL
              else newWindow.location.href = data.data
            } else {
              newWindow.close()
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
