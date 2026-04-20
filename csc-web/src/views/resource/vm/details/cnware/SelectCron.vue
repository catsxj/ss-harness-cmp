/**
* Created by Zhang Haijun on 2017/11/25.
*/
<template>
  <el-form ref="crontForm" label-width="100px">
    <el-form-item label="定时规则：" class="m-b">
      <el-radio-group v-model="cronRule" @change="selectCustom">
        <el-radio-button label="check">勾选</el-radio-button>
        <el-radio-button label="custom">自定义</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="cronRule=='check'">
      <el-form-item>
        <el-tabs v-model="activeName">
          <el-tab-pane label="分钟" name="minute">
            <el-row>
              <el-col :span="24">
                <el-radio label="loop" v-model="minute.rule" @change="getMinuteCron">循环：</el-radio>
                <span>从第 <el-input class="minute-input" v-model.number="minute.start" type="number"
                                   :disabled="minute.rule!='loop'" @blur="getMinuteCron"></el-input>
                  分钟开始，每隔 <el-input class="minute-input" v-model.number="minute.end" type="number"
                                    :disabled="minute.rule!='loop'"
                                    @blur="getMinuteCron"></el-input>分钟执行</span>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-radio label="appoint" v-model="minute.rule" @change="getMinuteCron">指定：</el-radio>
              </el-col>
              <el-col :span="24">
                <el-checkbox-group v-model="minute.select" @change="getMinuteCron">
                  <el-checkbox v-for="(item,key) in minute.list" :label="item" :key="key" class="w-label"
                               :disabled="minute.rule=='loop'" :class="{'m-l-lg':key===0}"></el-checkbox>
                </el-checkbox-group>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="小时" name="hour">
            <el-row>
              <el-col :span="24">
                <el-radio label="loop" @change="getCron('hour')" v-model="hour.rule">每小时</el-radio>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-radio label="appoint" v-model="hour.rule" @change="getCron('hour')">指定：</el-radio>
              </el-col>
              <el-col :span="24">
                <el-checkbox-group v-model="hour.select" @change="getCron('hour')">
                  <el-checkbox v-for="(item,key) in hour.list" :label="item" :key="key" class="w-label"
                               :disabled="hour.rule=='loop'" :class="{'m-l-lg':key===0}"></el-checkbox>
                </el-checkbox-group>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="天" name="day">
            <el-row>
              <el-col :span="24">
                <el-radio label="loop" @change="getCron('day')" v-model="day.rule">每天</el-radio>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-radio label="appoint" v-model="day.rule" @change="getCron('day')">指定：</el-radio>
              </el-col>
              <el-col :span="24">
                <el-checkbox-group v-model="day.select" @change="getCron('day')">
                  <el-checkbox v-for="(item,key) in day.list" :label="item" :key="key" class="w-label"
                               :disabled="day.rule=='loop'" :class="{'m-l-lg':key===0}"></el-checkbox>
                </el-checkbox-group>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="月" name="month">
            <el-row>
              <el-col :span="24">
                <el-radio label="loop" v-model="month.rule" @change="getCron('month')">每月</el-radio>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-radio label="appoint" v-model="month.rule" @change="getCron('month')">指定：</el-radio>
              </el-col>
              <el-col :span="24">
                <el-checkbox-group v-model="month.select" @change="getCron('month')">
                  <el-checkbox v-for="(item,key) in month.list" :label="item" :key="key" class="w-label"
                               :disabled="month.rule=='loop'" :class="{'m-l-lg':key===0}"></el-checkbox>
                </el-checkbox-group>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="星期" name="week">
            <el-row>
              <el-col :span="24" class="m-b">
                <span>是否使用星期：</span>
                <el-switch @change="switchWeek"
                           v-model="week.isUsed"
                           active-color="#13ce66"
                           inactive-color="#ff4949">
                </el-switch>
              </el-col>
            </el-row>
            <el-row class="border">
              <el-col :span="24">
                <el-radio label="loop" v-model="week.rule" @change="getCron('week')" :disabled="!week.isUsed">每星期
                </el-radio>
              </el-col>
              <el-col :span="24">
                <el-radio label="appoint" v-model="week.rule" @change="getCron('week')" :disabled="!week.isUsed">指定：
                </el-radio>
              </el-col>
              <el-col :span="24">
                <el-checkbox-group v-model="week.select" @change="getCron('week')">
                  <el-checkbox v-for="(item,key) in week.list" :label="item" :key="key" class="w-label"
                               :disabled="week.rule=='loop'||!week.isUsed" :class="{'m-l-lg':key===0}">
                    {{item|weekFilter}}
                  </el-checkbox>
                </el-checkbox-group>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
        <el-form-item label="表达式：">
          <el-input readonly v-model="checkCron"></el-input>
        </el-form-item>
      </el-form-item>
    </div>
    <div v-if="cronRule=='custom'">
      <el-form-item>
        <el-row>
          <el-col :span="24" class="custom-cron">

          </el-col>
        </el-row>
        <el-form-item label="表达式：">
          <el-input v-model="customCron"></el-input>
        </el-form-item>
      </el-form-item>
    </div>

  </el-form>
