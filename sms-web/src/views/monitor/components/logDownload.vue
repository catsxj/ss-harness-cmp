<template>
  <el-dialog title="日志下载" v-model="dialog.visible" width="40%" v-if="dialog.visible">
    <!-- TODO: cmp-element -->
    <basic-form ref="timeDataRef" :model="timeData">
      <el-form-item label="日志类型：">
        <el-radio-group v-model="downloadWay" @change="selectWay">
          <el-radio value="now">当日日志</el-radio>
          <el-radio value="old" :disabled="Boolean(dialog.data?.logger && dialog.data.logger.indexOf('worker') > -1)">历史日志</el-radio>
        </el-radio-group>
      </el-form-item>
      <basic-form-item label="时间：" v-if="downloadWay === 'old'" prop="array" validate="required" required-message="请选择时间段">
        <el-date-picker v-model="timeData.array" type="daterange" format="YYYY-MM-DD" value-format="YYYY-MM-DD" range-separator="至" unlink-panels start-placeholder="开始日期" end-placeholder="结束日期" :disabled-date="disabledDate" :shortcuts="pickerShortcuts"> </el-date-picker>
      </basic-form-item>
    </basic-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="ghost" @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="downloadOk()">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { downloadFile } from 'utils'

interface DialogData {
  logger?: string
  host?: string
  [key: string]: unknown
}

interface DialogProps {
  visible: boolean
  data?: DialogData
}

interface TimeData {
  server?: string
  host?: string
  array: string | string[]
}

const props = defineProps<{
  dialog: DialogProps
}>()

const downloadWay = ref<'now' | 'old'>('now')
const timeData = reactive<TimeData>({ array: [] })
const timeDataRef = ref()

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
  }
]

function disabledDate(time: Date): boolean {
  return time.getTime() >= Date.now()
}

function selectWay(): void {
  timeData.array = ''
}

function downloadOk(): void {
  timeDataRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (downloadWay.value === 'now') {
        const params = {
          server: timeData.server,
          host: timeData.host
        }
        downloadFile('/sms/v1/logs/download', params)
      } else {
        const arr = timeData.array as string[]
        const params = {
          server: timeData.server,
          host: timeData.host,
          begin: arr[0],
          end: arr[1]
        }
        downloadFile('/sms/v1/logs/zip', params)
      }
      props.dialog.visible = false
    } else {
      return false
    }
  })
}

onMounted(() => {
  const data = props.dialog.data
  if (data?.logger) {
    const arr = data.logger.split('.')
    timeData.server = arr[0]
    timeData.host = data.host
    timeData.array = ''
  }
})
</script>
