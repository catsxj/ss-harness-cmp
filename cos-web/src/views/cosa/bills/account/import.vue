<template>
  <el-dialog :visible.sync="importVisible" title="导入账号">
    <AdvanceTable ref="tableRef" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList" @selection-change="handleSelectionChange">
      <template #type="val">
        <span class="type">
          <img :src="logoObj[val]" alt="" v-if="logoObj[val]" />
          <span>{{ val }}</span>
        </span>
      </template>
      <template #status="status">
        <status-icon :type="status | statusColor">
          {{ status | statusFilter }}
        </status-icon>
      </template>
    </AdvanceTable>
    <template #footer>
      <el-button @click="importVisible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>
<script>
import { getImportAccount, confirmImport } from 'services/services/bill'
import { logoObj } from './logo'
import { status } from '@/filters'
const columns = [
  {
    type: 'selection'
  },
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: '类型',
    prop: 'type',
    width: '160px',
    scopedSlots: { customRender: 'type' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '上次同步时间',
    prop: 'gmtModify'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  }
]
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    vendors: {
      type: Array,
      default: () => []
    }
  },
  filters: {
    statusFilter(val) {
      return status(val)
    },
    statusColor(val) {
      return status(val, 'color')
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.importVisible = val
      }
    },
    importVisible(val) {
      if (!val) {
        // this.selectObj = {}
        this.selectList = []
        this.$emit('close')
      }
    },
    vendors(val) {
      console.log(this.vendors)
      this.searchConfigs[1].data = val.map((item) => ({ name: item.label, id: item.value }))
    }
  },
  data() {
    return {
      importVisible: false,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        {
          type: 'Select',
          label: '类型',
          value: 'type',
          data: this.vendors.map((item) => ({ name: item.label, id: item.value }))
        },
        { type: 'Const', value: 'isPublic', initValue: true }
      ],
      columns,
      selectObj: {},
      selectList: [],
      logoObj
    }
  },
  methods: {
    async getList() {
      const { data, success } = await getImportAccount(this.params)
      if (success) {
        this.list = data.rows.filter((item) => this.vendors.map((item) => item.value).includes(item.type))
        this.total = this.list.length
        // this.$nextTick(() => {
        //   this.selectObj[this.params.page]?.length && this.selectObj[this.params.page].forEach(item => {
        //     const idx = this.list.findIndex(l => l.id == item.id)
        //     this.$refs.tableRef.toggleRowSelection(this.list[idx])
        //   })
        // })
      }
    },
    handleSelectionChange(val) {
      // this.selectObj[this.params.page] = val
      this.selectList = val
    },
    async confirm() {
      // let arr = []
      // for (const key in this.selectObj) {
      //   arr = [...arr, ...this.selectObj[key]]
      // }
      if (!this.selectList.length) {
        return this.$message.warning('请选择需要导入的账号')
      }
      const { message, success } = await confirmImport(
        this.selectList.map((item) => {
          const { name, type, uuid, authentication, remark, status, isDeleted, creatorId, menderId } = item
          return {
            vendorName: name,
            vendorType: type,
            uuid,
            authentication,
            remark,
            status,
            isDeleted,
            creatorId,
            menderId
          }
        })
      )
      if (success) {
        this.$message.success(message)
        this.importVisible = false
        this.$emit('success')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.type {
  display: flex;
  align-items: center;
  img {
    width: 30px;
    height: 22.733px;
    margin-right: 5px;
  }
}
</style>
