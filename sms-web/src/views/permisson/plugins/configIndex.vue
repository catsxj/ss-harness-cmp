<template>
  <div class="wrapper">
    <el-row :gutter="10">
      <el-col :span="6" v-for="item in currentData" :key="item.id">
        <el-card :class="item.status ? 'open' : 'close'">
          <template #header>
            <div class="header">
              <span :style="{ color: item.status ? '#409eff' : '#ed711f' }">{{ item.status ? '已开启' : '已关闭' }}</span>
              <el-switch v-model="item.status" active-color="#409eff" @change="editStatus(item.id, !item.status)"></el-switch>
            </div>
          </template>
          <p>{{ item.name }}</p>
          <p>{{ item.code }}</p>
        </el-card>
      </el-col>
    </el-row>
    <div class="footer">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="12" :current-page="currentPage" @current-change="getPage"> </el-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getPluginsConfig, updateStatus } from 'services/services/plugins'

const listData = ref<any[]>([])
const currentData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)

async function getList() {
  const { data, success } = await getPluginsConfig()
  if (success) {
    listData.value = data
    total.value = data.length
    getPage(currentPage.value)
  }
}
getList()

const editStatus = async (id: number, status: boolean) => {
  const { success, message } = await updateStatus(id, !status)
  if (success) {
    ElMessage.success(message)
    getList()
  }
}

const getPage = (val: number) => {
  currentPage.value = val
  currentData.value = listData.value.filter((_item, index) => index >= (val - 1) * 12 && index < val * 12)
}
</script>

<style lang="scss" scoped>
.wrapper {
  padding-bottom: 10px;
}
:deep(.el-card) {
  margin: 10px 0;
  height: 180px !important;
  p:first-child {
    font-weight: 600;
  }
  p:last-child {
    font-size: 14px;
    color: #555;
  }
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close {
  border: 1px solid #ed711f;
}
.open {
  border: 1px solid #409eff;
}
.footer {
  text-align: right;
}
</style>
