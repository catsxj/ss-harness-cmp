<template>
  <el-card>
    <el-form inline :model="params">
      <el-button type="" @click="exportData"> <i class="el-icon-download"></i> 导出 </el-button>
      <el-radio-group v-model="params.time" @change="radioChange">
        <el-radio-button v-for="item in timeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
      </el-radio-group>
      <el-form-item style="margin-left: 30px">
        <el-select v-model="params.year" placeholder="请选择年份" @change="yearChange">
          <el-option v-for="item in years" :key="item" :label="item" :value="item"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="params.month" placeholder="请选择" :disabled="!params.year" @change="monthChange" v-show="showMonthInput">
          <el-option v-for="item in months" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <span>账单单位：元</span>
    </el-form>
  </el-card>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
import dayjs from 'utils/day'
function getLastFiveYears() {
  const currentYear = dayjs().year()
  const years = []
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i)
  }
  return years.reverse()
}
export default {
  props: {
    getData: {
      type: Function
    }
  },
  setup({ getData }, { emit }) {
    const state = reactive({
      timeList: [
        { label: '月', value: 'Months' },
        { label: '季度', value: 'QuarterYears' },
        { label: '半年度', value: 'HalfYears' },
        { label: '年度', value: 'Years' }
      ],
      params: {
        time: 'Months',
        year: '',
        month: ''
      },
      years: getLastFiveYears(),
      months: [
        { label: '一月', value: '01', day: '31' },
        { label: '二月', value: '02', day: '28' },
        { label: '三月', value: '03', day: '31' },
        { label: '四月', value: '04', day: '30' },
        { label: '五月', value: '05', day: '31' },
        { label: '六月', value: '06', day: '30' },
        { label: '七月', value: '07', day: '31' },
        { label: '八月', value: '08', day: '31' },
        { label: '九月', value: '09', day: '30' },
        { label: '十月', value: '10', day: '31' },
        { label: '十一月', value: '11', day: '30' },
        { label: '十二月', value: '12', day: '31' }
      ],
      showMonthInput: true,
      interval: 1
    })

    function updata(timeMode) {
      switch (timeMode) {
        case 'Months':
          state.showMonthInput = true
          state.interval = 1
          state.months = [
            { label: '一月', value: '01', day: '31' },
            { label: '二月', value: '02', day: '28' },
            { label: '三月', value: '03', day: '31' },
            { label: '四月', value: '04', day: '30' },
            { label: '五月', value: '05', day: '31' },
            { label: '六月', value: '06', day: '30' },
            { label: '七月', value: '07', day: '31' },
            { label: '八月', value: '08', day: '31' },
            { label: '九月', value: '09', day: '30' },
            { label: '十月', value: '10', day: '31' },
            { label: '十一月', value: '11', day: '30' },
            { label: '十二月', value: '12', day: '31' }
          ]
          break
        case 'QuarterYears':
          state.showMonthInput = true
          state.interval = 3
          state.months = [
            { label: '一季度', value: '01', day: '31' },
            { label: '二季度', value: '04', day: '30' },
            { label: '三季度', value: '07', day: '31' },
            { label: '四季度', value: '10', day: '31' }
          ]
          break
        case 'HalfYears':
          state.showMonthInput = true
          state.interval = 6
          state.months = [
            { label: '1-6月', value: '01', day: '31' },
            { label: '7-12月', value: '07', day: '31' }
          ]
          break
        case 'Years':
          state.showMonthInput = false
          state.interval = 12
          break
        default:
          break
      }
    }

    function radioChange(timeMode) {
      updata(timeMode)
      state.params.month = ''
      state.params.year = ''
      getData({ time: timeMode })
    }
    function handleSearchParam(currentYear, currentMonth) {
      // const [{ day }] = state.months.filter((item) => item.value === currentMonth)
      if (!currentMonth) {
        currentMonth = '01'
      }
      let nextMonth = parseInt(currentMonth) + state.interval
      const startTime = `${currentYear}-${currentMonth}-01 00:00:00`
      if (nextMonth < 10) {
        nextMonth = '0' + nextMonth
      } else if (nextMonth > 12) {
        nextMonth = '01'
        currentYear = parseInt(currentYear) + 1
      }
      const params = {
        startTime,
        endTime: `${currentYear}-${nextMonth}-01 00:00:00`
      }
      getData(params)
    }
    function monthChange(month) {
      handleSearchParam(state.params.year, month)
    }
    function yearChange() {
      if (!state.params.month && state.showMonthInput) {
        return
      }
      handleSearchParam(state.params.year, state.params.month)
    }
    function exportData() {
      emit('exportData')
    }
    return {
      ...toRefs(state),
      radioChange,
      monthChange,
      yearChange,
      exportData
    }
  }
}
</script>

<style>
.el-button {
  margin: 0 20px 0 0;
}
</style>
