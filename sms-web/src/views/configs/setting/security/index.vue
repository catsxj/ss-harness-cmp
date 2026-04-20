<template>
  <div class="item-card">
    <div class="item-title">
      <!-- TODO: i18n -->
      <span>安全配置</span>
      <UploadButton
        update-key="GetSystemConfigs"
        :validate="validate"
        :data="addData"
        :codes="['pwdStrength', 'pwdExpireDay', 'pwdErrorNumber', 'lockScreenTime', 'accessStrategy', 'resourceNoticeDay', 'resourceNoticeEnable']"
      ></UploadButton>
    </div>
    <div class="item-body">
      <basic-form ref="formRef" :model="addData" label-position="left" label-suffix="：" label-width="150px">
        <!-- TODO: i18n -->
        <basic-form-item label="密码策略">
          <el-radio-group v-model="addData.pwdStrength">
            <!-- TODO: i18n -->
            <el-radio-button value="required">简单密码</el-radio-button>
            <!-- TODO: i18n -->
            <el-radio-button value="required,complexPassword">复杂密码</el-radio-button>
          </el-radio-group>
          <!-- TODO: i18n -->
          <div class="tip">简单密码不限制长度和复杂度，复杂密码需包含大/小写字母、数字、字符，长度8-12位</div>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="密码过期时长">
          <el-radio-group v-model="addData.pwdWay" @change="setDefault">
            <!-- TODO: i18n -->
            <el-radio-button value="default">永不过期</el-radio-button>
            <!-- TODO: i18n -->
            <el-radio-button value="custom">最长使用期限</el-radio-button>
          </el-radio-group>
          <!-- TODO: i18n -->
          <div class="tip">若选择最长使用期限，则用户需在有效使用期限到期前修改密码，平台将在到期前15天提醒用户修改密码</div>
        </basic-form-item>
        <basic-form-item key="pwdExpireDay" prop="pwdExpireDay" v-if="addData.pwdWay === 'custom'" :rules="[rule]" validate="required,positiveInteger">
          <el-input v-model.number="addData.pwdExpireDay" class="w-md">
            <!-- TODO: i18n -->
            <template #append>天</template>
          </el-input>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="密码错误次数限制" prop="pwdErrorNumber" :rules="[rule]" validate="required,positiveInteger">
          <el-input v-model="addData.pwdErrorNumber" class="w-md">
            <!-- TODO: i18n -->
            <template #append>次</template>
          </el-input>
          <!-- TODO: i18n -->
          <div class="tip">用户输入错误密码的最大次数，若超过次数限制则系统冻结该用户，需管理员进行解冻</div>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="锁屏时间" key="lockScreenTime" prop="lockScreenTime" :rules="[rule]" validate="required,positiveInteger">
          <el-input v-model="addData.lockScreenTime" class="w-md">
            <!-- TODO: i18n -->
            <template #append>分钟</template>
          </el-input>
          <!-- TODO: i18n -->
          <div class="tip">系统无操作达一定时间后，将自动进入锁屏状态，输入当前用户密码后可解锁</div>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="访问控制">
          <el-radio-group v-model="addData.accessStrategy">
            <!-- TODO: i18n -->
            <el-radio-button value="free">不限制访问</el-radio-button>
            <!-- TODO: i18n -->
            <el-radio-button value="white">白名单</el-radio-button>
            <!-- TODO: i18n -->
            <el-radio-button value="black">黑名单</el-radio-button>
          </el-radio-group>
        </basic-form-item>
        <!-- TODO: i18n -->
        <basic-form-item label="资源过期提醒">
          <el-switch v-model="addData.resourceNoticeEnable" :active-value="'true'" :inactive-value="'false'"></el-switch>
          <div v-if="addData.resourceNoticeEnable === 'true'">
            <div style="display: flex; gap: 6px; margin: 15px 0" v-for="(item, index) in addData.resourceNoticeDay" :key="index">
              <!-- TODO: i18n -->
              <span>到期前</span>
              <el-input-number v-model="addData.resourceNoticeDay[index]" :min="1" :max="100" :step="1" :step-strictly="true" @input="handleInput(index)"></el-input-number>
              <!-- TODO: i18n -->
              <span>天提醒</span>
              <div style="margin-left: 20px" v-if="index === addData.resourceNoticeDay.length - 1">
                <!-- TODO: i18n -->
                <el-button text @click="handleAdd" :disabled="addData.resourceNoticeDay.length >= 5">增加</el-button>
                <!-- TODO: i18n -->
                <el-button text @click="handleDel(index)" :disabled="addData.resourceNoticeDay.length === 1">删除</el-button>
              </div>
            </div>
          </div>
        </basic-form-item>
        <basic-form-item v-if="addData.accessStrategy && addData.accessStrategy !== 'free'">
          <IpLimit type="black" v-if="addData.accessStrategy === 'black'" />
          <IpLimit type="white" v-else />
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import UploadButton from '../components/UploadButton.vue'
import IpLimit from './limit.vue'
import { getSystemConfigs } from 'services/system'
import { isNumber } from 'lodash-es'

interface AddData {
  pwdWay: 'default' | 'custom'
  pwdStrength?: string
  pwdExpireDay?: number
  pwdErrorNumber?: number | string
  lockScreenTime?: number | string
  accessStrategy?: string
  resourceNoticeEnable?: string
  resourceNoticeDay?: number[]
  [key: string]: unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rule = {
  validator: (_rule: any, value: any, callback: (error?: Error) => void) => {
    const val = Number(value)
    if (val >= 1 && val <= 999) {
      callback()
    } else {
      // TODO: i18n
      callback(new Error('请输入1-999正整数'))
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineProps<{
  itemData?: Record<string, any>
}>()

const loading = ref(true)
const addData = reactive<AddData>({
  pwdWay: 'default'
})

async function getConfigs() {
  loading.value = true
  // TODO: i18n
  const res = await getSystemConfigs({ category: '安全配置' })
  loading.value = false
  if (res.success) {
    const { pwdExpireDay } = res.data
    Object.assign(addData, {
      pwdWay: Number(pwdExpireDay) > 0 ? 'custom' : 'default',
      ...res.data
    })
    const resourceNoticeDay = JSON.parse((addData.resourceNoticeDay as unknown as string) || '[]')
    // 兼容处理
    if (isNumber(resourceNoticeDay)) {
      addData.resourceNoticeDay = [resourceNoticeDay]
    } else {
      addData.resourceNoticeDay = resourceNoticeDay
    }
  }
}
getConfigs()

const setDefault = (val: string) => {
  let res = -1
  if (val === 'custom') {
    res = 90
  }
  addData.pwdExpireDay = res
}

// TODO: type - basic-form 组件实例无公开类型
const formRef = ref<any>(null)

function validate() {
  let flag = false
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      flag = true
    }
  })
  return flag
}

function handleAdd() {
  addData.resourceNoticeDay?.push(1)
}
function handleDel(index: number) {
  addData.resourceNoticeDay?.splice(index, 1)
}
function handleInput(index: number) {
  if (!addData.resourceNoticeDay) return
  if (addData.resourceNoticeDay[index] < 1 || !isNumber(addData.resourceNoticeDay[index])) {
    addData.resourceNoticeDay[index] = 1
  }
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
