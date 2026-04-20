<template>
  <el-dialog title="自定义时间" :close-on-click-modal="false" v-if="userDefindVisible" :visible.sync="userDefindVisible" append-to-body>
    <basic-form>
      <basic-form-item label="选择时间：">
        <el-date-picker v-model="time" type="datetimerange" size="mini" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerOptions"></el-date-picker>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="close">取消</el-button>
      <el-button type="primary" @click.native="userDefindSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    userDefindVisible: {
      type: Boolean
    },
    userDefindTime: {
      type: Array
    }
  },
  data() {
    return {
      time: [],
      pickerMinDate: '',
      dateRange: [],
      pickerOptions: {
        onPick: ({ maxDate, minDate }) => {
          this.pickerMinDate = minDate.getTime()
          if (maxDate) {
            this.pickerMinDate = ''
          }
        },
        disabledDate: time => {
          if (this.pickerMinDate !== '') {
            const day14 = (14 - 1) * 24 * 3600 * 1000
            let maxTime = this.pickerMinDate + day14
            const minTime = this.pickerMinDate - day14
            if (maxTime > new Date()) {
              maxTime = new Date()
            }
            return time.getTime() > maxTime || time.getTime() < minTime
          }
          return time.getTime() > Date.now()
        }
      }
    }
  },
  created() {
    this.time = []
    if (this.userDefindTime.length) {
      this.time.push(this.userDefindTime[0], this.userDefindTime[1])
    }
  },
  methods: {
    userDefindSubmit() {
      if (this.time && this.time.length && this.time[0] != undefined) {
        this.$emit('getData', this.time)
      } else {
        return this.$message.error('请选择自定义时间！')
      }
    },
    close() {
      this.$emit('getData')
    }
  }
}
</script>
