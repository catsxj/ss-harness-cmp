<template>
  <dv-border-box-10 class="container" title="大屏列表">
    <el-row :gutter="20" class="card-container">
      <el-col  :lg="12" :sm="24"  v-for="(item, index) in list" :key="index">
        <el-card class="card" :body-style="{ padding: '0px' }" @click.native="goPage(item.path)">
          <img :src="item.bg" class="image">
          <div class="footer-title">
            <span>{{screenConfigs[item.code]}}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </dv-border-box-10>
</template>

<script>
import { computed, reactive, toRefs } from '@vue/composition-api'
export default {
  setup(props, context) {
    const state = reactive({
      list: [
        {
          code: 'RESOURCE_SCREEN',
          bg: require('assets/img/list/resource.png'),
          path: '/screen/resource'
        },
        {
          code: 'COUNT_SCREEN',
          bg: require('assets/img/list/count.png'),
          path: '/screen/count'
        },
        {
          code: 'OPERATION_SCREEN',
          bg: require('assets/img/list/operation.png'),
          path: '/screen/operation'
        },
        {
          code: 'ORDER_SCREEN',
          bg: require('assets/img/list/order.png'),
          path: '/screen/order'
        }
      ]
    })
    function goPage(path) {
      context.root.$router.push(path)
    }
    const screenConfigs = computed(() => context.root.$store.getters.screenConfigs)
    return {
      ...toRefs(state),
      goPage,
      screenConfigs
    }
  }
}
</script>
<style lang="scss">
.container {
  height: 100vh;
  background-size: 100% 100%;
  .card-container {
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
    height: 100vh;
  }
  .card {
    cursor: pointer;
    border: none;
    background: #0a48a5;
    color: #fff;
    margin-bottom: 10px ;
  }
}
.footer-title {
  padding: 14px;
  font-size: 16px;
  background: #01255e;
  margin-top: -2px;
}
.image {
  width: 100%;
}
// @media screen and (min-width: 1920px) {
//   .image{
//       height: calc(100vw / 4 * 1080 / 1920);
//   }
// }
@media screen and (min-width: 1200px) {
  .image{
      height: calc(100vw / 2 * 1080 / 1920);
  }
}
</style>
