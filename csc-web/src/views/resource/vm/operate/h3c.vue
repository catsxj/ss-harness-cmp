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
        <DelayService :data="scope" @getList="emit" style="width: 100%" v-if="(scope.expiredTime || '').indexOf('2099') === -1">
          <el-dropdown-item :disabled="scope.status == 'BUILDING'"> 延期 </el-dropdown-item>
        </DelayService>
        <el-dropdown-item :command="{ row: scope, index: 4 }" :disabled="scope.disStart || scope.isExpired || scope.allDisabled"> 开机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 5 }" :disabled="scope.disStop || scope.isExpired || scope.allDisabled"> 关机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 6 }" :disabled="scope.disRestart || scope.isExpired || scope.allDisabled"> 重启 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 7 }" :disabled="scope.disPaused || scope.isExpired || scope.allDisabled"> 暂停 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 8 }" v-if="scope.status === 'PAUSED'"> 恢复 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 9 }" :disabled="scope.disSuspended || scope.isExpired || scope.allDisabled"> 休眠 </el-dropdown-item>
        <el-dropdown-item :command="{ id: scope.id, index: 20 }" :disabled="scope.disControl || scope.isExpired || scope.allDisabled">控制台文件</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { patchVmId } from 'services/platform/index'
import UnsubscribeService from '../UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
import Assign from '../assign/index.vue'
import { downloadFile } from 'utils'
export default {
  props: {
    scope: {
      type: Object
    }
  },
  components: {
    UnsubscribeService,
    DelayService,
    Assign
  },
  data() {
    return {}
  },
  methods: {
    dropdownClick(command = {}) {
      const row = command.row
      const flag = command.index
      this.rowData = row
      let action = ''
      let tip = ''
      switch (flag / 1) {
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
        case 7: // 暂停
          tip = '您确定要暂停该主机？'
          action = 'pause'
          this.message(tip, action, row.id)
          break
        case 8: // 恢复
          tip = '您确定要恢复该主机？'
          action = 'recovery'
          this.message(tip, action, row.id)
          break
        case 9: // 休眠
          tip = '您确定要休眠该主机？'
          action = 'suspend'
          this.message(tip, action, row.id)
          break
        case 20:
          downloadFile(`/ims/v1/h3c/vms/${command.id}/console`)
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
  }
}
</script>
