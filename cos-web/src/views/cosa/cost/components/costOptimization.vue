<template>
  <el-form inline :model="params">
    <el-form-item>
      <slot></slot>
    </el-form-item>
    <el-form-item>
      <el-radio-group v-model="params.type" @change="typeChange">
        <el-radio-button v-for="item in timeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-select v-model="params.year" placeholder="请选择年份" @change="yearChange">
        <el-option v-for="item in yearList" :key="item" :label="item" :value="item"> </el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-select v-model="params.month" placeholder="请选择" :disabled="!params.year" @change="monthChange" v-show="params.type !== 'Years'">
        <el-option v-for="item in monthList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import dayjs from 'utils/day'
const currentYear = dayjs().year() // 获取当前年份
const lastFiveYears = []
for (let i = 0; i < 5; i++) {
  lastFiveYears.push(currentYear - i)
}
export default {
  data() {
    return {
      params: {
        type: 'Months',
        year: '',
        month: '',
        time: {
          startTime: '',
          endTime: ''
        }
      },
      timeList: [
        { label: '月', value: 'Months' },
        { label: '季度', value: 'QuarterYears' },
        { label: '半年度', value: 'HalfYears' },
        { label: '年度', value: 'Years' }
      ],
      yearList: lastFiveYears,
      monthList: [],
      interval: 1
    }
  },

  methods: {
    typeChange() {
      this.params.month = ''
      this.params.year = ''
      this.params.time = {
        startTime: '',
        endTime: ''
      }
      if (this.params.type === 'Months') this.$emit('success')
    },
    monthChange() {
      this.formatterTime()
    },
    yearChange() {
      this.params.month = ''
      this.generaterOptions()
      if (this.params.type === 'Years') {
        this.formatterTime()
      }
    },
    generaterOptions() {
      switch (this.params.type) {
        case 'Months':
          this.interval = 1
          // 根据当前年份生成月份列表
          this.monthList = Array.from({ length: 12 }, (v, k) => {
            const month = k + 1
            return {
              label: `${month}月`,
              value: month < 10 ? `0${month}` : `${month}`
            }
          })
          break
        case 'QuarterYears':
          this.interval = 3
          this.monthList = [
            { label: '一季度', value: '01' },
            { label: '二季度', value: '04' },
            { label: '三季度', value: '07' },
            { label: '四季度', value: '10' }
          ]
          break
        case 'HalfYears':
          this.interval = 6
          this.monthList = [
            { label: '1-6月', value: '01' },
            { label: '7-12月', value: '07' }
          ]
          break
        case 'Years':
          this.interval = 12
          break
        default:
          break
      }
    },
    formatterTime() {
      if (!this.params.month) this.params.month = '01'
      let nextMonth = parseInt(this.params.month) + this.interval - 1
      const currentYear = this.params.year
      const startTime = `${currentYear}-${this.params.month}-01 00:00:00`
      if (nextMonth < 10) {
        nextMonth = '0' + nextMonth
      } else if (nextMonth > 12) {
        // 取年末
        nextMonth = '12'
      }
      // 取月份的最后一天
      const lastDay = dayjs(`${currentYear}-${nextMonth}-01`).endOf('month').format('DD')
      this.params.time = {
        startTime,
        endTime: `${currentYear}-${nextMonth}-${lastDay} 23:59:59`
      }
      this.$emit('success')
    }
  }
}
</script>
<style lang="scss" scoped>
.el-form-item--mini.el-form-item,
.el-form-item--small.el-form-item {
  margin-bottom: 0px;
}
</style>
