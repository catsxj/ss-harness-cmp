<template>
  <div>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleAdd"> 新增 </el-button>
        <ImportData url="/api/ims/v1/spec/parts/import" @getData="getData" template-url="/ims/v1/spec/parts/import/template"></ImportData>
        <el-button icon="el-icon-download" @click="exportPartsList">导出</el-button>
      </template>
      <template #status="val">
        <status-icon :type="val | cpuStatusFilter('color')">{{ val | cpuStatusFilter }} </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.status === 1" @click="handleEdit(record)"> 编辑 </el-button>
        <el-button type="text" :disabled="record.status === 1" @click="handleDelete(record)"> 删除 </el-button>
        <el-button type="text" @click="handleStatus(record)"> {{ record.status === 1 ? '禁用' : '启用' }} </el-button>
      </template>
    </AdvanceTable>
    <PartsAdd v-if="addData.visible" :addData="addData" @success="getData" />
  </div>
</template>

<script>
import { getParts, exportPartsList, deleteParts, modifyPartsStatus, getBrand } from 'services/services/physicalSpec.js'
import { cpuStatusFilter } from './configs'
import PartsAdd from './PartsAdd.vue'
import ImportData from '@/common/components/import-data/index.vue'
export default {
  components: { PartsAdd, ImportData },
  filters: {
    cpuStatusFilter
  },
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: '配件号', value: 'partNumber' },
        { type: 'Input', label: '配件类型', value: 'partType' },
        { type: 'Select', label: '品牌', value: 'brandId', data: [], service: { api: getBrand, params: { page: 1, rows: 1000 }, attr: 'data.rows' } },
        {
          type: 'Select',
          label: '状态',
          value: 'status',
          data: [
            { name: '已启用', id: 1 },
            { name: '已禁用', id: 0 }
          ]
        }
      ],
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '配件类型',
          prop: 'partType'
        },
        {
          label: '品牌',
          prop: 'brandName'
        },
        {
          label: '配件号',
          prop: 'partNumber'
        },
        {
          label: '规格',
          prop: 'spec'
        },
        {
          label: '适配机型',
          prop: 'compatibleModels'
        },
        {
          label: '性能指标',
          prop: 'performanceMetrics'
        },
        {
          label: '通道数量',
          prop: 'channelCount'
        },
        {
          label: '接口数量',
          prop: 'interfaceCount'
        },
        {
          label: '单价(元/天）',
          prop: 'price'
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
    exportPartsList() {
      exportPartsList(this.params)
    },
    async handleStatus(record) {
      const text = record.status ? '禁用' : '启用'
      const confirm = await this.$confirm(`确定要${text}该配件规格吗？`, '提示', {
        type: 'warning'
      })
      if (!confirm) return
      const data = await modifyPartsStatus(record.id, !record.status)
      if (!data.success) return
      this.$message.success(data.message)
      this.getData()
    },
    handleAdd() {
      this.addData.visible = true
      this.addData.data = {}
    },
    handleEdit(record) {
      this.addData.visible = true
      this.addData.data = record
    },
    async handleDelete(record) {
      const confirm = await this.$confirm('确定要删除该配件规格吗？', '提示', {
        type: 'warning'
      })
      if (!confirm) return
      const data = await deleteParts(record.id)
      if (!data.success) return
      this.$message.success(data.message)
      this.getData()
    },
    async getData() {
      this.loading = true
      const data = await getParts(this.params).finally(() => (this.loading = false))
      if (!data.success) return
      this.list = data.data.rows
      this.total = data.data.total
    }
  }
}
</script>
