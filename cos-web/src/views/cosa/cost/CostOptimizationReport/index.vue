<template>
  <div>
    <AdvanceTable title="成本优化报表" :isInitSearch="false" :searchConfigs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total">
      <template v-slot:action>
        <TimeSelect ref="timeSelectRef" @success="getData">
          <el-button type="primary" @click="handllExport()"> 导出 </el-button>
        </TimeSelect>
      </template>
      <template #month="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" :title="detail.orderSn" @goBack="detailFlag = false">
      <template v-slot:item_container>
        <common-detail-item :label="item.label" v-for="item in columns" :key="item.prop">{{ detail[item.prop] }}</common-detail-item>
      </template>
      <el-tabs value="checkList">
        <el-tab-pane label="优化清单" name="checkList">
          <CheckList :detail="detail"></CheckList>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </div>
</template>

<script>
import { getCostOptimization, downloadCostOptimization, getCostOptimizationCount } from '@/services/soa/costAnalysis'
// import echartsBlock from '../components/echartsBlock.js'
import Block from '../components/Block.js'
// import costOptimization from '../components/costOptimization.vue'
import TimeSelect from '../components/TimeSelect.vue'
import CheckList from './CheckList'

export default {
  mixins: [Block],
  components: { TimeSelect, CheckList },
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
          prop: 'month',
          scopedSlots: { customRender: 'month' }
        },
        {
          label: 'CPU优化量(核)',
          prop: 'cpu'
        },
        {
          label: '内存优化量(GB)',
          prop: 'memory'
        },
        {
          label: '存储优化量(GB)',
          prop: 'disk'
        },
        {
          label: '变配资源(台)',
          prop: 'changeCount'
        },
        {
          label: '清退资源(台)',
          prop: 'unsubscribeCount'
        }
      ],
      searchConfigs: [],
      detail: {},
      detailFlag: false
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getDetail(data) {
      this.detail = data
      this.detailFlag = true
    },
    getData() {
      const params = this.$refs.timeSelectRef.params
      if (params.type !== 'Years' && params.year && !params.month) return this.$message.error('请选择月份')
      getCostOptimization({ page: this.params.page, rows: this.params.rows, time: JSON.stringify(params.time) }).then((res) => {
        if (res.success) {
          this.list = res.data.data
          this.total = res.data.total
        }
      })
      getCostOptimizationCount({ page: this.params.page, rows: this.params.rows, time: JSON.stringify(params.time) }).then((res) => {
        setTimeout(() => {
          this.GeneratorBlockComponent([
            {
              name: '总节省成本',
              value: res.data?.money ?? '--',
              unit: '元'
            },
            {
              name: 'CPU优化量',
              value: res.data?.cpu ?? '--',
              unit: '核'
            },
            {
              name: '内存优化量',
              value: res.data?.memory ?? '--',
              unit: 'GB'
            },
            {
              name: '存储优化量',
              value: res.data?.disk ?? '--',
              unit: 'GB'
            }
          ])
        }, 500)
      })
      // const arr = [
      //   {
      //     type: 'pie-charts',
      //     title: '云资源优化分布（单位：万元）',
      //     data: {
      //       keys: ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08'],
      //       values: [
      //         {
      //           data: [0, 0, 1834.134, 1221.342, 699140.931, 838415.267],
      //           name: '消费金额(元)'
      //         }
      //       ]
      //     }
      //   },
      //   {
      //     type: 'pie-charts',
      //     title: '云平台优化分布（单位：万元）',
      //     data: {
      //       keys: ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08'],
      //       values: [
      //         {
      //           data: [0, 0, 1834.134, 1221.342, 699140.931, 838415.267],
      //           name: '消费金额(元)'
      //         }
      //       ]
      //     }
      //   },
      //   {
      //     type: 'pie-charts',
      //     title: '成本优化趋势（单位：万元）',
      //     data: {
      //       keys: ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08'],
      //       values: [
      //         {
      //           data: [0, 0, 1834.134, 1221.342, 699140.931, 838415.267],
      //           name: '消费金额(元)'
      //         }
      //       ]
      //     }
      //   }
      // ]
      // setTimeout(() => {
      //   this.GeneratorBlockComponent(arr)
      // }, 500)
    },

    handllExport() {
      const params = this.$refs.timeSelectRef.params
      if (params.type !== 'Years' && params.year && !params.month) return this.$message.error('请选择月份')
      downloadCostOptimization({ page: this.params.page, rows: this.params.rows, time: JSON.stringify(params.time) })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../components/Block.scss';
</style>
