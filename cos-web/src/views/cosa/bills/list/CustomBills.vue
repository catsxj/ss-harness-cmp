<template>
  <div>
    <AdvanceTable :card-border="false" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <ImportData url="/api/cos/v1/bills/custom/import" @getData="getList" template-url="/cos/v1/bills/custom/template"></ImportData>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCustomBill(record.id)">执行</el-button>
        <el-button type="text" @click="handleExport(record.id)">导出</el-button>
        <el-button type="text" @click="deleteCustomBill(record.id)">删除</el-button>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" @goBack="goBack">
      <template v-slot:item_container>
        <basic-table :data="infoList" :get-list="() => {}">
          <!-- 唯一标识 起始时间 结束时间 金额 -->
          <el-table-column label="唯一标识" prop="instanceUuid" show-overflow-tooltip> </el-table-column>
          <el-table-column label="起始时间" prop="startTime" show-overflow-tooltip> </el-table-column>
          <el-table-column label="结束时间" prop="endTime" show-overflow-tooltip> </el-table-column>
          <el-table-column label="金额" prop="amount" show-overflow-tooltip> </el-table-column>
          <span slot="pagination"></span>
        </basic-table>
      </template>
    </common-detail>
  </div>
</template>

<script>
import { getCustomBill, handleCustomBill, deleteCustomBill, exportCustomBill, getCustomBillDetail } from 'services/services/bill'
import ImportData from '@/common/components/import-data/index.vue'

export default {
  components: { ImportData },
  data() {
    return {
      columns: [
        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        },
        {
          label: '创建人',
          prop: 'createName'
        },
        {
          label: '操作',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      loading: false,
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      detailFlag: false,
      infoList: [],
      searchConfigs: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async handleCustomBill(id) {
      const confirm = await this.$confirm('确定执行账单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      if (!confirm) return
      const res = await handleCustomBill(id)
      if (!res.success) return
      this.$message.success(res.message)
      this.getList()
    },
    handleExport(id) {
      exportCustomBill(id)
    },
    async deleteCustomBill(id) {
      const confirm = await this.$confirm('确定删除账单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      if (!confirm) return
      const res = await deleteCustomBill(id)
      if (!res.success) return
      this.$message.success(res.message)
      this.getList()
    },
    getDetail(id) {
      getCustomBillDetail(id).then((data) => {
        if (data.success) {
          this.detailFlag = true
          this.infoList = data.data
        }
      })
    },
    getList() {
      this.loading = true
      getCustomBill(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    goBack() {
      this.detailFlag = false
    }
  }
}
</script>
<style scoped>
.key-name {
  display: inline-block;
  width: 120px;
  text-align: right;
  margin-bottom: 10px;
}
.tenant-name {
  display: block;
  font-size: 30px;
  margin-left: 50px;
}
.count {
  font-size: 60px;
  font-weight: bolder;
  margin-left: 50px;
}
.el-tag--small {
  line-height: 32px;
  height: 32px;
}
</style>
