<template>
  <el-col :span="6" style="width: 160px">
    <el-card class="service-menu">
      <div slot="header">
        <span>服务目录</span>
        <el-button class="reset-btn" type="text" @click="handleNodeClick('')">全部</el-button>
      </div>
      <el-menu class="el-menu-vertical-demo" :default-active="nodeId" @select="handleNodeClick">
        <el-menu-item v-for="item in menuData" :key="item.code" :index="`${item.id}`">
          <img :src="item.icon" alt="" />
          <span slot="title">{{ item.name }}</span>
        </el-menu-item>
      </el-menu>
    </el-card>
  </el-col>
</template>
<script>
import { getCatalog } from 'services/services/spec'
export default {
  data() {
    return {
      menuData: [],
      nodeId: ''
    }
  },
  created() {
    this.getTreeMenu()
  },
  methods: {
    getTreeMenu() {
      getCatalog().then((data) => {
        if (data.success) {
          this.menuData = data.data.rows
        }
      })
    },
    handleNodeClick(id) {
      this.nodeId = id
      this.$emit('nodeClick', id)
    }
  }
}
</script>
<style lang="scss" scoped>
.service-menu {
  ::v-deep {
    .el-card__body {
      padding: 0;
    }
    .el-menu {
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
}
.reset-btn {
  float: right;
  margin-top: 4px;
}
</style>
