<template>
  <div class="drawer-modal" @click="$emit('close')">
    <el-aside width="240px" class="side-menu fadeInLeft" @click.native.stop="">
      <div class="service-trigger" @mouseenter="openPanel">
        <span class="icon-wrapper">
          <i class="el-icon-s-operation" style="font-size: 16px; color: #42a4ff"></i>
        </span>
        <span>产品与服务</span>
        <span class="right-wrapper pull-right">
          <i class="el-icon-arrow-right"></i>
        </span>
      </div>
      <div class="menu-list">
        <draggable v-model="cacheFavorite" handle=".el-icon-rank" animation="200" @start="draging = true" @end="draging = false" @change="changeData">
          <transition-group type="transition">
            <a class="menu-cell" :class="{ draging: draging }" v-for="item in cacheFavorite" :key="item.id" @click="goPage(item)">
              <span class="icon">
                <img :src="item.icon || '/web-common-resource/img/u894.png'" alt="" />
              </span>
              <span class="name">{{ item.name }}</span>
              <span class="operate">
                <i class="el-icon-close" v-if="userData.accountCategory === 'User'" @click.stop="cancelFavorite(item.id)"></i>
                <i class="el-icon-rank"></i>
              </span>
            </a>
          </transition-group>
        </draggable>
      </div>
    </el-aside>
    <ServicePanel ref="service" v-show="panelVisible" :visible="panelVisible" @goPage="goPage"></ServicePanel>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import ServicePanel from './servicePanel.vue'
import goPageMixins from './goPageMixins'
import { orderFavorite } from 'services/system/favorite'

export default {
  components: { ServicePanel, draggable },
  mixins: [goPageMixins],
  props: {
    favoriteList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    cacheFavorite: {
      get() {
        return [...this.favoriteList]
      },
      set(newVal) {
        this.orderFavorite(newVal)
      }
    },
    userData() {
      return this.$store.state.app.userData
    }
  },
  data() {
    return {
      draging: false,
      panelVisible: false
    }
  },
  created() {},
  methods: {
    cancelFavorite(id) {
      this.$refs.service.operateFavorite(id, 'cancel')
    },
    // 排序
    orderFavorite(list) {
      this.$store.commit('SET_FAVORITE', list)
      const data = list.map((item, index) => {
        return {
          id: item.id,
          priority: index
        }
      })
      orderFavorite(data, this.userData.accountCategory).then(data => {
        if (data.success) {
          // this.$store.dispatch('GetFavorite');
        }
      })
    },
    changeData() {},
    openPanel() {
      this.panelVisible = true
    },
    close() {
      this.panelVisible = false
    }
  }
}
</script>
<style lang="scss" scope>
.drawer-modal {
  display: flex;
  z-index: 1999;
  position: fixed;
  left: 0;
  width: 100%;
  height: calc(100% - 50px);
  top: 50px;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  .side-menu {
    height: 100%;
    width: 240px;
    color: #666;
    background: #fff;
    z-index: 9999;
    overflow: hidden;
    .service-trigger {
      text-align: left;
      height: 48px;
      line-height: 48px;
      border-bottom: 1px solid rgb(222, 222, 222);
      .icon-wrapper {
        display: inline-block;
        width: 50px;
        text-align: center;
      }
      .right-wrapper {
        width: 40px;
        text-align: center;
      }
    }
  }
  .menu-list {
    height: calc(100% - 50px);
    overflow: auto;
    .menu-cell {
      display: flex;
      align-items: center;
      padding: 0 15px;
      height: 48px;
      font-size: 12px;
      color: #666666;
      &:not(.draging):hover {
        background: #e7f4ff;
        color: #2d8cf0;
        .operate {
          display: flex;
        }
      }
      .icon img {
        width: 16px;
        height: 16px;
      }
      .name {
        flex: 1;
        text-align: left;
        padding-left: 20px;
      }
      .operate {
        display: none;
        font-size: 17px;
        color: #9b9b9b;
        .el-icon-rank {
          margin-left: 2px;
          cursor: move;
        }
      }
    }
  }
}
</style>
<style>
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translate3d(-100%, 0, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
.fadeInLeft {
  animation: fadeInLeft;
}
</style>
