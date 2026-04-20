<template>
  <div>
    <basic-table :data="tableData">
      <el-table-column label="名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="detail-href" @click="getDetail(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
      <el-table-column prop="groupUuid" label="安全组UUID" show-overflow-tooltip></el-table-column>
      <el-table-column prop="tenantName" label="所属租户" show-overflow-tooltip></el-table-column>
      <div slot="pagination"></div>
    </basic-table>
  </div>
</template>
<script>
import { getSecurityGroup } from 'services/monitor'
import { detailGroup, getGroupRule } from 'services/platform/index'
export default {
  props: {
    detailId: {
      type: Number
    }
  },
  data() {
    return {
      params: {
        action: 'listsgroup',
        id: this.detailId
      },
      tableData: []
    }
  },
  methods: {
    getData() {
      getSecurityGroup(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data
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
