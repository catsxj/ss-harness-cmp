<template>
  <div>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{val}}</span>
      </template>
      <template #status="status">
        <status-icon :type="vmStatusColorFilter(status)">{{openstackServerFilter(status)}}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleMonitorDetail(record.id, record.name)"> 告警详情</el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            更多<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleLink(record.id)">
              关联规则
            </el-dropdown-item>
            <el-dropdown-item @click.native="handlePolicy(record)">
              {{`${record.alarmEnable ? '屏蔽':'开启'}告警`}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <detail :detail-id="detailId" :identifier="identifier" :address="address"></detail>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { vmStatusColorFilter, openstackServerFilter } from '@/filters/index'
import { getRuleGroupBind, getDataStore } from 'services/monitor/index.js'
import { detailCloudVendor } from 'services/platform/index'
import detail from './dataStoresDetail.vue'
import { handleStart } from 'views/data'
import addPolicy from 'views/components/linkPolicy.vue'
const columns = [
  {
    type: 'selection',
    disabled: true
  },
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
    label: '类型',
    prop: 'type'
  },
  {
    label: '空间总量(GB)',
    prop: 'capacity'
  },
  {
    label: '空闲空间(GB)',
    prop: 'freeSpace'
  },
  {
    label: '关联主机',
    prop: 'hostNum'
  },
  {
    label: '关联云主机',
    prop: 'vmNum'
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '160px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {
    detail, addPolicy
  },
  data () {
    return {
      vmStatusColorFilter,
      openstackServerFilter,
      columns,
      handleStart,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId }
      ],
      params: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      idList: [],
      selectList: [],
      detailFlag: false,
      detailId: null,
      identifier: '',
      loading: false,
      address: '',
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_VCENTER_DATASTORE'
    }
  },
  methods: {
    getAddress () {
      detailCloudVendor(this.$route.query.vendorId).then(data => {
        if (data.success) {
          const detailData = data.data;
          this.address = JSON.parse(detailData.authentication).address
        }
      })
    },
    getList () {
      this.refreshId()
      getDataStore(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            item.cpuUsage = Number(item.cpuUsage)
            item.memUsage = Number(item.memUsage)
            if (item.privateIps) {
              item.privateIps = JSON.parse(item.privateIps)
            }
            switch (item.onOffStatus) {
              case '0':
                item.onOffStatus = '断开'
                break;
              case '1':
                item.onOffStatus = '正常'
                break;
              default:
                item.onOffStatus = '未知'
                break;
            }
            const self = this;
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.resourceMonitorTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    handleSelectItem (selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    handleSelectAll (selection) {
      this.refreshId()
      if (selection.length) { // 全选情况下
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else { // 全不选情况下
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    refreshId () {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    handleSearch (params) {
      this.params.page = 1
      this.params.params = params
      this.getList();
    },
    handleLink (id, flag) {
      this.ruleGroupIds = []
      this.resourceId = id;
      getRuleGroupBind(id).then(data => {
        if (data.success) {
          this.ruleGroupIds = data.data
          this.addFlag = true
        }
      })
    },
    cancle () {
      this.addFlag = false
      this.getList()
    },
    handlePolicy (data) {
      this.handleStart(this, data, this.resourceType)
    },
    getDetail (row) {
      this.detailId = row.id;
      this.identifier = row.name;
      this.detailData = {
        name: row.name
      }
      this.detailFlag = true
    },
    goBack () {
      this.detailFlag = false
    },
    handleMonitorDetail (id, name) {
      this.$router.push({
        name: 'MonitorDetailList',
        query: { id: id, name: name, type: this.resourceType }
      })
    }
  },
  created () {
    this.getAddress();
  }
}
</script>
