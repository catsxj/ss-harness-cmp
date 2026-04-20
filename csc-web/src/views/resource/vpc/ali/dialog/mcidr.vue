<template>
  <div>
    <basic-form :model="searchData" :inline="true">
      <basic-form-item label="开启IPV6: ">
        <el-switch v-model="searchData.switch" :disabled="rowData.ipv6Cidr !== '' && rowData.ipv6Cidr != null" @change="changeSwitch"></el-switch>
      </basic-form-item>
      <basic-form-item>
        <el-button type="ghost" icon="el-icon-add" @click="add">添加附加Ipv4网段</el-button>
      </basic-form-item>
    </basic-form>
    <AdvanceTable title="" :search-configs="[]" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading" ref="table">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #type="type">
        <span v-if="type === 'Primary'">主网段</span>
        <span v-if="type === 'Secondary'">附加网段</span>
        <span v-if="type === 'IPV6'">IPV6</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.type === 'Primary'" @click="remove(record)"> <i class="el-icon-delete"></i> 删除 </el-button>
      </template>
    </AdvanceTable>
  </div>
</template>
<script>
import { getIpvs, operationIpvs } from 'services/platform/index'
const columns = [
  {
    label: '网段',
    prop: 'cidrBlock'
  },
  {
    label: '类型',
    prop: 'type',
    scopedSlots: { customRender: 'type' }
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
    rowData: {
      type: Object
    },
    addData: {
      type: Object
    }
  },
  data() {
    return {
      columns,
      loading: false,
      searchData: {
        switch: false
      },
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
    if (this.rowData.ipv6Cidr !== '' && this.rowData.ipv6Cidr != null) {
      this.searchData.switch = true
    }
  },
  mounted() {},
  methods: {
    add() {
      this.$emit('addmcidr')
    },
    changeSwitch() {
      if (this.searchData.switch) {
        operationIpvs(this.rowData.id, {
          action: 'associateIpv6'
        }).then(data => {
          const type = data.success ? 'success' : 'error'
          this.$message[type](data.message)
        })
      }
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        ...this.addData.data
      })
      this.getData()
    },
    getData() {
      this.loading = true
      getIpvs(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
        }
      })
    },
    remove(row) {
      operationIpvs(this.addData.addRow.id, {
        action: 'disassociate',
        params: JSON.stringify({
          id: row.id
        })
      }).then(data => {
        const type = data.success ? 'success' : 'error'
        this.$message[type](data.message)
        if (data.success) {
          this.addData.dialog = false
          this.getData()
        }
      })
    }
  }
}
</script>
