<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-date-picker v-model="listQuery.date" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间"> </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="登录IP" v-model="listQuery.requestIp"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="响应地址" v-model="listQuery.responseIp"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </el-form-item>
      <el-form-item class="pull-right">
        <el-button type="ghost" @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
    <!-- TODO: cmp-element -->
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="登录账号" prop="username"> </el-table-column>
      <el-table-column label="登录IP" prop="requestIp"> </el-table-column>
      <el-table-column label="响应地址" prop="responseIp"> </el-table-column>
      <el-table-column label="登录结果" prop="status">
        <template #default="scope">
          {{ scope.row.status == true ? '成功' : '失败' }}
        </template>
      </el-table-column>
      <el-table-column label="登录时间" prop="gmtCreate"> </el-table-column>
    </basic-table>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { getTrack } from 'services/system/manager'
import { handleSearchParam } from 'utils'

interface ListQuery {
  date: string | unknown[]
  requestIp: string
  responseIp: string
}

interface Params {
  page: number
  rows: number
  params?: unknown
}

const route = useRoute()
const router = useRouter()

// TODO: type - 登录日志行数据结构未定义
const list = ref<any[]>([])
const total = ref(0)
const listQuery = reactive<ListQuery>({ date: '', requestIp: '', responseIp: '' })
const params = reactive<Params>({ page: 1, rows: 10 })

function goBack(): void {
  router.back()
}

function getList(): void {
  getTrack(params).then((data: any) => {
    if (data.success) {
      list.value = data.data.rows
      total.value = data.data.total
    }
  })
}

function handleSearch(): void {
  params.page = 1
  params.params = handleSearchParam({
    username: (route.params as any)?.name,
    'requestIp:LK': listQuery.requestIp,
    'responseIp:LK': listQuery.responseIp,
    'gmtCreate:RANGE': listQuery.date
  })
  getList()
}

onMounted(handleSearch)
</script>

<style scoped>
.search-item {
  width: 12%;
}
</style>
