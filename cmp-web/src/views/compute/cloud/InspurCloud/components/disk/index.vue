<template>
  <div class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" ref="containerMonitorTable">
      <!-- <template v-slot:action>
        <el-button type="ghost" @click="exportData"><i class="el-icon-download"></i> 导出</el-button>
      </template> -->
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="volumeColor(status)">
          {{ volume(status) }}
        </status-icon>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <el-card>
          <DiskDetail ref="detail" :detail-id="detailData.volumeUuid"></DiskDetail>
        </el-card>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { volumeColor, volume } from '@/filters/index'
import { exportVms } from 'services/monitor/index.js'
import { customColorMethod } from 'views/data'
import { getVolume } from 'services/platform/index'
import DiskDetail from './disk_detail.vue'
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '硬盘uuid',
    prop: 'volumeUuid'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '容量（G）',
    prop: 'size'
  },
  {
    label: '类型',
    prop: 'type'
  },
  {
    label: '可用性区域',
    prop: 'zone'
  },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  }
]
export default {
  components: {
    DiskDetail
  },
  data() {
    return {
      volumeColor,
      volume,
      columns,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId },
        { type: 'Const', value: 'vendorType', initValue: 'INSPURCLOUD' }
      ],
      customColorMethod,
      params: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      detailFlag: false,
      detailData: {},
      detailActiveName: 'detail',
      loading: false,
      resourceType: 'MONITOR_INSPURCLOUD_VM'
    }
  },
  methods: {
    // 导出数据
    exportData() {
      exportVms(this.params)
    },
    getList() {
      this.loading = true
      getVolume(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    getDetail(row) {
      this.detailData = Object.assign({}, row)
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    }
  }
}
</script>
