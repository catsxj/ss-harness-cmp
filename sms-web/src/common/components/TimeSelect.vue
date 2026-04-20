<template>
  <div>
    <el-radio-group v-model="params.time" @change="selectTime">
      <el-radio-button v-for="item in timeList" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button>
    </el-radio-group>
    <el-button class="m-l-sm" :type="params.startTime ? 'primary' : 'ghost'" @click="selectTime()">自定义</el-button>
    <span class="tip m-l" v-if="params.startTime">时间范围：{{ params.startTime }} - {{ params.endTime }}</span>
    <el-dialog title="时间选择" v-model="dialogVisible" width="500px" v-if="dialogVisible">
      <el-date-picker
        v-model="time"
        value-format="YYYY-MM-DD HH:mm:ss"
        type="datetimerange"
        :shortcuts="pickerShortcuts"
        :disabled-date="disabledDate"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="right"
      >
      </el-date-picker>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface ITimeItem {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    timeList?: ITimeItem[]
    getData: (params: { time: string; startTime: string; endTime: string }) => void
    defaultTime?: string
  }>(),
  {
    timeList: () => [
      { label: '天', value: 'Days' },
      { label: '周', value: 'Weeks' },
      { label: '月', value: 'Months' },
      { label: '季度', value: 'QuarterYears' },
      { label: '半年', value: 'HalfYears' },
      { label: '一年', value: 'Years' }
    ],
    defaultTime: 'Months'
  }
)

const pickerShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

const disabledDate = (time: Date) => {
  return time.getTime() > new Date().getTime()
}

const dialogVisible = ref(false)
const time = ref<string | string[]>('')
const params = reactive({
  time: '',
  startTime: '',
  endTime: ''
})

onMounted(() => {
  params.time = props.defaultTime
})

const selectTime = (value?: string) => {
  // 自定义
  if (!value) {
    dialogVisible.value = true
    return
  }
  time.value = ''
  params.startTime = ''
  params.endTime = ''
  props.getData(params)
}

const submit = () => {
  if (!time.value) {
    ElMessage.error('请选择时间范围')
    return
  }
  const [startTime, endTime] = time.value as string[]
  if (new Date(endTime).getTime() - new Date(startTime).getTime() < 1000 * 60 * 60) {
    ElMessage.error('时间间隔必须大于一小时')
    return
  }
  params.time = ''
  params.startTime = startTime
  params.endTime = endTime
  dialogVisible.value = false
  props.getData(params)
}
</script>
<style scoped lang="scss"></style>