</template>

<script>

export default {
  props: {
    data: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      customCron: '',
      cronRule: 'check',
      activeName: 'minute',
      minute: {
        rule: 'loop',
        start: 1,
        end: 5,
        cron: '*',
        list: [],
        select: []
      },
      hour: {
        cron: '*',
        list: [],
        rule: 'loop',
        select: []
      },
      day: {
        list: [],
        cron: '*',
        rule: 'loop',
        select: []
      },
      month: {
        list: [],
        rule: 'loop',
        cron: '*',
        select: []
      },
      week: {
        isUsed: false,
        list: [],
        cron: '?',
        rule: 'loop',
        select: []
      }
    }
  },
  computed: {
    checkCron: function () {
      return '0 ' + this.minute.cron + ' ' + this.hour.cron + ' ' + this.day.cron + ' ' + this.month.cron + ' ' + this.week.cron
    },
    cron: function () {
      return this.cronRule == 'check' ? this.checkCron : this.customCron
    }
  },
  created () {
    this.initData()
    this.getMinuteCron()
    if (this.data) this.displayData(this.data)
  },
  methods: {
    displayData (value) { // 数据回现
      const arr = value.split(' ')
      this.minute.cron = arr[1]
      this.hour.cron = arr[2]
      this.day.cron = arr[3]
      this.month.cron = arr[4]
      this.week.cron = arr[5]
      // 分钟
      if (arr[1].indexOf('/') > -1) {
        this.minute.rule = 'loop'
        const item = arr[1].indexOf('/')
        this.minute.start = item[0]
        this.minute.end = item[1]
      } else {
        this.minute.rule = 'appoint'
        this.minute.select = arr[1].split(',')
      }

      const obj = ['hour', 'day', 'month', 'week']
      obj.forEach((item, key) => {
        const data = this[item]
        if (data.cron === '*') {
          data.rule = 'loop'
        } else {
          data.rule = 'appoint'
          data.select = arr[key + 2].split(',')
        }
      })
      if (this.week.cron !== '?') {
        this.week.isUsed = true
      }
    },
    initData () {
      for (let i = 0; i < 60; i++) this.minute.list.push(i.toString())
      for (let i = 0; i < 24; i++) this.hour.list.push(i.toString())
      for (let i = 1; i <= 31; i++) this.day.list.push(i.toString())
      for (let i = 1; i <= 12; i++) this.month.list.push(i.toString())
      for (let i = 1; i <= 7; i++) this.week.list.push(i.toString())
    },
    // 处理分钟输入数据
    handleInputValue () {
      const start = parseInt(Math.abs(this.minute.start))
      let end = parseInt(Math.abs(this.minute.end))
      this.minute.start = start > 59 ? 59 : start
      end = end > 59 ? 59 : end
      if (end === 0) end = 5
      this.minute.end = end
    },
    getMinuteCron () {
      if (this.minute.rule == 'loop') {
        this.handleInputValue()
        this.minute.cron = this.minute.start + '/' + this.minute.end
      } else this.minute.cron = this.minute.select.sort().join(',') || '*'
    },
    getCron (type) { // 小时、天、月
      const item = this[type]
      if (item.rule == 'loop') {
        item.cron = '*'
      } else item.cron = item.select.sort().join(',') || '*'
      if (type == 'day') { // 选择天时重置星期
        this.week.isUsed = false
        this.week.cron = '?'
      }
    },
    switchWeek () {
      if (this.week.isUsed) {
        this.day.cron = '?'
        this.week.cron = '*'
      } else {
        this.week.cron = '?'
        this.getCron('day')
      }
    },
    makeCron () {

    },
    selectCustom () {
      this.customCron = this.checkCron
    }
  },
  filters: {
    weekFilter (value) {
      const obj = ['', '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return obj[value]
    }
  }
}
</script>
<style>
  .border {
    border: 1px solid #eee;
    padding: 5px;
    margin-bottom: 5px;
  }

  .w-label {
    width: 40px;
  }

  .custom-cron {
    background: url(/web-common-resource/img/rule.png) center center no-repeat;
    width: 100%;
    height: 253px;
    margin: 0 auto;
  }

  .minute-input {
    width: 130px;
  }
</style>
