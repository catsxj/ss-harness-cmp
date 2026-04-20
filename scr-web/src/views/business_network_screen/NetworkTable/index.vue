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
<script>
import { computed } from '@vue/composition-api'
import StatusIcon from './StatusIcon'
import Progress from 'components/SimpleProgress'
export default {
  components: { StatusIcon, Progress },
  props: {
    data: {
      type: Array
    }
  },
  setup(props) {
    function getStatusIcon(status) {
      const map = {
        true: 'el-icon-success green',
        warning: 'el-icon-info yellow',
        false: 'el-icon-info red'
      }
      return map[status]
    }
    function getHealthIcon(status) {
      const map = {
        RUNNING: 'el-icon-success green',
        WARN: 'el-icon-info yellow',
        EXCEPTION: 'el-icon-info red',
        ERROR: 'el-icon-info red'
      }
      return map[status]
    }
    return {
      getHealthIcon,
      getStatusIcon
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
