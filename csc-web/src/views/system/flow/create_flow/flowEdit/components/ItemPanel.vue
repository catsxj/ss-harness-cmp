<template>
  <div id="Itempannel">
    <el-scrollbar class="scrollbar-wrapper">
      <el-menu class="el-menu-vertical-demo sider-menu" unique-opened>
        <template v-for="row in data">
          <ItemPanelItem :itemData="row" :key="row.name"></ItemPanelItem>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import ItemPanelItem from './ItemPanelItem'

export default {
  components: {
    ItemPanelItem
  },
  data() {
    return {
      data: [
        {
          name: '审核节点',
          code: 'auditTask',
          icon: '/web-common-resource/img/flow/audit.png',
          shape: { shape: 'audit-node' }
        },
        {
          name: '分支节点',
          code: 'fork',
          icon: '/web-common-resource/img/flow/branch.png',
          shape: { shape: 'fork-node' }
        },
        {
          name: '聚合节点',
          code: 'join',
          icon: '/web-common-resource/img/flow/merge.png',
          shape: { shape: 'join-node' }
        }
      ]
    }
  },
  created() {},
  methods: {}
}
</script>
<style lang="scss" scoped>
#Itempannel {
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  background: #fff;
  width: 200px;
  padding-top: 8px;
  border-right: 1px solid #e6e9ed;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  .scrollbar-wrapper {
    height: 100%;
    .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }
  }
  .sider-menu {
    height: 100%;
    & >>> .el-submenu__title {
      border-bottom: 1px solid #eee !important;
      & > i {
        margin-right: 6px;
      }
    }
  }
}
</style>
