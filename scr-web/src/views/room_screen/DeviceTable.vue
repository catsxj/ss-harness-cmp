<template>
  <scroll-table :data="data" :columns="['设备名称','当前值','正常值']" :options="{singleHeight: 40}">
    <template v-slot="scope">
      <scroll-table-column :value="scope.row.name">
      </scroll-table-column>
      <scroll-table-column :value="scope.row.current">
      </scroll-table-column>
      <scroll-table-column :value="scope.row.normal">
      </scroll-table-column>
    </template>
  </scroll-table>
</template>
<script setup lang="ts">
interface DeviceItem {
  name: string
  current: string | number
  normal: string | number
}

interface Props {
  data: DeviceItem[]
}

defineProps<Props>()
</script>
<style lang="scss" scoped>
</style>
