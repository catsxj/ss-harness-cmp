<template>
  <div>
    <AdvanceTable title="网络安全组" :data="list" :columns="columns" :get-list="getData" :loading="loading">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <div slot="pagination"></div>
    </AdvanceTable>
  </div>
</template>
<script>
import { getSecurityGroup } from 'services/monitor'
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '安全组UUID',
    prop: 'groupUuid'
  },
  {
    label: '所属租户',
    prop: 'tenantName'
  }
]
export default {
  props: {
    detailId: {
      type: Number
    }
  },
  data() {
    return {
      columns,
      loading: false,
      params: {
        action: 'listsgroup',
        id: this.detailId
      },
      list: []
    }
  },
  methods: {
    getData() {
      this.loading = true
      getSecurityGroup(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data
        }
      })
    },
    // 详情
    getDetail(data) {
      this.detail = data
      this.$emit('getNetDetail', this.detail)
    }
  },
  created() {
    this.getData()
  }
}
</script>
<style></style>
