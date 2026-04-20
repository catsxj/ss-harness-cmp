<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <div slot="header">使用记录</div>
        <basic-table :data="list" :params="params" :get-list="getList" :total="total">
          <el-table-column prop="userName" label="用户名称" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="tenantName" label="所属租户" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="gmtCreate" label="使用时间" show-overflow-tooltip></el-table-column>
        </basic-table>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <div slot="header">
          使用趋势图
          <el-radio-group size="mini" v-model="type" class="pull-right" style="margin-top: -4px" @change="getTrend">
            <el-radio-button label="week">一周</el-radio-button>
            <el-radio-button label="month">一月</el-radio-button>
            <el-radio-button label="quarter">季度</el-radio-button>
            <el-radio-button label="halfYear">半年</el-radio-button>
            <el-radio-button label="year">一年</el-radio-button>
          </el-radio-group>
        </div>
        <line-charts height="280px" width="100%" id="taskLine" :data="trendData" v-if="trendData.keys"></line-charts>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import useTable from 'hooks/useTable'
import { serviceRecord, serviceStatistics } from 'services/services/spec'
import { defineComponent, reactive, toRefs } from '@vue/composition-api'
export default defineComponent({
  props: {
    serviceId: {
      type: Number
    }
  },
  setup(props, context) {
    // 产品类型
    const { list, total, params, getList } = useTable({
      getService: serviceRecord,
      initParams: {
        serviceId: props.serviceId
      }
    })
    const state = reactive({
      type: 'week',
      trendData: {}
    })
    async function getTrend() {
      const res = await serviceStatistics({
        type: state.type,
        serviceId: props.serviceId
      })
      if (res.success) {
        state.trendData = res.data
      }
    }
    getTrend()

    return {
      list,
      total,
      params,
      getList,
      ...toRefs(state),
      getTrend
    }
  }
})
</script>
