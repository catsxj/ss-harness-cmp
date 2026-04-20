<template>
  <div>
    <el-button type="text" @click="modify(scope)">编辑</el-button>
    <div class="action-divider"></div>
    <el-button type="text" :disabled="scope.disClone || scope.disabled" size="medium" @click="cloneVm(scope)">克隆</el-button>
    <div class="action-divider"></div>
    <!-- <UnsubscribeService type="vm" url='vms' :data="scope" @getList="emit" :disabled="scope.status != 'STOPPED'">
    </UnsubscribeService>
    <div class="action-divider"></div> -->
    <el-dropdown @command="dropdownClick">
      <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
      <el-dropdown-menu slot="dropdown">
        <DelayService :data="scope" @getList="emit" style="width: 100%" v-if="(scope.expiredTime || '').indexOf('2099') === -1">
          <el-dropdown-item :disabled="scope.status == 'BUILDING'"> 延期 </el-dropdown-item>
        </DelayService>
        <el-dropdown-item :disabled="scope.disStart || scope.disabled" :command="{ id: scope.id, index: 4 }"> 开机 </el-dropdown-item>
        <el-dropdown-item :disabled="scope.disStop || scope.disabled" :command="{ id: scope.id, index: 5 }"> 关机 </el-dropdown-item>
        <el-dropdown-item :disabled="scope.disRestart || scope.disabled" :command="{ id: scope.id, index: 6 }"> 重启 </el-dropdown-item>
        <el-dropdown-item :disabled="scope.disSuspended || scope.disabled" :command="{ id: scope.id, index: 7 }"> 休眠 </el-dropdown-item>
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
import DelayService from '@/components/DelayService.vue'
import UnsubscribeService from '../UnsubscribeService.vue'
import UpgradeSpec from './dialog/UpgradeSpec.vue'
import ExpansionDisk from './dialog/ExpansionDisk.vue'
import AddDisk from './dialog/AddDisk.vue'
import Access from './dialog/access.vue'
export default {
  props: {
    scope: {
      type: Object
    }
  },
  components: {
    vcHot,
    setIp,
    DelayService,
    UpgradeSpec,
    ExpansionDisk,
    AddDisk,
    Access
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
    cloneVm(data) {
      this.$router.push({ name: 'ServiceEcsCreate', params: { serverId: data.id + '#' + data.name, vendorId: data.vendorId, type: 'FUSIONSPHERE' } })
    },
    dropdownClick(command = {}) {
      const flag = command.index
      let action = ''
      let tip = ''
      switch (flag / 1) {
        case 2: // 删除
          tip = '您确定要删除该主机？'
          action = 'recycle'
          this.message(tip, action, command.id)
          break
        case 4: // 开机
          tip = '您确定要启动该主机？'
          action = 'start'
          this.message(tip, action, command.id)
          break
        case 5: // 关机
          tip = '您确定要关闭该主机？'
          action = 'stop'
          this.message(tip, action, command.id)
          break
        case 6: // 重启
          tip = '您确定要重启该主机？'
          action = 'restart'
          this.message(tip, action, command.id)
          break
        case 7: // 休眠
          tip = '您确定要休眠该主机？'
          action = 'hibernated'
          this.message(tip, action, command.id)
          break
        case 14: // 延期
          this.$emit('time', command.row)
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
