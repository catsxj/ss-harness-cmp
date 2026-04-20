<template>
  <div>
    <AdvanceTable :searchConfigs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" ref="multipleTable" :loading="loading"> </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
import { getVm, getCloudVendor } from 'services/platform/index'
import { getProject } from 'services/system/project'
import { downloadFile } from 'utils'
import { getTenant, getUser } from 'services/system/tenant'

export default {
  data() {
    return {
      columns: [
        {
          type: 'index'
        },
        {
          label: '工单类型',
          prop: '',
          scopedSlots: { customRender: '' }
        },
        {
          label: '应用系统名称',
          prop: ''
        },
        {
          label: '租户名称',
          prop: ''
        },
        {
          label: '所属用户',
          prop: ''
        },
        {
          label: '提交日期',
          prop: ''
        },
        {
          label: '工单状态',
          prop: '',
          scopedSlots: { customRender: '' }
        },
        {
          label: '云主机（台）',
          prop: ''
        },
        {
          label: 'vCPU（核）',
          prop: ''
        },
        {
          label: '内存（GB）',
          prop: 'projectName'
        },
        {
          label: '云硬盘（个）',
          prop: ''
        },
        {
          label: '存储容量（GB）',
          prop: ''
        }
      ],
      searchConfigs: [
        {
          type: 'Select',
          label: '工单类型',
          value: 'applyCategory',
          data: [
            { name: '资源申请', id: 'BatchApplicationOperate' },
            { name: '资源变更', id: 'BatchAlterationOperate' },
            { name: '资源回收', id: 'UnsubscribeOperate' },
            { name: '资源延期', id: 'BatchExtensionOperate' }
          ]
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          value: 'vendorId',
          type: 'Select',
          data: [],
          service: {
            api: getCloudVendor,
            params: {
              page: 1,
              rows: 9999
            },
            attr: 'data.rows'
          }
        },
        {
          type: 'Select',
          value: 'tenantId',
          label: '所属租户',
          data: [],
          service: {
            api: getTenant,
            params: {
              simple: true
            },
            attr: 'data.rows'
          }
        },
        {
          type: 'Select',
          value: 'userId',
          label: '所属用户',
          data: [],
          service: {
            api: getUser,
            params: {
              simple: true
            },
            attr: 'data.rows'
          }
        }
      ],
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      loading: false
    }
  },
  methods: {
    getData() {
      getVm(this.params).then((res) => {
        if (res.success) {
          this.list = res.data.rows
          this.total = res.data.total
        }
      })
    },
    handleExport() {
      // downloadFile('/rms/v1/reports/vms/download', this.params)
    }
  },
  created() {},
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}

.vm-region {
  height: 42px;
  width: 110px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 0 10px 0 0;
  border: 1px solid #ddd;
  line-height: 42px;
  font-size: 12px;
  text-align: center;
  color: #666;
  cursor: pointer;
  border-radius: 0;
  display: inline-block;
}

.vm-region:hover {
  border-color: #43bfe3 !important;
}

.vm-region-text {
  border-color: #43bfe3 !important;
}

.region-active {
  background-color: deepskyblue;
  color: #fff;
}
</style>
