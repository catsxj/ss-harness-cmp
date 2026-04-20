<template>
  <div>
    <AdvanceTable v-show="!detailVisible" title="用户列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @selection-change="handleSelectionChange">
      <template #action>
        <el-button type="primary" @click="handleCreate()" icon="el-icon-plus">新增</el-button>
        <ImportData url="/api/sms/v1/users/import" @getData="getList" template-url="/sms/v1/users/import/template"></ImportData>
        <el-button @click="downloadUser" icon="el-icon-download">导出</el-button>
        <el-button @click="batchOperate('lock')" icon="el-icon-lock" :disabled="!selectionIds.length">批量冻结</el-button>
        <el-button @click="batchOperate('active')" icon="el-icon-unlock" :disabled="!selectionIds.length">批量解冻</el-button>
        <el-button @click="batchOperate('remove')" icon="el-icon-delete" :disabled="!selectionIds.length">批量删除</el-button>
      </template>
      <template #account="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #sex="val">
        <span>{{ sexFilter(val) }}</span>
      </template>
      <template #status="status">
        <status-icon :type="generalStatusFilter(status, 'color')">
          {{ generalStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate(record)"><i class="el-icon-edit"></i> 编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)"><i class="el-icon-delete"></i> 删除</el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleGrant(record.id)"> 角色授权 </el-dropdown-item>
            <el-dropdown-item @click.native="handleReset(record.id)"> 密码重置 </el-dropdown-item>
            <el-dropdown-item v-if="record.status === 'NORMAL'" @click.native="handleOperate(record, 'lock')"> 账户冻结 </el-dropdown-item>
            <el-dropdown-item v-if="record.status === 'ABNORMAL'" @click.native="handleOperate(record, 'active')"> 账户解冻 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <!--详情界面-->
    <UserDetail v-if="detailVisible" :user-data="addDialog.record" @goBack="goBack" />
    <!--新增编辑界面-->
    <AddDialog :tenant-list="tenantList" :dialog="addDialog" v-if="addDialog.visible" @getData="getList"></AddDialog>
    <!--重置密码-->
    <ResetPassword :dialog="resetDialog" v-if="resetDialog.visible" />
    <!-- 授权 -->
    <GrantRole :dialog="grantDialog" v-if="grantDialog.visible" />
  </div>
</template>
<script lang="ts">
import AddDialog from './AddDialog.vue'
import UserDetail from './UserDetail.vue'
import ResetPassword from './ResetPassword.vue'
import GrantRole from './GrantRole.vue'
import { getRole } from 'services/system/role'
import { getTenant } from 'services/system/tenant'
import { getUser, removeUser, operateManager, exportUser, batchOperateManager } from 'services/system/manager'
import { columns, searchConfigs as searchConfig, sexData } from './config'
import { defineComponent, ref } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
import { IUser } from '@/models/user'
import ImportData from '@/common/components/import-data/index.vue'
import useTable from 'hooks/useTable'
import useSelection from 'hooks/useSelection'
import { generalStatusFilter, sexFilter } from '@/filters/common'

export default defineComponent({
  components: { AddDialog, UserDetail, ResetPassword, GrantRole, ImportData },
  setup(props, context) {
    const { list, total, params, handleDelete, loading, getList } = useTable<IUser>({
      getService: getUser,
      removeService: removeUser
    })
    const searchConfigs = ref(searchConfig)
    const tenantList = ref([])
    async function getTenants() {
      const data = await getTenant({ page: 1, rows: 10000 })
      if (data.success) {
        tenantList.value = data.data.rows
        searchConfigs.value[4].data = tenantList.value
      }
    }
    getTenants()
    async function getRoles() {
      const data: any = await getRole({ simple: true })
      if (data.success) {
        searchConfigs.value[3].data = data.data.rows
      }
    }
    getRoles()
    // 创建
    const addDialog = ref({
      visible: false,
      record: {}
    })
    const handleCreate = (data: any) => {
      addDialog.value = {
        visible: true,
        record: { ...data }
      }
    }
    // 详情
    const detailVisible = ref(false)
    function getDetail(record: any) {
      addDialog.value.record = record
      detailVisible.value = true
    }
    function goBack() {
      detailVisible.value = false
    }
    // 操作
    function handleOperate(record: IUser, action: string) {
      let tip = ''
      switch (action) {
        case 'lock':
          tip = `是否冻结【${record.name}】？`
          break
        case 'active':
          tip = `是否解冻【${record.name}】？`
          break
      }
      MessageBox.confirm(tip, '提示', {
        type: 'warning'
      }).then(async () => {
        const res = await operateManager(Number(record.id), action)
        if (res.success) {
          Message.success(res.message)
          getList()
        }
      })
    }
    function batchOperate(action: string) {
      let tip = ''
      switch (action) {
        case 'lock':
          tip = '是否冻结这些用户？'
          break
        case 'active':
          tip = '是否解冻这些用户？'
          break
        case 'remove':
          tip = '是否删除这些用户？'
          break
      }
      MessageBox.confirm(tip, '提示', {
        type: 'warning'
      }).then(async () => {
        const res = await batchOperateManager(selectionIds.value, action)
        if (res.success) {
          Message.success(res.message)
          getList()
        }
      })
    }
    // 重置密码
    const resetDialog = ref({
      userId: 0,
      visible: false
    })
    function handleReset(userId: number) {
      resetDialog.value = {
        userId,
        visible: true
      }
    }
    // 授权角色
    const grantDialog = ref({
      userId: 0,
      visible: false
    })
    function handleGrant(userId: number) {
      grantDialog.value = {
        userId,
        visible: true
      }
    }
    function downloadUser() {
      const paramsArr: any = JSON.parse(params.value.params as string)
      selectionIds.value.length && paramsArr.push({ param: { id: selectionIds.value.join(',') }, sign: 'IN' })
      exportUser({ params: JSON.stringify(paramsArr) })
    }
    const { selectionIds, handleSelectionChange } = useSelection()
    return {
      generalStatusFilter,
      sexFilter,
      columns,
      searchConfigs,
      sexData,
      loading,
      list,
      total,
      params,
      handleDelete,
      tenantList,
      addDialog,
      getList,
      handleCreate,
      detailVisible,
      getDetail,
      goBack,
      handleOperate,
      batchOperate,
      resetDialog,
      handleReset,
      grantDialog,
      handleGrant,
      downloadUser,
      selectionIds,
      handleSelectionChange
    }
  }
})
</script>
