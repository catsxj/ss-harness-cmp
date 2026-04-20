<template>
  <div>
    <AdvanceTable title="账号列表" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList" @select="handleSelectItem" @select-all="handleSelectAll">
      <template #action>
        <el-button type="danger" @click="removeAll" :disabled="selectList.length === 0">删除</el-button>
      </template>
      <template #month="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="status | statusColor">
          {{ status | statusFilter }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="exportBills(record.id)">导出账单</el-button>
        <el-button type="text" @click="remove(record.id)">删除</el-button>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" :title="detailData.month" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="账期">{{ detailData.month }}</common-detail-item>
        <common-detail-item label="归属账单配置">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="账单总额">{{ detailData.money }}</common-detail-item>
        <common-detail-item label="出账时间">{{ detailData.gmtModify }}</common-detail-item>
      </template>
      <basic-table :data="detailTableList" :params="detailParams" :get-list="getDetailList" :total="detailTableTotal" v-if="detailData.type === 'inside'">
        <el-table-column label="资源池" prop="poolGroupName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="资源类型" prop="serviceName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="所属租户" prop="tenantName" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="$store.getters.systemConfig.projectConfigLabel" prop="projectName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="所属用户" prop="userName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="费用总额（元）" prop="money" show-overflow-tooltip> </el-table-column>
      </basic-table>
      <basic-table :data="detailTableList" :params="detailParams" :get-list="getDetailList" :total="detailTableTotal" v-else>
        <el-table-column label="云平台" prop="vendorName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="资源类型" prop="serviceName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="费用总额（元）" prop="money" show-overflow-tooltip> </el-table-column>
      </basic-table>
    </common-detail>
  </div>
</template>
<script>
import { getConfigurationResult, deleteConfigurationResult, exportConfiguration, getConfiguration, getConfigurationResultDetail, deleteAllConfigurationResult } from '@/services/services/bill'
import { filtersBillsResult } from '@/filters'
const columns = [
  {
    type: 'selection'
  },
  {
    label: '账期',
    prop: 'month',
    scopedSlots: { customRender: 'month' }
  },
  {
    label: '账单配置',
    prop: 'name'
  },
  {
    label: '账单总额（元）',
    prop: 'money'
  },
  {
    label: '出账结果',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '出账时间',
    prop: 'gmtModify'
  },

  {
    label: '操作',
    scopedSlots: { customRender: 'operate' }
  }
]

export default {
  components: {},
  data() {
    return {
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      searchConfigs: [
        {
          type: 'Select',
          label: '账单配置',
          value: 'configId',
          data: [],
          service: {
            api: getConfiguration,
            params: {
              page: 1,
              rows: 9999
            },
            attr: 'data.rows'
          }
        }
      ],
      columns,
      idList: [],
      selectList: [],
      detailData: {},
      detailParams: {
        page: 1,
        rows: 10
      },
      detailTableList: [],
      detailTableTotal: 0,
      detailFlag: false
    }
  },
  filters: {
    statusFilter(val) {
      return filtersBillsResult(val)
    },
    statusColor(val) {
      return filtersBillsResult(val, 'color')
    }
  },
  created() {},
  methods: {
    async getList() {
      const { data, success } = await getConfigurationResult(this.params)
      if (success) {
        this.list = data.rows
        this.total = data.total
      }
    },
    getDetail(data) {
      this.detailData = data
      this.detailFlag = true
      this.detailTableList = []
      this.detailTableTotal = 0
      this.detailParams = {
        page: 1,
        rows: 10
      }
      this.getDetailList()
    },
    getDetailList() {
      getConfigurationResultDetail(this.detailParams, this.detailData.id).then((res) => {
        if (res.success) {
          this.detailTableList = res.data.rows
          this.detailTableTotal = res.data.total
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    // 单选
    handleSelectItem(selection, row) {
      this.selectList = selection
      this.refreshId()
    },
    // 全选
    handleSelectAll(selection) {
      this.selectList = selection
      this.refreshId()
    },
    exportBills(id) {
      exportConfiguration(id).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
        }
      })
    },
    removeAll() {
      this.$confirm('您确定要批量删除该账单吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { message, success } = await deleteAllConfigurationResult(this.idList)
        if (success) {
          this.$message.success(message)
          this.getList()
        }
      })
    },

    remove(id) {
      this.$confirm('您确定要删除该账单吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { message, success } = await deleteConfigurationResult(id)
        if (success) {
          this.$message.success(message)
          this.getList()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
