<template>
  <div class="level-bar-container">
    <el-breadcrumb class="app-levelbar" separator="/">
      <el-breadcrumb-item v-for="(item, key) in matchedRoute" :key="item.path">
        <span v-if="key === 0" class="first-level"> <svg-icon :icon-name="item.meta.icon || 'icon-homebig'" class="level-icon"></svg-icon>{{ item.meta.title }} </span>
        <span v-else>{{ item.meta.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cacheRoute: {}
    }
  },
  computed: {
    matchedRoute() {
      // 判断是否为重定向路由，是重定向取之前的路由数据
      const isRedirect = this.$route.matched.some(item => {
        return item.name === 'Redirect'
      })
      let route = {}
      if (isRedirect) {
        route = Object.assign({}, this.cacheRoute)
      } else {
        route = this.$route
        this.updateCache()
      }
      return route.matched.filter(item => {
        return !item.meta.hiddenLevel
      })
    }
  },
  methods: {
    updateCache() {
      this.cacheRoute = Object.assign({}, this.$route)
    }
  }
}
</script>
<style scoped lang="scss">
.app-levelbar {
  display: inline-block;
  font-size: 12px;
}
.level-icon {
  font-size: 15px;
  margin-right: 5px;
  color: #b5b5b5;
}

.level-bar-container {
  height: 48px;
  line-height: 48px !important;
  ::v-deep .el-breadcrumb {
    line-height: inherit;
  }
}

.first-level {
  color: #b5b5b5 !important;
}
</style>
