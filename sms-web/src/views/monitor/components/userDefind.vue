<template>
  <el-dialog title="自定义时间" :close-on-click-modal="false" v-if="userDefindVisible" :model-value="userDefindVisible" @update:model-value="handleUpdateVisible" append-to-body>
    <!-- TODO: cmp-element -->
    <basic-form>
      <basic-form-item label="选择时间：">
        <el-date-picker v-model="time" type="datetimerange" size="small" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="x" :disabled-date="disabledDate" @calendar-change="onCalendarChange"></el-date-picker>
      </basic-form-item>
    </basic-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="ghost" @click="close">取消</el-button>
        <el-button type="primary" @click="userDefindSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  userDefindVisible: boolean
  userDefindTime: number[]
}>()

const emit = defineEmits<{
  getData: [value?: number[]]
}>()

const time = ref<number[]>([])
const pickerMinDate = ref<number | ''>('')

function handleUpdateVisible(val: boolean): void {
  if (!val) emit('getData')
}

function onCalendarChange(dates: [Date, Date] | null): void {
  if (dates && dates[0]) {
    pickerMinDate.value = dates[0].getTime()
    if (dates[1]) {
      pickerMinDate.value = ''
    }
  }
}

function disabledDate(date: Date): boolean {
  if (pickerMinDate.value !== '') {
    const day14 = (14 - 1) * 24 * 3600 * 1000
    let maxTime = (pickerMinDate.value as number) + day14
    const minTime = (pickerMinDate.value as number) - day14
    if (maxTime > new Date().getTime()) {
      maxTime = new Date().getTime()
    }
    return date.getTime() > maxTime || date.getTime() < minTime
  }
  return date.getTime() > Date.now()
}

function userDefindSubmit(): void {
  if (time.value && time.value.length && time.value[0] !== undefined) {
    emit('getData', time.value)
  } else {
    ElMessage.error('请选择自定义时间！')
  }
}

function close(): void {
  emit('getData')
}

onMounted(() => {
  time.value = []
  if (props.userDefindTime) {
    time.value.push(props.userDefindTime[0], props.userDefindTime[1])
  }
})
</script>
