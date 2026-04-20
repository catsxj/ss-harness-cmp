<template>
  <div>
    <el-button type="text" @click="modify(scope)"> 编辑</el-button>
    <div class="action-divider"></div>
    <UnsubscribeService type="vm" url="vms" :data="scope" @getList="$emit('getList')" :disabled="scope.status != 'STOPPED'"> </UnsubscribeService>
    <div class="action-divider"></div>
    <template v-if="$store.state.app.userData.accountCategory !== 'User'">
      <Assign :detail="scope" type="Computer" @back="emit"></Assign>
      <div class="action-divider"></div>
    </template>
    <el-dropdown @command="dropdownClick" trigger="click">
      <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
      <el-dropdown-menu slot="dropdown">
        <DelayService :data="scope" @getList="emitFn" style="width: 100%" v-if="(scope.expiredTime || '').indexOf('2099') === -1">
          <el-dropdown-item :disabled="scope.status == 'BUILDING'"> 延期 </el-dropdown-item>
        </DelayService>
        <el-dropdown-item v-if="scope.azUuid" :command="{ row: scope, index: 7 }" :disabled="scope.status !== 'RUNNING'"> 控制台 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 4 }" :disabled="!['STOPPED', 'SUSPENDED'].includes(scope.status)"> 开机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 5 }" :disabled="!['SUSPENDED', 'RUNNING'].includes(scope.status)"> 关机 </el-dropdown-item>
        <el-dropdown-item :command="{ row: scope, index: 6 }" :disabled="scope.status !== 'RUNNING'"> 重启 </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
import UnsubscribeService from '../UnsubscribeService.vue'
import { patchVmId, getVmVnc } from 'services/platform/index'
import DelayService from '@/components/DelayService.vue'
import Assign from '../assign/index.vue'

interface DataProps {}
export default defineComponent({
  name: '',
  components: { UnsubscribeService, DelayService, Assign },
  props: {
    scope: {
      type: Object
    }
  },
  setup(props, { emit }) {
    const state = reactive({})
    const dropdownClick = async (command: any) => {
      const row = command.row
      const flag = command.index
      let action = ''
      let tip = ''
      switch (flag / 1) {
        case 4: // 开机
          tip = '您确定要启动该主机？'
          action = 'start'
          message(tip, action, row.id)
          break
        case 5: // 关机
          tip = '您确定要关闭该主机？'
          action = 'stop'
          message(tip, action, row.id)
          break
        case 6: // 重启
          tip = '您确定要重启该主机？'
          action = 'restart'
          message(tip, action, row.id)
          break
        case 7: // 控制台
          const { data } = await getVmVnc({ vendorId: row.vendorId, instanceId: row.instanceId })
          data && window.open(data)
          break
        default:
      }
    }
    const modify = (data: any) => {
      emit('modify', data)
    }
    const emitFn = () => {
      emit('goBack')
    }
    const message = (tip: string, action: string, id: number) => {
      MessageBox.confirm(tip, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { success, message } = await patchVmId(action, { id: id })
          if (success) {
            Message({
              type: 'success',
              message: message
            })
            emit('getList')
          }
        })
        .catch(() => {})
    }
    return { ...toRefs(state), dropdownClick, modify, emitFn }
  }
})
</script>
<style lang="scss" scoped></style>
