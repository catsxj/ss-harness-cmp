/** * Created by HaijunZhang on 2019/12/18. */
<template>
  <el-header class="common-header" :style="style">
    <div class="header-logo">
      <img :src="pageConfigs.headerLogo" alt="" class="pull-left" />
    </div>
    <el-divider class="split-line" direction="vertical"></el-divider>
    <router-link to="/resource_dashboard">
      <i class="el-icon-s-home home-icon m-r"></i>
    </router-link>
    <HeaderMenu :page-configs="pageConfigs"></HeaderMenu>
    <RightContent />
  </el-header>
</template>

<script>
import RightContent from './rightContent.vue'
import HeaderMenu from './headerMenu.vue'
import { computed } from 'vue'

export default {
  components: {
    RightContent,
    HeaderMenu
  },
  setup(props, context) {
    const pageConfigs = computed(() => context.root.$store.getters.pageConfig)
    const style = computed(() => {
      return {
        backgroundColor: pageConfigs.value.headerBgColour,
        color: pageConfigs.value.headerFontColour
      }
    })
    return {
      pageConfigs,
      style
    }
  }
}
</script>

<style lang="scss" scoped>
.common-header {
  display: flex;
  align-items: center;
  -webkit-box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  box-sizing: border-box;
  width: 100%;
  height: 50px !important;
  font-size: 22px;
  line-height: 50px;
  padding: 0 0 0 10px;
  overflow: hidden;
  background: #2c2e3b;
  color: #b9b9ba;
  & ::v-deep .el-dropdown {
    color: inherit !important;
  }
  .header-logo {
    min-width: 120px;
    max-width: 260px;
    img {
      height: 30px;
      margin: 4.5px 10px;
    }
  }
  .split-line {
    margin-left: 30px;
    margin-right: 15px;
  }
  .toggle-class {
    height: 50px;
    line-height: 43px;
    cursor: pointer;
    margin-left: 15px;
  }
}
</style>
