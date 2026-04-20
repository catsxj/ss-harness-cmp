<template>
  <div>
    <AdvanceTable title="" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList">
      <template #action>
        <el-button type="primary" @click="openVisible">新增</el-button>
      </template>

      <template #isAuto="status">
        <status-icon :type="status | statusColor">
          {{ status | statusFilter }}
        </status-icon>
      </template>
      <template #type="val">
        {{ val === 'inside' ? '内部账单' : '外部账单' }}
      </template>
      <template #checkDay="val"> 每月第{{ val }}天 </template>
      <template #paymentDay="val"> 每月第{{ val }}天 </template>
      <template #operate="val, record">
        <el-button type="text" @click="openVisible(record)">编辑</el-button>
        <el-button type="text" @click="actionBill(record.id, record.isAuto)">{{ record.isAuto ? '禁用自动出账' : '启用自动出账' }}</el-button>
        <el-button type="text" @click="immediateBill(record.id)">立即出账</el-button>
        <el-button type="text" @click="remove(record.id)">删除</el-button>
      </template>
    </AdvanceTable>
    <addBills v-if="billDialog.visible" :billDialog="billDialog" @getList="getList"></addBills>
    <immediate v-if="immediateDialog.visible" :immediateDialog="immediateDialog" @getList="getList"></immediate>
  </div>
</template>
<script>
import { getConfiguration, deleteConfiguration, patchConfiguration } from '@/services/services/bill'
import { filtersBillsType } from '@/filters'
import addBills from './addBills.vue'
import immediate from './immediate.vue'
const columns = [
  {
    label: '账单名称',
    prop: 'name'
  },
  {
    label: '自动出账',
    prop: 'isAuto',
    scopedSlots: { customRender: 'isAuto' }
  },
  {
    label: '账单类别',
    prop: 'type',
    scopedSlots: { customRender: 'type' }
  },
  {
    label: '结账时间',
    prop: 'checkDay',
    scopedSlots: { customRender: 'checkDay' }
  },
  {
    label: '出账时间',
    prop: 'paymentDay',
    scopedSlots: { customRender: 'paymentDay' }
  },
  {
    label: '创建人',
    prop: 'creatorName',
    width: '90'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate',
    width: '150'
  },
  {
    label: '更新时间',
    prop: 'gmtModify',
    width: '150'
  },
  {
    label: '操作',
    width: '260',
    scopedSlots: { customRender: 'operate' }
  }
]

export default {
  components: { addBills, immediate },
  data() {
    return {
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      searchConfigs: [
        { type: 'Input', label: '账单名称', value: 'name' },
        {
          type: 'Select',
          label: '账单类别',
          value: 'type',
          data: [
            {
              name: '内部账单',
              id: 'inside'
            },
            {
              name: '外部账单',
              id: 'outside'
            }
          ]
        }
      ],
      columns,
      billDialog: {
        visible: false,
        title: '',
        type: 'add',
        data: null,
        formData: {
          name: '',
          resources: [],
          type: '',
          isAuto: false,
          checkDay: 1,
          paymentDay: 1
        }
      },
      loading: false,
      immediateDialog: {
        visible: false,
        title: '立即出账',
        data: null,
        formData: {
          month: '',
          action: 'expenditure'
        }
      }
    }
  },
  filters: {
    statusFilter(val) {
      return filtersBillsType(val)
    },
    statusColor(val) {
      return filtersBillsType(val, 'color')
    }
  },
  created() {},
  methods: {
    async getList() {
      this.billDialog.visible = false
      const { data, success } = await getConfiguration(this.params)
      if (success) {
        this.list = data.rows
        this.total = data.total
      }
    },
    openVisible(record) {
      this.billDialog.formData = {
        name: '',
        resources: [],
        type: '',
        isAuto: false,
        checkDay: 1,
        paymentDay: 1
      }
      if (record.id) {
        this.billDialog.data = record
        this.billDialog.type = 'edit'
      } else {
        this.billDialog.type = 'add'
      }
      this.billDialog.visible = true
    },

    remove(id) {
      this.$confirm('您确定要删除该账单配置吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { message, success } = await deleteConfiguration(id)
        if (success) {
          this.$message.success(message)
          this.getList()
        }
      })
    },
    actionBill(id, flag) {
      this.$confirm(`您确定要${flag ? '禁用' : '启用'}该账单配置吗?`, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const params = {
          action: flag ? 'stop' : 'start'
        }
        const { message, success } = await patchConfiguration(params, id)
        if (success) {
          this.$message.success(message)
          this.getList()
        }
      })
    },
    // 立即出账
    immediateBill(id) {
      this.immediateDialog.formData = {
        month: '',
        action: 'expenditure'
      }
      this.immediateDialog.visible = true
      this.immediateDialog.data = id
    }
  }
}
</script>
<style lang="scss" scoped></style>
