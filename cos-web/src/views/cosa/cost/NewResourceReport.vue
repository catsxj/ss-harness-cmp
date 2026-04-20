<template>
  <AdvanceTable title="新增资源报表" :isInitSearch="false" :searchConfigs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total">
    <template v-slot:action>
      <TimeSelect ref="timeSelectRef" @success="getData">
        <el-button type="primary" @click="handllExport()"> 导出 </el-button>
      </TimeSelect>
    </template>
  </AdvanceTable>
</template>

<script>
import { getNewResourceList, downloadNewResourceList } from '@/services/soa/costAnalysis'
import Block from './components/Block.js'
import TimeSelect from './components/TimeSelect.vue'
export default {
  mixins: [Block],
  components: { TimeSelect },
  data() {
    return {
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      columns: [
        {
          label: '月份',
          prop: 'month'
        },
        {
          label: '总增加成本(元)',
          prop: 'totalMoney'
        },
        {
          label: 'CPU增加量(核)',
          prop: 'totalCpu'
        },
        {
          label: '内存增加量(GB)',
          prop: 'totalMemory'
        },
        {
          label: '存储增加量(GB)',
          prop: 'totalDisk'
        },
        {
          label: '虚拟机增加量(台)',
          prop: 'totalServer'
        }
      ],
      searchConfigs: []
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      const params = this.$refs.timeSelectRef.params
      if (params.type !== 'Years' && params.year && !params.month) return this.$message.error('请选择月份')
      getNewResourceList({ page: this.params.page, rows: this.params.rows, time: JSON.stringify(params.time) }).then((res) => {
        setTimeout(() => {
          this.GeneratorBlockComponent([
            {
              name: '总增加成本',
              value: res.data?.money ?? '--',
              unit: '元'
            },
            {
              name: 'CPU增加量',
              value: res.data?.cpu ?? '--',
              unit: '核'
            },
            {
              name: '内存增加量',
              value: res.data?.memory ?? '--',
              unit: 'GB'
            },
            {
              name: '存储增加量',
              value: res.data?.disk ?? '--',
              unit: 'GB'
            }
          ])
        }, 500)
        if (res.success) {
          this.list = res.data.list
          this.total = res.data.total
        }
      })
    },
    handllExport() {
      const params = this.$refs.timeSelectRef.params
      if (params.type !== 'Years' && params.year && !params.month) return this.$message.error('请选择月份')
      downloadNewResourceList({ page: this.params.page, rows: this.params.rows, time: JSON.stringify(params.time) })
    }
  }
}
</script>
<style lang="scss" scoped>
@import './components/Block.scss';
</style>
