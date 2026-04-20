<template>
  <div>
    <AdvanceTable title="节点列表" :data="list" :columns="columns">
      <template #tag="val, record">
        <el-tag>
          {{ 'status=' + record.tag.status }}
        </el-tag>
        <el-tag>
          {{ 'host=' + record.tag.host }}
        </el-tag>
      </template>
      <template #status="val">
        <status-icon :type="val == 'UP' ? 'success' : 'danger'">
          {{ val }}
        </status-icon>
      </template>
      <div slot="pagination"></div>
    </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
export default {
  props: {
    status: {
      type: String
    },
    list: {
      type: Array
    }
  },
  data() {
    return {
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '标签',
          prop: 'tag',
          scopedSlots: { customRender: 'tag' }
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        }
      ]
    }
  },
  methods: {},
  created() {}
}
</script>

<style></style>
