<template>
  <el-aside width="48px" class="aside-bar" @mouseenter.native="openDrawer" @mouseleave.native="closeTime">
    <div class="toggle-class">
      <i class="el-icon-s-operation"></i>
    </div>
    <div class="icon-list">
      <div class="icon-cell" v-for="item in favoriteList" :key="item.id">
        <img :src="item.icon || '/web-common-resource/img/u894.png'" alt="" />
      </div>
    </div>
    <Drawer v-if="drawerVisible" @close="close" :favorite-list="favoriteList"></Drawer>
  </el-aside>
</template>
<script>
import Drawer from './drawer.vue'

export default {
  components: {
    Drawer
  },
  data() {
    return {
      drawerVisible: false,
      timer: 0
    }
  },
  computed: {
    favoriteList() {
      return this.$store.state.favorite.favoriteList
    }
  },
  created() {
    this.$store.dispatch('GetFavorite')
  },
  methods: {
    openDrawer() {
      if (this.drawerVisible) return
      this.timer = setTimeout(() => {
        this.drawerVisible = true
      }, 600)
    },
    close() {
      this.drawerVisible = false
    },
    closeTime() {
      clearTimeout(this.timer)
    }
  }
}
</script>
<style lang="scss" scope>
.aside-bar {
  background: #fff;
  text-align: center;
  border-right: 1px solid #ebebeb;
  z-index: 1999;
  overflow: hidden;
  .toggle-class {
    height: 48px;
    line-height: 48px;
    border-bottom: 1px solid #ebebeb;
    color: #42a4ff;
    cursor: pointer;
  }
  .icon-list {
    display: flex;
    flex-direction: column;
    .icon-cell {
      height: 48px;
      line-height: 48px;
      cursor: pointer;
      img {
        height: 16px;
        width: 16px;
      }
    }
  }
}
</style>
