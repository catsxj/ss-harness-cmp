<template>
  <div>
    <UnsubscribeService type="vm" url="vms" :data="scope" @getList="emit" :disabled="scope.status != 'STOPPED'"> </UnsubscribeService>
    <div class="action-divider"></div>
    <el-dropdown @command="dropdownClick">
      <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item :command="{ row: scope, index: 4 }" :disabled="scope.disStart || scope.isExpired || scope.allDisabled || (scope.vendorType == 'OPENSTACK' && scope.status == 'SUSPENDED')"> 开机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 5 }" :disabled="scope.disStop || scope.isExpired || scope.allDisabled || (scope.vendorType == 'OPENSTACK' && scope.status == 'SUSPENDED')"> 关机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 6 }" :disabled="scope.disRestart || scope.isExpired || scope.allDisabled"> 重启 </el-dropdown-item>
        <el-dropdown-item :disabled="scope.status == 'EXCEPTION'" :command="{ row: scope, index: 7 }"> 加入安全组 </el-dropdown-item>
        <el-dropdown-item :disabled="scope.status == 'EXCEPTION'" :command="{ row: scope, index: 8 }"> 移除安全组 </el-dropdown-item>
        <el-dropdown-item :disabled="scope.status != 'STOPPED'" :command="{ row: scope, index: 9 }"> 修改密码 </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <modify-pas :add-data="modifyPasswordData" v-if="modifyPasswordData.dialog"></modify-pas>
    <bind-ip :add-data="ipData" v-if="ipData.dialog"></bind-ip>
    <add-group :add-data="addGroupData" v-if="addGroupData.dialog"></add-group>
    <remove-group :add-data="removeGroupData" v-if="removeGroupData.dialog"></remove-group>
  </div>
</template>

<script>
import modifyPas from './dialog/txModifyPas.vue'
import bindIp from './dialog/bindIp.vue'
import addGroup from './dialog/txAddGroup.vue'
import removeGroup from './dialog/removeGroup.vue'
import { patchVmId } from 'services/platform/index'
import UnsubscribeService from '../UnsubscribeService.vue'
export default {
  props: {
    scope: {
      type: Object
    }
  },
  components: {
    modifyPas,
    bindIp,
    addGroup,
    removeGroup,
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
        case 2: // 删除
          tip = '您确定要删除该主机？'
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
        case 7: // 加入安全组
          this.addGroupData = {
            dialog: true,
            data: {
              id: row.id,
              vendorId: row.vendorId,
              regionId: row.regionId
            }
          }
          break
        case 8: // 移除安全组
          this.removeGroupData = {
            dialog: true,
            data: {
              id: row.id,
              groups: []
            }
          }
          break
        case 9: // 修改密码
          this.modifyPasswordData = {
            dialog: true,
            data: {
              id: row.id,
              vendorId: row.vendorId
            }
          }
          break
        case 14: // 延期
          this.$emit('time', row)
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
