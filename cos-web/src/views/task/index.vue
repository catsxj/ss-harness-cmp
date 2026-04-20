<template>
  <AdvanceTable :title="$route.meta.title" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
    <template v-slot:action>
      <router-link :to="{ name: isOps ? 'ServiceOpsCreateTplPreview' : 'ServiceRosCreateTplPreview', query }">
        <el-button type="primary">订购实例</el-button>
      </router-link>
    </template>
    <template #status="val">
      <status-icon :type="val | statusFilter('color')">{{ val | statusFilter }} </status-icon>
    </template>
    <template #operate="val, record">
      <el-button type="text" @click="handleExe(record)" :disabled="record.status == 'unavailable'"> <i class="el-icon-help"></i> 执行 </el-button>
      <div class="action-divider"></div>
      <el-button type="text" @click="goHistory(record)"> <i class="el-icon-tickets"></i> 执行历史 </el-button>
    </template>
  </AdvanceTable>
</template>

<script>
import { defineComponent, watch, ref } from '@vue/composition-api'
import { getCos, removeTask, getRos, removeRos } from 'services/task/csc_task'
import useTable from 'hooks/useTable'
const columns = [
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '过期时间',
    prop: 'expiredTime'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
const searchConfigs = [
  {
    label: '名称',
    value: 'name',
    type: 'Input'
  }
]
export default defineComponent({
  filters: {
    statusFilter(value, type) {
      const valueMap = {
        available: '可用',
        unavailable: '不可用'
      }
      const colorMap = {
        unavailable: 'danger',
        available: 'success'
      }
      return type === 'color' ? colorMap[value] : valueMap[value]
    }
  },
  setup(props, context) {
    const { path } = context.root.$route
    const isOps = ref(path === '/task/cos')
    watch(
      () => context.root.$route.path,
      () => {
        context.root.$router.push({ name: 'Redirect', query: { path: context.root.$route.path } })
      }
    )
    const { getList, params, total, loading, list } = useTable({
      getService: isOps.value ? getCos : getRos
    })
    function handleExe(row) {
      const { id, inventory } = row
      const {
        configs: { templateId }
      } = JSON.parse(inventory)
      context.root.$router.push({
        name: 'ServiceTaskInstance',
        params: { id },
        query: { templateId, key: isOps.value ? 'cosId' : 'rosId' }
      })
    }
    function goHistory(row) {
      const { name, id } = row
      context.root.$router.push({
        name: 'TaskHistory',
        params: { id },
        query: { name, key: isOps.value ? 'cosId' : 'rosId' }
      })
    }
    return {
      isOps,
      list,
      getList,
      params,
      total,
      loading,
      columns,
      searchConfigs,
      handleExe,
      goHistory
    }
  },
  computed: {
    query() {
      return this.$route.query
    }
  }
})
</script>
