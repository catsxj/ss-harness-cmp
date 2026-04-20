<template>
  <ScreenWrapper code="OPERATION_SCREEN" :loading="loading">
    <OverviewState :configs="overview"></OverviewState>
    <el-row class="m-t-md" :gutter="10">
      <el-col :span="8">
        <div class="card">
          <div class="card-title">任务执行结果统计</div>
          <div class="card-body">
            <pie-charts height="100%" :data="dashboardData.result" v-if="dashboardData.result" theme="任务执行结果统计" :options="options"></pie-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="card">
          <div class="card-title">任务执行趋势图</div>
          <div class="card-body">
            <line-charts height="100%" :data="dashboardData.trend" v-if="dashboardData.trend"></line-charts>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="m-t-md">
      <el-col :span="8">
        <div class="card">
          <div class="card-title">任务执行时长统计</div>
          <div class="card-body">
            <pie-charts :data="dashboardData.duration" v-if="dashboardData.duration" theme="任务执行时长统计" height="100%"></pie-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="card">
          <div class="card-title">作业模板统计</div>
          <div class="card-body">
            <bar-charts height="100%" width="100%" :data="dashboardData.templateTrend" v-if="dashboardData.templateTrend"></bar-charts>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="m-t-md">
      <el-col :span="8">
        <div class="card">
          <div class="card-title">本月执行任务数</div>
          <div class="card-body">
            <pie-charts theme="本月执行任务数" height="100%" :data="monthTaskData" :options="options1"></pie-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="card">
          <div class="card-title">最近任务执行记录</div>
          <div class="card-body">
            <scroll-table :data="historyList"  :columns="['任务名称',  '执行人' , '总耗时(s)' , '执行时间', '任务状态']" :options="{singleHeight: 40}">
              <template v-slot="scope">
                <scroll-table-column :value="scope.row.name">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.operator || '--'">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.cost">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.gmtStart">
                </scroll-table-column>
                <scroll-table-column >
                  {{taskExeStatusFilter(scope.row.status)}}
                </scroll-table-column>
              </template>
            </scroll-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </ScreenWrapper>
</template>

<script>
import { reactive, toRefs, ref, onUnmounted, unref } from '@vue/composition-api'
import CountItem from './CountItem'
import OverviewState from 'components/OverviewState'
import ScreenWrapper from 'components/ScreenWrapper'
import { getTaskStat, getInstance } from 'services/screen/task'
import { overviewConfigs } from './data'

const options = {
  color: ['#54c54e', '#dc1a1a', '#2e8cf0', '#5d59b4', '#ff9900']
}
const options1 = {
  color: ['#2e8cf0', '#54c54e', '#dc1a1a', '#5d59b4', '#ff9900']
}

export function taskExeStatusFilter(value, type = 'name') {
  const obj = {
    CREATED: {
      name: '未执行',
      color: 'normal'
    },
    NOREADY: {
      name: '已跳过',
      color: 'warning'
    },
    READY: {
      name: '准备中',
      color: 'normal'
    },
    WAITTING: {
      name: '等待执行',
      color: 'primary'
    },
    CANCELING: {
      name: '取消中',
      color: 'primary'
    },
    RUNNING: {
      name: '正在执行',
      color: 'normal'
    },
    SUCCESS: {
      name: '执行成功',
      color: 'success'
    },
    SUSPENDED: {
      name: '已暂停',
      color: 'warning'
    },
    FAILED: {
      name: '执行失败',
      color: 'danger'
    },
    CANCELED: {
      name: '手动结束',
      color: 'warning'
    },
    EXCEPTION: {
      name: '执行异常',
      color: 'danger'
    }
  }
  return obj[value] && obj[value][type] // 容错处理（初始化值不存在）
}
export default {
  components: {
    ScreenWrapper,
    CountItem,
    OverviewState
  },
  setup() {
    const dashboardData = ref({})
    const monthTaskData = ref([])
    const overview = ref(overviewConfigs)
    async function getData() {
      const res = await getTaskStat()
      if (res.success) {
        dashboardData.value = res.data
        const { runs, success, fails, cancels, suspends, approveds, develops, approvings, inactives, actives, pauses } = res.data.digit
        monthTaskData.value = [
          { name: '执行中', value: runs },
          { name: '成功', value: success },
          { name: '失败', value: fails },
          { name: '取消', value: cancels },
          { name: '暂停', value: suspends }
        ];
        const count = unref(overview)
        // 常规作业
        const tasks = count[0]
        ;[approveds, develops, approvings].forEach(
          (item, index) => {
            tasks.data[index].value = item
          }
        );
        // 定时作业
        const cronTasks = count[1]
        ;[inactives, actives, pauses].forEach(
          (item, index) => {
            cronTasks.data[index].value = item
          }
        )
      }
    }
    // 历史记录
    const historyList = ref([])
    async function getHistory() {
      const res = await getInstance({ page: 1, rows: 10 })
      if (res.success) {
        historyList.value = res.data.rows;
      }
    }
    const state = reactive({
      loading: true
    })
    const timer = setInterval(() => {
      change()
    }, 1000 * 20)
    onUnmounted(() => {
      clearInterval(timer)
    })
    const change = async () => {
      try {
        await Promise.all([
          getData(),
          getHistory()
        ])
      } catch (error) {}
      state.loading = false
    }
    change()
    return {
      ...toRefs(state),
      options,
      options1,
      overview,
      dashboardData,
      monthTaskData,
      historyList,
      taskExeStatusFilter
    }
  }
}
</script>
<style lang="scss" scoped>
.card-count-slot {
  flex: 1;
  font-size: 16px;
  color: #fff;
  margin-top: 10px;
}
.card {
  // height: calc((100vh - 300px) / 3 - 20px);
  height: 245px;
  .card-title {
    font-size: 18px;
    border-left: 3px solid #0089ff;
    font-weight: bold;
    color: #bbefff;
    padding-left: 5px;
    margin-bottom: 5px;
  }
  .card-body {
    height: calc(100% - 33px);
  }
}
</style>
