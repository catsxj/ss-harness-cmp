<template>
  <div>
    <AdvanceTable :data="list" :searchConfigs="superSearchList" :params="params" :total="total" :columns="columnList" :get-list="getData" :loading="loading" ref="table">
      <template #pass="pass">
        <span class="successColor" v-if="pass === '合规'">
          合规
        </span>
        <span class="failColor" v-else>
          不合规
        </span>
      </template>
      <template #passHost="passHost,record">
        <el-link type="success" @click="jumpCompliance(record.ip, 'passHost')">
          {{passHost}}
        </el-link>
      </template>
      <template #noPassHost="noPassHost,record">
        <el-link type="danger" @click="jumpCompliance(record.ip, 'noPassHost')">
          {{noPassHost}}
        </el-link>
      </template>
      <template #error="error,record">
        <el-link type="danger" @click="jumpErrorDetail(record.ip)">
          {{error}}
        </el-link>
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
import { getHistoryDetail } from 'services/task/compliance'

export default {
  props: {
    id: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    filterData: {
      type: Object
    }
  },
  data() {
    return {
      superSearchList: [],
      list: [],
      searchData: [],
      columnList: [],
      params: {
        page: 1,
        rows: 10,
        id: this.id,
        type: this.type,
        sorter: JSON.stringify({ gmtCreate: '1' })
      },
      total: 0
    }
  },
  created() {
    this.superSearch()
    this.initColumn()
  },
  methods: {
    async superSearch() {
      const passList = [
        {
          id: true,
          name: '合规'
        },
        {
          id: false,
          name: '不合规'
        }
      ]
      const commonSearchList = [
        {
          label: '资源组名称',
          value: 'groupName',
          type: 'Input',
          sign: 'LK'
        },
        {
          label: '合规基线项',
          value: 'itemName',
          type: 'Input',
          sign: 'LK'
        },
        {
          label: '主机名称',
          value: 'hostName',
          type: 'Input',
          sign: 'LK'
        },
        {
          label: '主机IP',
          value: 'ip',
          type: 'Input',
          sign: 'LK'
        },
        {
          label: '合规状态',
          value: 'pass',
          type: 'Select',
          sign: 'EQ',
          data: passList
        }
      ]
      const normalList = [
        {
          label: '基线项名称',
          value: 'name',
          type: 'Input',
          sign: 'LK'
        }
      ]
      switch (this.type) {
        case 'itemDetail': // 基线项详情
          this.superSearchList = normalList
          break
        case 'hostDetail': // 设备详情
          this.superSearchList = normalList
          break
        case 'complianceDetail': // 合规详情
          this.superSearchList = commonSearchList.slice()
          break
        case 'errorDetail': // 错误详情
          this.superSearchList = commonSearchList.slice(0, 6)
          break
      }
    },
    initColumn() {
      switch (this.type) {
        case 'itemDetail': // 基线详情
          this.columnList = [
            {
              label: '基线项名称',
              prop: 'itemName'
            },
            {
              label: '合规设备数',
              prop: 'passHost'
            },
            {
              label: '不合规设备数',
              prop: 'noPassHost'
            },
            {
              label: '错误设备数',
              prop: 'error'
            }
          ]
          break
        case 'hostDetail': // 设备详情
          this.columnList = [
            {
              label: '资源组名称',
              prop: 'groupName'
            },
            {
              label: '主机名称',
              prop: 'hostName'
            },
            {
              label: '主机IP',
              prop: 'ip'
            },
            {
              label: '合规数',
              prop: 'passHost',
              scopedSlots: { customRender: 'passHost' }
            },
            {
              label: '不合规数',
              prop: 'noPassHost',
              scopedSlots: { customRender: 'noPassHost' }
            },
            {
              label: '错误数',
              prop: 'error',
              scopedSlots: { customRender: 'error' }
            }
          ]
          break
        case 'complianceDetail': // 合规详情
          this.columnList = [
            {
              label: '资源组名称',
              prop: 'groupName'
            },
            {
              label: '主机名称',
              prop: 'hostName'
            },
            {
              label: '主机IP',
              prop: 'ip'
            },
            {
              label: '合规基线项',
              prop: 'itemName'
            },
            {
              label: '当前值',
              prop: 'result'
            },
            {
              label: '基线标准',
              prop: 'rule'
            },
            {
              label: '合规状态',
              prop: 'pass',
              scopedSlots: { customRender: 'pass' }
            }
          ]
          break
        case 'errorDetail': // 设备详情
          this.columnList = [
            {
              label: '资源组名称',
              prop: 'groupName'
            },
            {
              label: '主机名称',
              prop: 'hostName'
            },
            {
              label: '主机IP',
              prop: 'ip'
            },
            {
              label: '合规基线项',
              prop: 'itemName'
            },
            {
              label: '错误信息',
              prop: 'errorInfo'
            }
          ]
          break
      }
    },
    jumpCompliance(ip, type) {
      this.$emit('changeTab', 'complianceDetail', ip, type)
    },
    jumpErrorDetail(ip) {
      this.$emit('changeTab', 'errorDetail', ip, null)
    },
    getData(data) {
      getHistoryDetail(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    }
  }
}
</script>
<style>
.el-tooltip__popper {
  max-width: 40%;
}
</style>
<style lang="scss" scoped>
.color {
  color: #409eff;
}
.successColor {
  color: #67c23a;
}
.failColor {
  color: #f56c6c;
}
.clickPoint {
  display: inline-block;
  min-width: 40px;
  cursor: pointer;
}
</style>
