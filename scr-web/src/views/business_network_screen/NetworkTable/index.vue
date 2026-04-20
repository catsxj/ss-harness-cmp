<template>
  <scroll-table :data="data" :column-width="['', '', '70px']" :columns="['名称','类型','IP地址','运行状态','健康状态','CPU使用率','内存使用率']" :options="{limitMoveNum: 5}">
    <template v-slot="scope">
      <scroll-table-column :value="scope.row.name">
      </scroll-table-column>
      <scroll-table-column :value="scope.row.type">
      </scroll-table-column>
      <scroll-table-column :value="scope.row.ip" width="70px">
      </scroll-table-column>
      <scroll-table-column>
        <StatusIcon :icon="getStatusIcon(scope.row.running)" />
      </scroll-table-column>
      <scroll-table-column>
        <StatusIcon :icon="getHealthIcon(scope.row.status)" />
      </scroll-table-column>
      <scroll-table-column>
        <Progress v-if="scope.row.cpu" :percent="scope.row.cpu"></Progress>
        <span v-else>未采集</span>
      </scroll-table-column>
      <scroll-table-column>
        <Progress v-if="scope.row.mem" :percent="scope.row.mem"></Progress>
        <span v-else>未采集</span>
      </scroll-table-column>
    </template>
  </scroll-table>
</template>
<script setup lang="ts">
import StatusIcon from './StatusIcon.vue'
import Progress from 'components/SimpleProgress/index.vue'

interface Props {
  data: Record<string, unknown>[]
}

defineProps<Props>()

function getStatusIcon(status: string): string {
  const map: Record<string, string> = {
    true: 'el-icon-success green',
    warning: 'el-icon-info yellow',
    false: 'el-icon-info red'
  }
  return map[status]
}

function getHealthIcon(status: string): string {
  const map: Record<string, string> = {
    RUNNING: 'el-icon-success green',
    WARN: 'el-icon-info yellow',
    EXCEPTION: 'el-icon-info red',
    ERROR: 'el-icon-info red'
  }
  return map[status]
}
</script>
<style lang="scss" scoped>
</style>
