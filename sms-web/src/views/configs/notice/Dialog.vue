<template>
  <el-dialog :title="getTitle" :visible.sync="addData.visible" width="75%">
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
            <el-date-picker v-model="addData.sendTime" type="datetime" placeholder="选择日期时间" @change="change" :pickerOptions="pickerOptions"></el-date-picker>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="addData.visible = false">取消</el-button>
      <el-button type="primary" @click.native="submit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, computed, ref } from '@vue/composition-api'
import { Message } from 'element-ui'
import dayjs from 'utils/day.js'
import { createNotice, modifyNotice } from 'services/system/notice'
export default {
  props: {
    addData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      loading: false,
      titleMap: {
        add: '新增公告',
        edit: '编辑公告'
      }
    })

    const dialogForm = ref(null)

    const getTitle = computed(() => {
      return state.titleMap[props.addData.currentTitle]
    })

    function submit() {
      dialogForm.value.validate(async (valid) => {
        if (!valid) return
        state.loading = true
        const { sendGroups, sendWays, sendTime, currentTitle } = props.addData
        let formatTime = ''
        if (currentTitle === 'add' || (currentTitle === 'edit' && typeof sendTime === 'object')) {
          formatTime = sendTime && dayjs(sendTime.getTime()).format('YYYY-MM-DD HH:mm:ss')
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
          Message({
            type: 'success',
            message: res.message
          })
          props.addData.visible = false
          emit('getList')
        }
        state.loading = false
      })
    }
    function change(val) {
      if (new Date(val).getTime() - Date.now() < -60000) {
        Message.warning('发布时间小于当前时间')
        props.addData.sendTime = ''
      }
    }
    const pickerOptions = ref({
      disabledDate(time) {
        return time.getTime() <= Date.now() - 8.64e7
      }
    })
    return {
      ...toRefs(state),
      submit,
      getTitle,
      dialogForm,
      change,
      pickerOptions
    }
  }
}
</script>

<style></style>
