<template>
  <div>
    <template v-if="itemData.period=='Day'">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="生成时间：" required>
            <el-select v-model="itemData.choose" @change="getNext('Day')">
              <el-option key="今日" label="今日" value="current">今日</el-option>
              <el-option key="次日" label="次日" value="next">次日</el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <basic-form-item label-width="0" prop="generateTime" validate="required">
            <el-time-select v-model="itemData.generateTime"
                            :picker-options="pickerOptions"
                            placeholder="选择时间">
            </el-time-select>
          </basic-form-item>
        </el-col>
      </el-row>
    </template>
    <template v-if="itemData.period=='Week'">
      <el-row :gutter="20">
        <el-col :span="8">
          <basic-form-item label="生成时间：">
            <el-select v-model="itemData.choose" @change="getNext('Week')">
              <el-option key="本周" label="本周" value="current">本周</el-option>
              <el-option key="下周" label="下周" value="next">下周</el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="8">
          <basic-form-item label-width="0" prop="week" validate="required">
            <el-select v-model="itemData.week" placeholder="请选择" @change="getNext('WeekDay')">
              <el-option v-for="item in weekOptions" :key="item.name" :label="item.name"
                          :value="item.value"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="8">
          <basic-form-item label-width="0" prop="generateTime" validate="required">
            <el-time-select v-model="itemData.generateTime"
                            :picker-options="pickerOptions"
                            placeholder="选择时间"
                            >
            </el-time-select>
          </basic-form-item>
        </el-col>
      </el-row>
    </template>
    <template v-if="itemData.period=='Month'">
      <el-row :gutter="20" type="flex">
        <el-col :span="8">
          <basic-form-item label="生成时间：">
            <el-select v-model="itemData.choose" @change="getNext('Month')">
              <el-option key="本月" label="本月" value="current">本月</el-option>
              <el-option key="次月" label="次月" value="next">次月</el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="8">
          <basic-form-item label-width="0" prop="day" validate="required">
            <el-select v-model="itemData.day" placeholder="请选择" @change="getNext('MonthDay')">
              <el-option v-for="item in monthOptions" :key="item.name" :label="item.name"
                          :value="item.value"
                          ></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="8">
          <basic-form-item label-width="0" prop="generateTime" validate="required">
            <el-time-select v-model="itemData.generateTime"
                            :picker-options="pickerOptions"
                            placeholder="选择时间"
                            >
            </el-time-select>
          </basic-form-item>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script>
import { getWeekOptions, getMonthOptions, getDaysInYearMonth } from '../utils/index'

export default {
  props: {
    dialog: {
      type: Object,
      required: true
    },
    itemData: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      pickerOptions: {
        start: '00:00',
        step: '00:10',
        end: '24:00'
      },
      weekOptions: getWeekOptions(1, 7),
      monthOptions: getMonthOptions(1, 31)
    }
  },
  mounted () {
    this.getNext('Day', false)
  },
  methods: {
    getNext (type, clear = true) {
      let Day, Week, Month
      // eslint-disable-next-line prefer-const
      Day = Week = Month = this.itemData.choose
      const WeekDay = this.itemData.week ? parseInt(this.itemData.week, 10) : 1
      const MonthDay = this.itemData.day ? parseInt(this.itemData.day, 10) : 1
      const thisYear = new Date().getFullYear()
      const thisMonth = new Date().getMonth()
      const thisWeekDay = new Date().getDay()
      const thisMonthDay = new Date().getDate()
      let thisHour = new Date().getHours()
      const thisMinute = new Date().getMinutes()
      let Minute = (thisMinute - thisMinute % 10) + 10
      if (Minute === 60) {
        thisHour += 1
        Minute = '00'
      }
      const hourMinute = `${thisHour}:${Minute}`

      const selectAll = {
        start: '00:00',
        step: '00:10',
        end: '24:00'
      }

      const selectSome = {
        start: hourMinute,
        step: '00:10',
        end: '24:00'
      }
      // if (this.dialog.id) {
      //   return
      // }
      switch (type) {
        case 'Day':
          clear && (this.itemData.generateTime = '');
          if (Day === 'next') {
            // 次日则可以选择全部时间段
            this.pickerOptions = selectAll
            return
          } else {
            // 当天则只能选择当前时间以后
            this.pickerOptions = selectSome
            return
          }
        case 'Week':
          this.itemData.week = ''
          clear && (this.itemData.generateTime = '');
          if (Week === 'next') {
            this.weekOptions = getWeekOptions(1, 7)
            return
          } else {
            this.weekOptions = getWeekOptions(thisWeekDay, 7)
            return
          }
        case 'WeekDay':
          if (WeekDay === thisWeekDay) {
            // 次日则可以选择全部时间段
            this.pickerOptions = selectSome
            return
          } else {
            // 当天则只能选择当前时间以后
            this.pickerOptions = selectAll
            return
          }
        case 'Month':
          this.itemData.day = ''
          clear && (this.itemData.generateTime = '');
          let dayCount = 0
          if (Month === 'next') {
            dayCount = getDaysInYearMonth(thisYear, thisMonth + 1)
            this.monthOptions = getMonthOptions(1, dayCount)
            return
          } else {
            dayCount = getDaysInYearMonth(thisYear, thisMonth)
            this.monthOptions = getMonthOptions(thisMonthDay, dayCount)
            return
          }
        case 'MonthDay':
          if (MonthDay === thisMonthDay) {
            // 当天则只能选择当前时间以后
            this.pickerOptions = selectSome
          } else {
            // 次日则可以选择全部时间段
            this.pickerOptions = selectAll
          }
          break
      }
    }
  }
}
</script>
