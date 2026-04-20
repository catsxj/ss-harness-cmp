<template>
  <el-aside width="130px" class="third-menu-container" :class="{ collapsed: isCollapsed }">
    <div class="menu-title">{{ menuData.meta && menuData.meta.title }}</div>
    <el-menu
      :default-active="route.path"
      router
      class="el-menu-vertical-demo third-menu"
      @select="selectItem"
    >
      <el-scrollbar class="scrollbar-wrapper">
        <el-menu-item
          v-for="item in menuData.children"
          :key="item.id"
          :index="item.path"
        >
          <template #title>
            <span v-if="!item.hidden">{{ item.meta && item.meta.title }}</span>
          </template>
        </el-menu-item>
      </el-scrollbar>
    </el-menu>
    <a href="javascript:;" class="subMenuToggle" @click="toggle"></a>
  </el-aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface ThirdMenuChild {
  id?: string | number
  path: string
  hidden?: boolean
  meta?: { title?: string; [key: string]: unknown }
}

interface ThirdMenuData {
  meta?: { title?: string; [key: string]: unknown }
  children?: ThirdMenuChild[]
}

defineProps<{ menuData: ThirdMenuData }>()

const route = useRoute()
const router = useRouter()
const isCollapsed = ref<boolean>(false)

function toggle(): void {
  isCollapsed.value = !isCollapsed.value
}

function selectItem(path: string): void {
  if (route.path.indexOf(path) > -1) {
    setTimeout(() => {
      router.push({ name: 'Redirect', query: { path: route.path } })
    })
  }
}
</script>

<style lang="scss" scoped>
.expire-top .third-menu {
  height: calc(100vh - 180px) !important;
}
.third-menu-container.collapsed {
  background: transparent !important;
  border: 0;
  margin-left: -116px;
  .third-menu,
  .menu-title {
    visibility: hidden;
  }
  .subMenuToggle {
    background: url(/web-common-resource/img/slideIcon-new.png) no-repeat right -110px;
    left: 0;
  }
}

.third-menu-container {
  transition: margin 0.28s;
  width: 130px;
  border-right: 1px solid #ebebeb;
  .scrollbar-wrapper {
    height: 100%;
    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden !important;
    }
  }
  .third-menu {
    height: calc(100vh - 150px);
    border: 0;
    .el-menu-item.is-active {
      background: #e7f4ff !important;
      border-right: 2px solid #2d8cf0;
    }
  }
}

.subMenuToggle {
  display: block;
  position: absolute;
  z-index: 2;
  left: 116px;
  top: 50%;
  width: 13px;
  height: 0;
  margin: -25px 0 0;
  padding: 50px 0 0;
  background: url(/web-common-resource/img/slideIcon-new.png) no-repeat 0 -60px;
  overflow: hidden;
  transition: width 0.1s, right 0.1s;
  &:hover {
    left: 110px;
    width: 20px;
    z-index: 3;
  }
}

.menu-title {
  visibility: visible;
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  background: #fff;
  border-bottom: 1px solid #ebebeb;
  color: #666;
  padding-left: 20px;
}
</style>
