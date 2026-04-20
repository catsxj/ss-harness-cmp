<template>
  <div class="service_panel fadeInLeft" @click.stop="" v-if="visible">
    <el-input class="m-b" placeholder="请输入关键字" suffix-icon="el-icon-search" v-model="searchText" @input="searchFilter"> </el-input>
    <waterfall :data="resultList" :col="3" :gutter-width="20" :width="300" ref="waterfall">
      <div class="service-card" v-for="(item, index) in resultList" :key="index">
        <div class="service-title">{{ item.name }}</div>
        <div class="service-item" v-for="(cell, key) in item.services" :key="key" @click="goPage(cell)">
          <div class="icon">
            <img :src="cell.icon || '/web-common-resource/img/u894.png'" alt="" />
          </div>
          <div class="content">
            <div class="title">{{ cell.name }}</div>
            <el-tooltip placement="bottom-start" :open-delay="200">
              <div slot="content" class="tip-remark">{{ cell.remark }}</div>
              <div class="remark">{{ cell.remark }}</div>
            </el-tooltip>
          </div>
          <div style="width: 20px" v-if="userData.accountCategory === 'Tenant'">
            <i class="el-icon-success operate" v-if="cell.subscribe" style="cursor: default" @click.stop></i>
            <i class="el-icon-circle-check operate subscribe" v-else @click.stop="subscribe()"></i>
          </div>
          <div style="width: 20px" v-else>
            <i class="el-icon-star-on operate" v-if="cell.favorite" @click.stop="operateFavorite(cell.id, 'cancel')"></i>
            <i class="el-icon-star-off operate" v-else @click.stop="operateFavorite(cell.id, 'submit')"></i>
          </div>
        </div>
      </div>
    </waterfall>
  </div>
</template>
<script>
import waterfall from './waterfall.vue'
import { getService, createFavorite, removeFavorite } from 'services/system/favorite'
export default {
  components: {
    /* eslint-disable vue/no-unused-components */
    waterfall
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchText: '',
      serviceList: [],
      resultList: []
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {
    this.getService()
  },
  methods: {
    // 搜索
    searchFilter(value) {
      if (!value) {
        this.resultList = this.serviceList
        return
      }
      const text = value.toLowerCase()
      this.resultList = []
      this.serviceList.forEach(item => {
        const services = item.services.filter(cell => cell.name.toLowerCase().includes(text))
        if (services.length) {
          this.resultList.push({
            name: item.name,
            services
          })
        }
      })
    },
    getService() {
      getService(this.userData.accountCategory).then(data => {
        if (data.success) {
          const result = data.data
            .map(item => {
              if (item.name === '存储') {
                const services = item.services.filter(cell => !['H3C', 'CNWARE'].includes(cell.vendorType))
                if (services.length) {
                  return {
                    name: item.name,
                    services
                  }
                }
              } else return item
            })
            .filter(Boolean)
          this.serviceList = result
          this.resultList = result
        }
      })
    },
    operateFavorite(id, type) {
      const http = type === 'submit' ? createFavorite : removeFavorite
      http(id, this.userData.accountCategory).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.$store.dispatch('GetFavorite')
          this.getService()
        }
      })
    },
    // 订阅
    subscribe() {
      this.$alert('请联系管理员进行服务开通申请')
    },
    goPage(cell) {
      if (this.userData.accountCategory === 'Tenant' && !cell.subscribe) {
        this.subscribe()
        return
      }
      this.$emit('goPage', cell)
    }
  }
}
</script>
<style lang="scss" scope>
.service_panel {
  border-left: 1px solid #ccc;
  background: #eef1f4;
  padding: 20px;
  z-index: 1;
  overflow: auto;
  .service-card {
    background: #fff;
    border: 1px solid #ebebeb;
    border-radius: 5px;
    padding: 20px 20px 0 20px;
    margin-bottom: 20px;
  }
  .service-title {
    font-weight: 700;
    font-style: normal;
    font-size: 14px;
    text-align: left;
    margin-bottom: 15px;
  }
  .service-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    cursor: pointer;
    &:hover {
      .title {
        color: #2d9af4;
      }
      .el-icon-star-off,
      .subscribe {
        display: inline-block;
      }
    }
    .icon img {
      margin-top: 4px;
      width: 32px;
      height: 32px;
    }
    .content {
      text-align: left;
      padding: 0 10px;
      flex: 1;
      .remark {
        display: -webkit-box;
        height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        margin-top: 5px;
        font-size: 12px;
        color: #999999;
      }
      .tip-remark {
        max-width: 200px;
        word-break: break-all;
      }
    }
    .el-icon-star-off,
    .subscribe {
      display: none;
    }
    .operate {
      color: #2d9af4;
    }
  }
}
</style>
