/** * Created by HaijunZhang on 2019/12/18. */
<template>
  <el-header class="common-header">
    <div class="left">
      <img :src="pageConfigs.headerLogoCsc" alt="" />
      <el-divider direction="vertical"></el-divider>
      <router-link to="/dashboard">
        <i class="el-icon-s-home home-icon"></i>
      </router-link>
    </div>
    <div class="right">
      <BaseMenu class="base-menu" :menuData="topMenuData" :limit-level="3" :matchPath="$route.path" :basePath="basePath" mode="horizontal" default-icon="" v-bind="menuProps"></BaseMenu>
      <RightContent />
    </div>
  </el-header>
</template>

<script>
import { mapState } from 'vuex'
import BaseMenu from './sidebarMenu//baseMenu.vue'
// import SiteProject from './SiteProject'
import RightContent from './rightContent.vue'
import { computed } from '@vue/composition-api'
import { getTenant } from 'services/system/tenant'

export default {
  components: {
    RightContent,
    BaseMenu
  },
  props: {
    matchPath: {
      type: String
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      basePath: state => state.app.basePath,
      pageConfigs: state => state.app.pageConfig
    }),
    menuProps() {
      const { menuBgColour, menuFontColour, menuFontSelectColour, menuSelectColour } = this.pageConfigs
      return {
        backgroundColor: '#2d303e',
        textColor: '#cccccc',
        activeTextColor: '#ffffff',
        uniqueOpened: true
      }
    }
  },
  setup(props, context) {
    async function getTenants() {
      const data = await getTenant({ page: 1, rows: 10000, params: JSON.stringify([{ param: { id: context.root.$store.getters.userData.tenantId || context.root.$store.getters.userData.id }, sign: 'EQ' }]) })
      if (data.success) {
        context.root.$store.commit('SET_OPENFLOW', !!data.data?.rows?.[0]?.openFlow)
        context.root.$store.commit('SET_ISINSTALLSOFTWARE', !!data.data?.rows?.[0]?.isInstallSoftware)
        context.root.$store.commit('SET_PAYMENTMODE', JSON.parse(data.data?.rows?.[0]?.paymentMode || '["Hour","Month"]'))
      }
    }
    getTenants()
    const topMenuData = computed(() => {
      const data = context.root.$store.state.permission.topMenuData[0].children // 排除一级HOME菜单
      return data
        .filter(item => item.children?.length !== 0)
        .map(item => {
          if (item.children) {
            item.children.map(i => {
              if (i.name === 'FlowManage') {
                i.hidden = !(context.root.$store.state.app.userData.accountCategory === 'Tenant' && context.root.$store.state.app.openFlow)
              }
              return i
            })
          }
          return item
        }) // 排除没有子菜单的
    })
    return {
      topMenuData
    }
  }
}
</script>

<style lang="scss" scoped>
.common-header {
  display: flex;
  align-items: center;
  background: #2c2e3b;
  // color: #666;
  -webkit-box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  box-sizing: border-box;
  width: 100%;
  height: 50px !important;
  line-height: 50px;
  padding: 0 0 0 10px;
  overflow: hidden;
  .left {
    display: flex;
    align-items: center;
    img {
      height: 30px;
      margin: 0 15px;
    }
    .title {
      font-family: '微软雅黑 Bold', '微软雅黑';
      font-weight: 700;
      font-style: normal;
      color: #ffffff;
      margin-right: 25px;
    }
    .home-icon {
      color: #949495;
      font-size: 20px;
      margin-left: 10px;
      cursor: pointer;
    }
  }
  .right {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    .base-menu {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      background: inherit;
    }
  }
  & ::v-deep {
    .el-menu-item:not(.is-disabled):hover,
    .el-submenu:hover .el-submenu__title {
      color: #fff;
    }
    .el-menu-item {
      border-bottom: none;
    }
    .el-submenu .el-submenu__icon-arrow {
      position: static;
      vertical-align: middle;
      margin-left: 8px;
      margin-top: -3px;
    }
  }
}
</style>
<style>
.el-menu--horizontal .el-menu--popup .el-menu-item:not(.is-disabled):hover {
  color: #fff !important;
  background: #2d8cf0 !important;
}
</style>
