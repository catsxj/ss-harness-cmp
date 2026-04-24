<template>
  <div>
    <el-radio-group v-model="params.time" @change="selectTime">
      <el-radio-button v-for="item in timeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
    </el-radio-group>
    <el-button class="m-l-sm" :type="params.startTime ? 'primary' : 'ghost'" @click="selectTime()">自定义</el-button>
    <span class="tip m-l" v-if="params.startTime">时间范围：{{ params.startTime }} - {{ params.endTime }}</span>
    <el-dialog title="时间选择" v-model:visible="dialogVisible" width="500px" v-if="dialogVisible">
      <el-date-picker v-model="time" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right"> </el-date-picker>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    timeList: {
      type: Array,
      default: function () {
        return [
          { label: '天', value: 'Days' },
          { label: '周', value: 'Weeks' },
          { label: '月', value: 'Months' },
          { label: '季度', value: 'QuarterYears' },
          { label: '半年', value: 'HalfYears' },
          { label: '一年', value: 'Years' }
        ]
      }
    },
    getData: {
      type: Function
    },
    defaultTime: {
      type: String,
      default: 'Months'
    }
  },
  data() {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ],
        disabledDate(time) {
          return time.getTime() > new Date().getTime()
        }
      },
      dialogVisible: false,
      time: '',
      params: {
        time: '',
        startTime: '',
        endTime: ''
      }
    }
  },
  created() {
    this.params.time = this.defaultTime
  },
  methods: {
    selectTime(value) {
      // 自定义
      if (!value) {
        this.dialogVisible = true
        this.dialogVisible = true
        return
      }
      this.time = ''
      this.params.startTime = ''
      this.params.endTime = ''
      this.getData(this.params)
    },
    submit() {
      if (!this.time) return this.$message.error('请选择时间范围')
      const [startTime, endTime] = this.time
      if (new Date(endTime).getTime() - new Date(startTime) < 1000 * 60 * 60) {
        return this.$message.error('时间间隔必须大于一小时')
      }
      this.params.time = ''
      this.params.startTime = startTime
      this.params.endTime = endTime
      this.dialogVisible = false
      this.getData(this.params)
    }
  }
}
</script>
<style scoped lang="scss"></style>
