<template>
  <common-detail title="云平台资源总量" @goBack="detailData.visible = false">
    <template v-slot:item_container>
      <AdvanceTable :card-border="false" :before-search="beforeSearch" :data="list" :search-configs="searchConfigs" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading"> </AdvanceTable>
    </template>
  </common-detail>
</template>

<script>
import { getCapacityCount } from 'services/soa/resource'

export default {
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      searchConfigs: [{ type: 'Input', value: 'vendorName', label: '名称' }],
      columns: [
        {
          label: '名称',
          prop: 'vendorName'
        },
        {
          label: '平台类型',
          prop: 'vendorType'
        },
        {
          label: '物理机数量',
          prop: 'hostNum'
        },
        {
          label: '物理机CPU(核)',
          prop: 'hostCpu'
        },
        {
          label: '物理机内存(GB)',
          prop: 'hostMem'
        },
        {
          label: '磁盘(TB)',
          prop: 'hostDisk'
        },
        {
          label: '云主机数量',
          prop: 'vmNum'
        },
        {
          label: '云主机CPU(核)',
          prop: 'vmCpu'
        },
        {
          label: '云主机内存(GB)',
          prop: 'vmMem'
        },
        {
          label: '云主机磁盘(TB)',
          prop: 'vmDisk'
        }
      ],
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      loading: false
    }
  },
  methods: {
    beforeSearch({ listQuery }) {
      if (!listQuery) {
        return
      }
      this.params.vendorName = listQuery.vendorName
    },
    async getList() {
      this.loading = true
      const data = await getCapacityCount(this.params)
      if (data.success) {
        const { rows, total } = data.data.cloudResourceCapacities
        this.list = rows
        this.total = total
      }
      this.loading = false
    }
  }
}
</script>

<style scoped lang="scss">
.common-detail {
  ::v-deep .detail-body {
    background-color: #fff;
    height: 825px !important;
  }
}
</style>
