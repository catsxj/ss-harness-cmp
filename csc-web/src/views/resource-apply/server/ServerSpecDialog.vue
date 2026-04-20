<template>
  <el-dialog title="服务器规格框架" :visible.sync="addData.visible" width="1000px" append-to-body>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template #status="val">
        <status-icon :type="val | cpuStatusFilter('color')">{{ val | cpuStatusFilter }} </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.status === 1" @click="handleAdd(record)"> 编辑 </el-button>
        <el-button type="text" :disabled="record.status === 1" @click="handleDelete(record)"> 删除 </el-button>
        <el-button type="text" @click="handleStatus(record)"> {{ record.status === 1 ? '禁用' : '启用' }} </el-button>
      </template>
      <div slot="pagination"></div>
    </AdvanceTable>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.visible = false">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getServer, getBrand } from 'services/services/physicalSpec.js'
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'CPU主频', value: 'cpuFrequency' },
        { type: 'Input', label: 'CPU核心', value: 'cpuCoreNum' },
        { type: 'Input', label: '内存频率', value: 'memFrequency' },
        { type: 'Input', label: '内存容量', value: 'memSize' },
        {
          type: 'Select',
          label: 'CPU架构',
          value: 'cpuFramework',
          data: [
            { name: 'X86', id: 'x86' },
            { name: 'ARM', id: 'arm' },
            { name: 'C86', id: 'c86' }
          ]
        },
        {
          type: 'Const',
          label: '状态',
          value: 'status',
          initValue: 1
        }
      ],
      columns: [
        {
          label: '规格名称',
          prop: 'name'
        },
        {
          label: 'CPU架构',
          prop: 'cpuFramework'
        },
        {
          label: 'CPU主频(GHz)',
          prop: 'cpuHz'
        },
        {
          label: 'CPU核心',
          prop: 'cpuNum'
        },
        {
          label: '内存频率（MHz）',
          prop: 'memHz'
        },
        {
          label: '内存容量(GB)',
          prop: 'memSize'
        },
        {
          label: '硬盘容量(TB)',
          prop: 'diskSize'
        },
        {
          label: '单价(元/天）',
          prop: 'price'
        }
      ],
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 9999
      },
      total: 0
    }
  },
  methods: {
    async getData() {
      this.loading = true
      const data = await getServer(this.params).finally(() => (this.loading = false))
      if (!data.success) return
      this.list = data.data.rows
      this.total = data.data.total
    }
  }
}
</script>
