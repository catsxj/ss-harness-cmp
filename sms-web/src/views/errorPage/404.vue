<template>
  <div class="zBox">
    <img src="/web-common-resource/img/error/404.png" alt="" />
    <div class="zSorry">抱歉，你访问的页面不存在！</div>
    <div>
      <el-button type="primary" @click="go">
        <el-icon><Back /></el-icon>
        返回
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Back } from '@element-plus/icons-vue'

const router = useRouter()

function go(): void {
  router.go(-1)
}
</script>

<style scoped>
.zBox {
  width: 400px;
  height: 200px;
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
}

.zSorry {
  color: #666;
  font-size: 16px !important;
  margin-top: 32px;
  margin-bottom: 28px;
}

.zBox button {
  width: 98px;
  height: 28px;
  font-size: 12px;
}
</style>
