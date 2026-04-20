<template>
  <div>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleAdd()"> 新增 </el-button>
        <ImportData url="/api/ims/v1/spec/server/import" @getData="getData" template-url="/ims/v1/spec/server/import/template"></ImportData>
        <el-button icon="el-icon-download" @click="exportServerList">导出</el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="val">
        <status-icon :type="val | cpuStatusFilter('color')">{{ val | cpuStatusFilter }} </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.status === 1" @click="handleAdd(record)"> 编辑 </el-button>
        <el-button type="text" :disabled="record.status === 1" @click="handleDelete(record)"> 删除 </el-button>
        <el-button type="text" @click="handleStatus(record)"> {{ record.status === 1 ? '禁用' : '启用' }} </el-button>
      </template>
    </AdvanceTable>
    <ServerAdd v-if="addData.visible" :addData="addData" @success="getData" />
    <ServerDetail :installDetail="detailData.data" v-if="detailData.dialog" @goBack="detailData.dialog = false"></ServerDetail>
  </div>
</template>

<script>
import { getServer, exportServerList, deleteServer, modifyServerStatus, getBrand } from 'services/services/physicalSpec.js'
import { cpuStatusFilter } from './configs'
import ServerAdd from './ServerAdd'
import ServerDetail from './ServerDetail.vue'
import ImportData from '@/common/components/import-data/index.vue'
export default {
  components: { ServerAdd, ServerDetail, ImportData },
  filters: {
    cpuStatusFilter
  },
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: '型号', value: 'model' },
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
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '品牌',
          prop: 'brandName'
        },
        {
          label: '型号',
          prop: 'model'
        },
        {
          label: 'CPU数量(核)',
          prop: 'cpuNum'
        },
        {
          label: 'CPU路数(个)',
          prop: 'cpuSlotCount'
        },
        {
          label: '内存数量',
          prop: 'memSize'
        },
        {
          label: '内存插槽数量(个)',
          prop: 'memSlotCount'
        },
        {
          label: '硬盘容量(TB)',
          prop: 'diskSize'
        },
        {
          label: 'U数',
          prop: 'uCount'
        },
        {
          label: 'PCI插槽数(个)',
          prop: 'pciSlotCount'
        },
        {
          label: '电源接口数(个)',
          prop: 'powerInterfaceCount'
        },
        {
          label: '硬盘槽位数(个)',
          prop: 'diskSlotCount'
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
        data: {
          diskSpecIds: [
            {
              id: ''
            }
          ],
          partsSpecIds: [{ partType: '', id: '' }]
        }
      },
      detailData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    exportServerList() {
      exportServerList(this.params)
    },
    getDetail(record) {
      this.detailData = {
        dialog: true,
        data: record
      }
    },
    async handleStatus(record) {
      const text = record.status ? '禁用' : '启用'
      const confirm = await this.$confirm(`确定要${text}该服务器规格吗？`, '提示', {
        type: 'warning'
      })
      if (!confirm) return
      const data = await modifyServerStatus(record.id, !record.status)
      if (!data.success) return
      this.$message.success(data.message)
      this.getData()
    },
    handleAdd(record = {}) {
      this.addData.visible = true
      this.addData.data = {
        ...record,
        diskSpecIds: JSON.parse(record.diskSpecIds || '[]').map((id) => {
          const obj = (record.diskSpecList || []).find((part) => part.id === id)
          return {
            id: obj.id
          }
        }),
        // 根据 partsSpecIds 来获取 partsSpecList
        partsSpecIds: JSON.parse(record.partsSpecIds || '[]').map((id) => {
          const obj = (record.partsSpecList || []).find((part) => part.id === id)
          return {
            partType: obj.partType,
            id: obj.id
          }
        })
      }
    },
    async handleDelete(record) {
      const confirm = await this.$confirm('确定要删除该服务器规格吗？', '提示', {
        type: 'warning'
      })
      if (!confirm) return
      const data = await deleteServer(record.id)
      if (!data.success) return
      this.$message.success(data.message)
      this.getData()
    },
    async getData() {
      this.loading = true
      const data = await getServer(this.params).finally(() => (this.loading = false))
      if (!data.success) return
      this.list = data.data.rows.map((item) => {
        item.diskSpecList = JSON.parse(item.diskSpecIds || '[]').map((id) => {
          return (item.diskSpecList || []).find((part) => part.id === id)
        })
        item.partsSpecList = JSON.parse(item.partsSpecIds || '[]').map((id) => {
          return (item.partsSpecList || []).find((part) => part.id === id)
        })
        return item
      })
      this.total = data.data.total
    }
  }
}
</script>
