<template>
  <div>
    <p>
      <el-button type="primary" @click="add" :disabled="activeRow.modificationProtection === 'ConsoleProtection'">新增</el-button>
    </p>
    <AdvanceTable title="" :search-configs="[]" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template #name="val, record">
        <span class="detail-href" @click="read(record)">{{ val }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="edit(record)" :disabled="activeRow.modificationProtection === 'ConsoleProtection'">编辑</el-button>
        <el-button type="text" @click="del(record)" :disabled="activeRow.modificationProtection === 'ConsoleProtection'">删除</el-button>
      </template>
    </AdvanceTable>
  </div>
</template>
<script>
import { getLbPools, deleteLbPools } from 'services/platform/index'
const columns = [
  {
    label: '分组名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '分组ID',
    prop: 'poolUuid'
  },
  {
    label: '关联监听',
    prop: 'listeners'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  props: {
    activeRow: {
      type: Object
    }
  },
  data() {
    return {
      columns,
      loading: false,
      tableData: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0
    }
  },
  created() {
    this.handleSearch()
  },
  mounted() {},
  methods: {
    handleSearch() {
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.activeRow.vendorId,
        regionId: this.activeRow.region,
        lbId: this.activeRow.id
      })
      this.getData()
    },
    getData() {
      this.loading = true
      getLbPools(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    add() {
      this.$router.push({
        name: 'aliAddVs',
        params: {
          source: 'add',
          id: this.activeRow.id,
          vendorId: this.activeRow.vendorId
        },
        query: {
          vpcUuid: this.activeRow.vpcUuid
        }
      })
      sessionStorage.setItem('regionId', this.activeRow.region)
    },
    edit(row) {
      this.$router.push({
        name: 'aliAddVs',
        params: {
          source: 'edit',
          id: this.activeRow.id,
          vendorId: this.activeRow.vendorId
        },
        query: {
          vpcUuid: this.activeRow.vpcUuid
        }
      })
      sessionStorage.setItem('regionId', this.activeRow.region)
      sessionStorage.setItem('editRow', JSON.stringify(row))
      sessionStorage.setItem('editId', row.id)
    },
    read(row) {
      this.$router.push({
        name: 'aliAddVs',
        params: {
          source: 'read',
          id: this.activeRow.id,
          vendorId: this.activeRow.vendorId
        },
        query: {
          vpcUuid: this.activeRow.vpcUuid
        }
      })
      sessionStorage.setItem('regionId', this.activeRow.region)
      sessionStorage.setItem('editRow', JSON.stringify(row))
      sessionStorage.setItem('editId', row.id)
    },
    del(row) {
      this.$confirm('此操作将永久删除该虚拟服务器组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteLbPools(row.id).then(data => {
          const type = data.success ? 'success' : 'error'
          this.$message[type](data.message)
          if (data.success) {
            this.getData()
          }
        })
      })
    }
  }
}
</script>
