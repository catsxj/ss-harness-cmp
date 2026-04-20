<template>
  <common-detail :title="detailData.name" @goBack="$emit('goBack')">
    <template v-slot:item_container>
      <common-detail-item label="登录账号">{{ detailData.account }}</common-detail-item>
      <common-detail-item label="用户姓名">{{ detailData.name }}</common-detail-item>
      <common-detail-item label="用户性别">{{ detailData.sex | sexFilter }}</common-detail-item>
      <common-detail-item label="用户状态">
        <status-icon :type="detailData.status | generalStatusFilter('color')">
          {{ detailData.status | generalStatusFilter('status') }}
        </status-icon>
      </common-detail-item>
      <common-detail-item label="用户邮箱">{{ detailData.email }}</common-detail-item>
      <common-detail-item label="联系方式">{{ detailData.mobile }}</common-detail-item>
      <common-detail-item label="用户类型">{{ detailData.isManager ? '管理用员' : '普通用户' }}</common-detail-item>
      <common-detail-item label="用户工号">{{ detailData.jobNumber }}</common-detail-item>
      <common-detail-item label="钉钉账号">{{ detailData.dingtalk }}</common-detail-item>
      <common-detail-item label="微信账号">{{ detailData.wechat }}</common-detail-item>
      <common-detail-item label="公司名称">{{ detailData.company }}</common-detail-item>
      <common-detail-item label="所属租户">{{ detailData.tenantName }}</common-detail-item>
      <common-detail-item label="用户描述">{{ detailData.remark }}</common-detail-item>
    </template>
    <el-tabs value="log" @tab-click="handleTab">
      <el-tab-pane label="操作日志" name="log">
        <basic-table :data="logList" :params="logParams" :get-list="getLogList" :total="logTotal">
          <el-table-column show-overflow-tooltip label="服务名称" prop="module"> </el-table-column>
          <el-table-column show-overflow-tooltip label="请求IP" prop="requestIp"> </el-table-column>
          <el-table-column show-overflow-tooltip label="响应IP" prop="responseIp"> </el-table-column>
          <el-table-column show-overflow-tooltip label="操作者" prop="account"> </el-table-column>
          <el-table-column show-overflow-tooltip label="请求对象" prop="object"> </el-table-column>
          <el-table-column show-overflow-tooltip label="操作" prop="action"> </el-table-column>
          <el-table-column show-overflow-tooltip label="请求时间" prop="gmtCreate"> </el-table-column>
          <el-table-column show-overflow-tooltip label="请求耗时(ms)" prop="cost"> </el-table-column>
        </basic-table>
      </el-tab-pane>
      <el-tab-pane label="登录日志" name="login">
        <basic-table :data="loginList" :params="loginParams" :get-list="getLogin" :total="loginTotal">
          <el-table-column show-overflow-tooltip label="登录账号" prop="account"> </el-table-column>
          <el-table-column show-overflow-tooltip label="登录IP" prop="requestIp"> </el-table-column>
          <el-table-column show-overflow-tooltip label="响应地址" prop="responseIp"> </el-table-column>
          <el-table-column show-overflow-tooltip label="登录结果" prop="detail"> </el-table-column>
          <el-table-column show-overflow-tooltip label="登录时间" prop="gmtCreate"> </el-table-column>
        </basic-table>
      </el-tab-pane>
    </el-tabs>
  </common-detail>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from '@vue/composition-api'
import { getUserDetail, getTrack } from 'services/system/manager'
import { getLog } from 'services/system/log'

export default defineComponent({
  props: {
    userData: {
      type: Object,
      required: true
    }
  },
  setup(props, context) {
    const detailData = ref({})
    async function getDetail() {
      const res = await getUserDetail(props.userData.id)
      if (res.success) {
        detailData.value = res.data
      }
    }
    getDetail()
    // 操作日志
    const logState = reactive({
      logList: [],
      logTotal: 0,
      logParams: {
        page: 1,
        rows: 10,
        params: context.root.$tools.handleSearchParam({
          userId: props.userData.id,
          catalog: 'Manager'
        })
      }
    })
    async function getLogList() {
      const res = await getLog(logState.logParams)
      if (res.success) {
        logState.logList = res.data.rows
        logState.logTotal = res.data.total
      }
    }
    getLogList()
    // 登录记录
    const loginState = reactive({
      loginList: [],
      loginTotal: 0,
      loginParams: {
        page: 1,
        rows: 10,
        params: context.root.$tools.handleSearchParam({
          account: props.userData.account
        })
      }
    })
    async function getLogin() {
      const res = await getTrack(loginState.loginParams)
      if (res.success) {
        loginState.loginList = res.data.rows
        loginState.loginTotal = res.data.total
      }
    }
    // tab切换
    function handleTab(tab: any) {
      if (tab.name === 'login' && loginState.loginList.length === 0) {
        getLogin()
      }
    }
    return {
      detailData,
      ...toRefs(loginState),
      getLogin,
      ...toRefs(logState),
      getLogList,
      handleTab
    }
  }
})
</script>
