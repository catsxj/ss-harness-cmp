<template>
  <el-row :gutter="16">
    <el-col :xl="18" :lg="16" :md="24">
      <el-row>
        <div class="view-card">
          <div class="card-title">正在执行作业</div>
          <AdvanceTable height="230" :card-border="false" :border="false" :show-tools="false" :data="doingList" :columns="historyColumns" :loading="loading">
            <template #status="status">
              <status-icon :type="taskExeStatusFilter(status, 'color')">
                {{ taskExeStatusFilter(status) }}
              </status-icon>
            </template>
            <template #operate="val, record">
              <el-button type="text" @click="goTaskDetail(record.id)">详情</el-button>
            </template>
            <div slot="pagination"></div>
          </AdvanceTable>
        </div>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="view-card">
              <div class="card-title">
                <span>平台作业数量统计</span>
                <el-radio-group v-model="countType" class="pull-right simple">
                  <el-radio-button label="general">常规作业</el-radio-button>
                  <el-radio-button label="cron">定时作业</el-radio-button>
                </el-radio-group>
              </div>
              <div class="count-wrapper">
                <div class="count-cell" v-for="(item, index) in countData[countType]" :key="index">
                  <div class="cell-value">{{ item.value }}</div>
                  <div class="cell-name">
                    <span class="icon" :style="{ background: item.color }"></span>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="view-card">
              <div class="card-title">平台模板统计</div>
              <loop-charts height="230px" width="100%" :setting="{ legend: { show: false }}" :options="tplChartOptions" :data="dashboardData.template" theme="平台模板统计"></loop-charts>
            </div>
          </el-col>
        </el-row>
        <div class="view-card">
          <div class="card-title">作业执行趋势图</div>
          <line-charts height="220px" width="100%" id="taskLine" :data="dashboardData.trend" v-if="dashboardData.trend" :setting="taskExecuteChartsSetting"></line-charts>
        </div>
      </el-row>
    </el-col>
    <el-col :xl="6" :lg="8" :md="24">
      <div class="view-card">
        <div class="card-title">任务执行结果统计</div>
        <loop-charts height="230px" width="100%" :data="dashboardData.result" v-if="dashboardData.result" theme="任务执行结果统计" :setting="taskExecuteChartsSetting"></loop-charts>
      </div>
      <div class="view-card">
        <div class="card-title">脚本统计</div>
        <loop-charts type="half" height="230px" width="100%" :data="dashboardData.script" v-if="dashboardData.script" theme="脚本统计"></loop-charts>
      </div>
      <div class="view-card">
        <div class="card-title">本月作业执行TOP5</div>
        <Top5 v-if="dashboardData.taskTop5.length" style="height: calc(100% - 40px)" :data="dashboardData.taskTop5"></Top5>
        <empty v-else></empty>
      </div>
    </el-col>
    <el-col :span="24">
      <div class="view-card">
        <div class="card-title">
          <span>最近任务执行记录</span>
          <router-link to="/task/history/list">
            <el-button type="text" class="pull-right">更多</el-button>
          </router-link>
        </div>
        <AdvanceTable height="230" :card-border="false" :border="false" :show-tools="false" :data="historyList" :columns="historyColumns" :loading="loading">
          <template #status="status">
            <status-icon :type="taskExeStatusFilter(status, 'color')">
              {{ taskExeStatusFilter(status) }}
            </status-icon>
          </template>
          <template #operate="val, record">
            <el-button type="text" @click="goTaskDetail(record.id)">详情</el-button>
          </template>
          <div slot="pagination"></div>
        </AdvanceTable>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { getTaskStat, getInstance } from 'services/task/task'
import { ref, defineComponent, unref, Ref } from '@vue/composition-api'
import Top5 from '@/common/components/top5/index.vue'
import { handleSearchParam } from 'cmp-element/utils'
import { taskExeStatusFilter } from '@/filters/index'
const historyColumns = [
  { label: '任务名称', prop: 'name' },
  { label: '执行人', prop: 'operator' },
  { label: '总耗时（s）', prop: 'cost' },
  { label: '执行时间', prop: 'gmtStart' },
  { label: '任务状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '操作', disabled: true, width: '120px', scopedSlots: { customRender: 'operate' } }
]
export default defineComponent({
  components: { Top5 },
  setup(props, context) {
    const dashboardData = ref({
      taskTop5: []
    })
    const loading = ref(false)
    const countData = ref({})
    async function getData() {
      const res = await getTaskStat()
      if (res.success) {
        dashboardData.value = res.data
        // 数据处理
        const {
          digit: { approveds, develops, inactives, actives, pauses }
        } = unref(dashboardData) as any
        countData.value = {
          general: [
            { name: '已发布', value: approveds, color: '#13BD80' },
            { name: '开发中', value: develops }
          ],
          cron: [
            { name: '未激活', value: inactives, color: '#717171' },
            { name: '已激活', value: actives },
            { name: '暂停中', value: pauses, color: '#FFA831' }
          ]
        }
      }
    }
    getData()
    // 正在执行
    const doingList: any = ref([])
    async function getDoingList() {
      const res = await getInstance({
        page: 1,
        rows: 9999,
        params: handleSearchParam({
          status: 'RUNNING'
        })
      })
      if (res.success) {
        doingList.value = res.data.rows
      }
    }
    getDoingList()
    // 历史
    const historyList: Ref<any[]> = ref([])
    async function getHistoryList() {
      const res = await getInstance({
        page: 1,
        rows: 10,
        params: handleSearchParam({
          'status:UEQ': 'RUNNING'
        })
      })
      if (res.success) {
        historyList.value = res.data.rows
      }
    }
    getHistoryList()
    function goTaskDetail(id: number) {
      context.root.$router.push({
        name: 'TaskHistoryPreview',
        params: { id: String(id) }
      })
    }
    const countType = ref('general')
    return {
      taskExecuteChartsSetting: {
        color: ['#54C54E', '#DC1A1A', '#2E8CF0', '#5D59B4', '#FF9900']
      },
      taskExeStatusFilter,
      loading,
      countType,
      countData,
      doingList,
      historyList,
      historyColumns,
      dashboardData,
      goTaskDetail,
      tplChartOptions: {
        title: {
          top: '35%'
        },
        series: [
          {
            label: { show: true },
            center: ['50%', '45%']
          }
        ]
      }
    }
  }
})
</script>
<style scoped lang="scss">
.view-card {
  height: 300px;
  box-sizing: border-box;
  border-radius: 4px;
  background: #ffffff;
  padding: 16px;
  margin-bottom: 16px;
  .card-title {
    font-weight: bold;
    color: #393b3e;
    margin-bottom: 16px;
  }
}
.count-wrapper {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: calc(100% - 40px);
  .count-cell {
    text-align: center;
    .icon {
      width: 6px;
      height: 6px;
      background: #4076e2;
      border-radius: 6px;
      margin-right: 6px;
    }
    .cell-value {
      font-size: 26px;
      font-weight: 400;
      color: #393b3e;
      margin-bottom: 12px;
    }
    .cell-name {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      color: #707274;
    }
  }
}
</style>
