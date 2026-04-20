<template>
  <el-card class="wrapper">
    <AdvanceTable :searchConfigs="searchConfigs" title="物理机列表" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceServerCreate' }" class="m-r-md">
          <el-button type="primary">订购物理机</el-button>
        </router-link>
      </template>
      <template #instanceId="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="val">
        {{ val }}
      </template>
      <template #nics="val">
        <div v-for="(item, index) in val" :key="index">
          {{ item.ip }}
        </div>
      </template>
    </AdvanceTable>
    <detail :installDetail="detailData" v-if="detailData.dialog" @back="emit('back')"></detail>
  </el-card>
</template>

<script>
import { getServerList, removeServer, exportServerList } from 'services/resource/server'
import { getTenant } from 'services/system/tenant'
import { getProject } from 'services/system/project'
import { getBrand } from 'services/services/physicalSpec'
import detail from './detail.vue'

export default {
  components: {
    detail
  },
  data() {
    return {
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      loading: false,
      searchConfigs: [
        { label: '唯一标识', value: 'instanceId', type: 'Input' },
        {
          label: '状态记录',
          value: 'status',
          type: 'Select',
          data: [
            /* 状态选项 */
          ]
        },
        { label: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectId', type: 'Select', data: [], service: { api: getProject, params: { page: 1, rows: 9999, params: JSON.stringify([{ param: { queryAsManager: true }, sign: 'EQ' }]) }, attr: 'data.rows' } },
        { label: '机房', value: 'datacenter', type: 'Input' },
        { label: '机柜', value: 'rack', type: 'Input' },
        { label: '网卡', value: 'nic', type: 'Input' },
        { label: '品牌', value: 'brandId', type: 'Select', data: [], service: { api: getBrand, params: { simple: true }, attr: 'data.rows' } }
      ],
      columns: [
        { type: 'selection' },
        { label: '唯一标识', prop: 'instanceId', scopedSlots: { customRender: 'instanceId' } },
        { label: this.$store.getters.systemConfig.projectConfigLabel, prop: 'appName' },
        { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
        { label: 'CPU(核）', prop: 'cpuCoreNum' },
        { label: '内存(GB）', prop: 'memSize' },
        { label: '硬盘容量(TB）', prop: 'diskSize' },
        { label: '操作系统', prop: 'os' },
        { label: '机房', prop: 'room' },
        { label: '机柜', prop: 'cabinet' },
        { label: '品牌', prop: 'brandName' },
        { label: '设备类型', prop: 'deviceType' },
        { label: '设备型号', prop: 'deviceModel' },
        { label: '网卡', prop: 'nics', scopedSlots: { customRender: 'nics' } },
        { label: 'SN', prop: 'sn' },
        { label: 'ILO', prop: 'ilo' },
        { label: '所属用户', prop: 'userName' },
        { label: '出厂年份', prop: 'putOnTime' },
        { label: '维保年份', prop: 'maintainYear' }
      ],
      detailData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    getDetail(record) {
      this.detailData = {
        dialog: true,
        data: record
      }
    },
    getData() {
      // 实现获取数据的逻辑
      getServerList(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows.map(item => {
            item.cpuJson = JSON.parse(item.cpuJson || '{}')
            item.memJson = JSON.parse(item.memJson || '{}')
            item.disks = JSON.parse(item.diskJson || '[]')
            item.nics = JSON.parse(item.nic || '[]')
            item.parts = JSON.parse(item.partsJson || '[]')
            return item
          })
          this.total = data.data.total
        }
      })
    }
  }
}
</script>
