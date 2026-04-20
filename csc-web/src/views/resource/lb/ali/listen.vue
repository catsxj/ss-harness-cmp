<template>
  <div>
    <p>
      <el-button type="primary" icon="el-icon-add" @click="add" :disabled="listenData.modificationProtection === 'ConsoleProtection'">新增</el-button>
    </p>
    <AdvanceTable title="" :search-configs="[]" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template #operate="val, record">
        <el-button type="text" class="el-icon-edit" @click="edit(record)" :disabled="listenData.modificationProtection === 'ConsoleProtection'"> 编辑</el-button>
        <el-button type="text" class="el-icon-delete" @click="del(record.id)" :disabled="listenData.modificationProtection === 'ConsoleProtection'"> 删除</el-button>
      </template>
    </AdvanceTable>
  </div>
</template>
<script>
import { getLbListen, deleteBalanceWatch } from 'services/platform/index'
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '协议',
    prop: 'protocol'
  },
  {
    label: '端口',
    prop: 'port'
  },
  {
    label: '状态',
    prop: 'status'
  },
  {
    label: '所属地域',
    prop: 'regionName'
  },
  {
    label: '服务器组',
    prop: 'poolName'
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
    listenData: {
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
    read(row) {
      this.$emit('getListenerDetail', row)
    },
    getData() {
      this.loading = true
      getLbListen(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        lbId: this.listenData.id,
        vendorId: this.listenData.vendorId
      })
      this.getData()
    },
    add() {
      this.$emit('add')
    },
    edit(row) {
      this.$emit('edit', row)
    },
    del(id) {
      this.$confirm('此操作将永久删除该侦听器, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteBalanceWatch(id).then(data => {
            const type = data.success ? 'success' : 'error'
            this.$message[type](data.message)
            if (data.success) {
              this.getData()
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>
