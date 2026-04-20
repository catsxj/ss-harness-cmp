<template>
  <el-col :span="6" style="width: 160px">
    <el-card class="service-menu">
      <template #header>
        <span>服务目录</span>
        <el-button class="reset-btn" type="text" @click="handleNodeClick('')">全部</el-button>
      </template>
      <el-menu class="el-menu-vertical-demo" :default-active="nodeId" @select="handleNodeClick">
        <el-menu-item v-for="item in menuData" :key="item.code" :index="`${item.id}`">
          <img :src="item.icon" alt="" />
          <template #title><span>{{ item.name }}</span></template>
        </el-menu-item>
      </el-menu>
    </el-card>
  </el-col>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCatalog } from 'services/services/spec'

const emit = defineEmits<{ nodeClick: [id: string] }>()

const menuData = ref<any[]>([])
const nodeId = ref<string>('')

onMounted(() => {
  getTreeMenu()
})

function getTreeMenu() {
  getCatalog().then((data: any) => {
    if (data.success) {
      menuData.value = data.data.rows
    }
  })
}

function handleNodeClick(id: string) {
  nodeId.value = id
  emit('nodeClick', id)
}
</script>

<style lang="scss" scoped>
.service-menu {
  :deep(.el-card__body) {
    padding: 0;
  }
  :deep(.el-menu) {
    border-right: none;
    .el-menu-item img {
      margin-right: 5px;
      height: 15px;
      width: 15px;
    }
    .el-menu-item.is-active {
      background: #ecf5ff;
    }
  }
}
.reset-btn {
  float: right;
  margin-top: 4px;
}
</style>
