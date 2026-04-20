<template>
  <div>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleAdd"> 新增 </el-button>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleEdit(record)"> 编辑 </el-button>
        <el-button type="text" @click="handleDelete(record)"> 删除 </el-button>
      </template>
    </AdvanceTable>
    <BrandAdd v-if="addData.visible" :addData="addData" @success="getData" />
  </div>
</template>

<script>
import { getBrand, deleteBrand } from 'services/services/physicalSpec.js'
import BrandAdd from './BrandAdd'
export default {
  components: { BrandAdd },
  data() {
    return {
      searchConfigs: [{ type: 'Input', label: '名称', value: 'name' }],
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '创建人',
          prop: 'creatorName'
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        },
        {
          label: '操作',
          width: '160px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      addData: {
        visible: false,
        data: {}
      }
    }
  },
  methods: {
    handleAdd() {
      this.addData.visible = true
      this.addData.data = {}
    },
    handleEdit(record) {
      this.addData.visible = true
      this.addData.data = record
    },
    async handleDelete(record) {
      const confirm = await this.$confirm('确定要删除该品牌吗？', '提示', {
        type: 'warning'
      })
      if (!confirm) return
      const data = await deleteBrand(record.id)
      if (!data.success) return
      this.$message.success(data.message)
      this.getData()
    },
    async getData() {
      this.loading = true
      const data = await getBrand(this.params).finally(() => (this.loading = false))
      if (!data.success) return
      this.list = data.data.rows
      this.total = data.data.total
    }
  }
}
</script>
