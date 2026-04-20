<template>
  <div>
    <div>
      <AdvanceTable title="历史告警" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="currentMonitorTable">
        <template v-slot:action>
          <el-button type="ghost" @click="handleConfirm()" :disabled="!selectList.length"> 批量确认 </el-button>
        </template>
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
        </template>
        <template #level="level">
          <level-icon :color="alarmLevelColorFilter(level)">
            {{ alarmLevelFilter(level) }}
          </level-icon>
        </template>
        <template #type="type, record">
          {{ resourceTypeMonitorFilter(type) }}<span v-if="type == 'VM'">({{ record.osCategory }})</span>
        </template>
        <template #confirmed="confirmed, record"> {{ confirmed ? '已确认' : '未确认' }}，{{ record.solved ? '已清除' : '未清除' }} </template>
        <template #operate="val, record">
          <el-button type="text" @click="handleConfirm(record.id)" :disabled="record.confirmed"> <i class="el-icon-check"></i> 确认 </el-button>
        </template>
      </AdvanceTable>
    </div>
    <common-detail-right v-if="detailFlag" :setting="{ type: 'host' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="告警名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="告警级别">
          <level-icon :color="alarmLevelColorFilter(detailData.level)">{{ alarmLevelFilter(detailData.level) }} </level-icon>
        </common-detail-item>
        <common-detail-item label="告警源">
          <div>{{ detailData.targetName }}</div>
        </common-detail-item>
        <common-detail-item label="资源类型">{{ resourceTypeMonitorFilter(detailData.type) }}</common-detail-item>
        <common-detail-item label="告警状态">{{ detailData.status1 }}</common-detail-item>
        <common-detail-item label="告警内容">{{ detailData.remark }}</common-detail-item>
        <common-detail-item label="告警恢复值">{{ detailData.recoveryVal }}</common-detail-item>
        <common-detail-item label="告警触发时间">{{ detailData.gmtTrigger }}</common-detail-item>
        <common-detail-item label="已持续时长">{{ detailData.duration }}</common-detail-item>
        <common-detail-item label="确认人">{{ detailData.confirmer }}</common-detail-item>
        <common-detail-item label="确认时间">{{ detailData.gmtConfirm }}</common-detail-item>
        <common-detail-item label="解决人">{{ detailData.solver }}</common-detail-item>
        <common-detail-item label="解决时间">{{ detailData.gmtSolve }}</common-detail-item>
        <common-detail-item label="解决详情">{{ detailData.dealResult }}</common-detail-item>
      </template>
    </common-detail-right>
  </div>
</template>

<script>
import { getAlarmList, getAlarmDetail, alarmConfirm } from 'services/monitor'
import { alarmLevelFilter, alarmLevelColorFilter, resourceTypeMonitorFilter } from '@/filters/index'
import { conditionCloudVendor, getResourceList } from 'services/platform/index'
import levelIcon from 'views/components/statusIcon.vue'
import { catalogList } from '@/views/data'
const statusData = [
  { name: '未确认', value: 'UNCONFIRMED' },
  { name: '已确认', value: 'CONFIRMED' }
]
const alarmLevelData = [
  { name: '提示告警', value: 'REMIND' },
  { name: '次要告警', value: 'SECONDARY' },
  { name: '重要告警', value: 'PRIMARY' },
  { name: '紧急告警', value: 'URGENT' }
]
const columns = [
  {
    type: 'selection',
    disabled: true
  },
  {
    label: '告警名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '告警级别',
    prop: 'level',
    scopedSlots: { customRender: 'level' }
  },
  {
    label: '告警源',
    prop: 'targetName'
  },
  {
    label: '资源类型',
    prop: 'type',
    scopedSlots: { customRender: 'type' }
  },
  {
    label: '告警状态',
    prop: 'confirmed',
    scopedSlots: { customRender: 'confirmed' }
  },
  {
    label: '告警内容',
    prop: 'remark'
  },
  {
    label: '告警恢复值',
    prop: 'recoveryVal'
  },
  {
    label: '告警触发时间',
    prop: 'gmtTrigger'
  },
  {
    label: '已持续时长',
    prop: 'duration'
  },
  {
    label: '确认人',
    prop: 'confirmer'
  },
  {
    label: '确认时间',
    prop: 'gmtConfirm'
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '160px',
    showOverflowTooltip: false,
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {
    levelIcon
  },
  data() {
    return {
      alarmLevelFilter,
      alarmLevelColorFilter,
      resourceTypeMonitorFilter,
      columns,
      loading: false,
      statusData,
      alarmLevelData,
      catalogList,
      searchConfigs: [
        { type: 'Input', label: '告警源', value: 'targetName' },
        { type: 'Select', label: '资源类型', value: 'type', data: [], props: { value: 'value' } },
        {
          type: 'Select',
          label: '所属平台',
          value: 'vendorId',
          data: [],
          service: {
            api: conditionCloudVendor,
            params: {
              condition: JSON.stringify({
                condition: 'listByTypes',
                types: ['OPENSTACK', 'EASYSTACK', 'VMWARE', 'INSPURRAIL', 'FUSIONCLOUD', 'HMC', 'MANAGEONE', 'KUBERNETES', 'TIANYI', 'HUAWEI', 'H3C', 'ALIYUN', 'SMARTX', 'CLOUDTOWER', 'ZSTACK', 'CECSTACK', 'FUSIONSPHERE', 'QCLOUD', 'USPHERE', 'CNWARE', 'AZURE', 'YYJQCLOUD']
              })
            },
            attr: 'data'
          }
        },
        { type: 'Select', label: '告警级别', value: 'level', data: alarmLevelData, props: { value: 'value' } },
        { type: 'DateRange', value: 'gmtTrigger', label: '' },
        { type: 'Const', value: 'eventAlarm', initValue: 0 },
        { type: 'Const', value: 'status', initValue: 'SOLVED' }
      ],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      list: [],
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {}
    }
  },
  created() {
    getResourceList().then(({ data, success }) => {
      if (success) {
        this.searchConfigs[1].data = data.rows.map((item) => ({ ...item, value: item.resourceType }))
      }
    })
  },
  beforeDestroy() {},
  methods: {
    getList() {
      this.refreshId()
      this.loading = true
      getAlarmList(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.currentMonitorTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    // 查询
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleSelectItem(selection, row) {
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
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach((item) => {
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
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    handleConfirm(id) {
      this.refreshId()
      let list = []
      if (id) {
        list.push(id)
      } else {
        list = this.idList
      }
      this.$confirm('确定要确认告警吗?', '提示', {
        confirmButtonText: '确认',
        confirmButtonClass: 'el-button--primary',
        type: 'warning'
      })
        .then(() => {
          alarmConfirm({
            ids: list
          }).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    getDetail(id) {
      getAlarmDetail(id).then((data) => {
        if (data.success) {
          this.detailData = data.data
          let str1, str2
          if (this.detailData.confirmed) {
            str1 = '已确认'
          } else {
            str1 = '未确认'
          }
          if (this.detailData.solved) {
            str2 = '已清除'
          } else {
            str2 = '未清除'
          }
          this.detailData.status1 = str1 + '，' + str2
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    }
  }
}
</script>
<style scoped></style>
