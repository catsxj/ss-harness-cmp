<template>
  <div>
    <smart-table :rows="10" title="节点列表" :data="list" :columns="columns">
      <el-table-column label="名称" prop="name" show-overflow-tooltip> </el-table-column>
      <el-table-column label="标签" prop="status" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-tag>
            {{ 'status=' + scope.row.tag.status }}
          </el-tag>
          <el-tag>
            {{ 'host=' + scope.row.tag.host }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" show-overflow-tooltip>
        <template slot-scope="scope">
          <status-icon :type="scope.row.status == 'UP' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </status-icon>
        </template>
      </el-table-column>
    </smart-table>
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
