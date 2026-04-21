<template>
  <!-- TODO: cmp-element - 自研包在 compat 层处理：basic-form / basic-form-item -->
  <el-dialog :title="getTitle" v-model="addData.visible" width="75%">
    <basic-form :model="addData" ref="dialogForm">
      <el-row :gutter="10">
        <el-col :span="24">
          <basic-form-item label="标题：" prop="title" validate="required">
            <el-input v-model="addData.title" auto-complete="off" clearable></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="内容：" prop="content" validate="required">
            <el-input type="textarea" v-model="addData.content" auto-complete="off" :autosize="{ minRows: 2, maxRows: 50 }" clearable></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <basic-form-item label="发布范围：" prop="sendGroups" validate="required">
            <el-checkbox-group v-model="addData.sendGroups">
              <el-checkbox label="ALL">全员</el-checkbox>
              <el-checkbox label="MANAGE">管理端用户</el-checkbox>
              <el-checkbox label="TENANT">租户端用户</el-checkbox>
              <el-checkbox label="INPUT">指定用户</el-checkbox>
            </el-checkbox-group>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <basic-form-item label="发布方式：" prop="sendWays" validate="required">
            <el-checkbox-group v-model="addData.sendWays">
              <el-checkbox label="EMAIL">邮件</el-checkbox>
              <el-checkbox label="MESSAGE">站内信</el-checkbox>
              <el-checkbox label="WECHAT">企业微信</el-checkbox>
              <el-checkbox label="DING">钉钉</el-checkbox>
            </el-checkbox-group>
          </basic-form-item>
        </el-col>
      </el-row>
      <div v-if="addData.sendGroups.indexOf('INPUT') !== -1">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="登录账号：" prop="accounts">
              <el-input v-model="addData.accounts" auto-complete="off" placeholder="多个账号请用；隔开" clearable></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="邮箱账号：" prop="emails">
              <el-input v-model="addData.emails" auto-complete="off" placeholder="多个账号请用；隔开" clearable></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="钉钉账号：" prop="dings">
              <el-input v-model="addData.dings" auto-complete="off" placeholder="多个账号请用；隔开" clearable></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="企业微信账号：" prop="wechats">
              <el-input v-model="addData.wechats" auto-complete="off" placeholder="多个账号请用；隔开" clearable></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="手机号：" prop="phones">
              <el-input v-model="addData.phones" auto-complete="off" placeholder="多个手机号请用；隔开" clearable></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="发布时间：" prop="sendType" validate="required">
            <el-radio-group v-model="addData.sendType">
              <el-radio label="NOW">立即</el-radio>
              <el-radio label="CLOCK">定时</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row v-if="addData.sendType === 'CLOCK'">
        <el-col :span="24">
          <basic-form-item>
            <el-date-picker v-model="addData.sendTime" type="datetime" placeholder="选择日期时间" @change="change" :disabled-date="disabledDate"></el-date-picker>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="ghost" @click="addData.visible = false">取消</el-button>
        <el-button type="primary" @click="submit" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'utils/day'
import { createNotice, modifyNotice } from 'services/system/notice'

interface NoticeAddData {
  visible: boolean
  currentTitle: 'add' | 'edit'
  title?: string
  content?: string
  sendGroups: string[]
  sendWays: string[]
  sendType?: string
  sendTime?: string | Date
  [key: string]: unknown
}

const props = defineProps<{ addData: NoticeAddData }>()
const emit = defineEmits<{ getList: [] }>()

const loading = ref(false)
const titleMap: Record<string, string> = { add: '新增公告', edit: '编辑公告' }

// TODO: type - basic-form 实例类型由 compat 层提供
const dialogForm = ref<any>(null)

const getTitle = computed(() => titleMap[props.addData.currentTitle])

function submit() {
  dialogForm.value?.validate(async (valid: boolean) => {
    if (!valid) return
    loading.value = true
    const { sendGroups, sendWays, sendTime, currentTitle } = props.addData
    let formatTime = ''
    if (currentTitle === 'add' || (currentTitle === 'edit' && typeof sendTime === 'object')) {
      formatTime = sendTime ? dayjs((sendTime as Date).getTime()).format('YYYY-MM-DD HH:mm:ss') : ''
    } else if (currentTitle === 'edit' && typeof sendTime === 'string') {
      formatTime = sendTime
    }
    const data = {
      ...props.addData,
      sendGroups: sendGroups.join(','),
      sendWays: sendWays.join(','),
      sendTime: formatTime
    }
    const http = props.addData.currentTitle === 'add' ? createNotice : modifyNotice
    const res = await http(data)
    if (res.success) {
      ElMessage.success(res.message)
      props.addData.visible = false
      emit('getList')
    }
    loading.value = false
  })
}

function change(val: string | Date) {
  if (new Date(val).getTime() - Date.now() < -60000) {
    ElMessage.warning('发布时间小于当前时间')
    props.addData.sendTime = ''
  }
}

function disabledDate(time: Date) {
  return time.getTime() <= Date.now() - 8.64e7
}
</script>

<style></style>
