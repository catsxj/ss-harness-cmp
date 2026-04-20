<template>
  <div class="screen-container" title="大屏列表">
    <el-row :gutter="20">
      <el-col :lg="12" :sm="24" v-for="(item, index) in list" :key="index">
        <el-card class="card" :body-style="{ padding: '0px' }" @click.native="goPage(item.path)" v-if="pageConfigs[item.code] !== 'false'">
          <img :src="item.bg" class="image" />
          <div class="footer-title">
            <span>{{ screenConfigs[item.code] }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { reactive, toRefs, ref, computed } from '@vue/composition-api'
import { goScreenWeb } from './utils'
import { getDictChildren } from 'services/system/dictionary'
export default {
  setup(props, context) {
    const pageConfigs = computed(() => context.root.$store.getters.pageConfig)
    const state = reactive({
      list: [
        {
          code: 'RESOURCE_SCREEN',
          bg: require('assets/screen/resource.png'),
          path: '/screen/resource'
        },
        {
          code: 'COUNT_SCREEN',
          bg: require('assets/screen/count.png'),
          path: '/screen/count'
        },
        {
          code: 'OPERATION_SCREEN',
          bg: require('assets/screen/operation.png'),
          path: '/screen/operation'
        },
        {
          code: 'ORDER_SCREEN',
          bg: require('assets/screen/order.png'),
          path: '/screen/order'
        }
      ]
    })
    const screenConfigs = ref({})
    async function getScreenConfigs() {
      const data = await getDictChildren({ value: 'SYSTEM_SCREEN' })
      if (data.success) {
        const obj = {}
        data.data.forEach((item) => {
          const { name, value } = item
          obj[value] = name
        })
        screenConfigs.value = obj
      }
    }
    getScreenConfigs()
    function goPage(path) {
      goScreenWeb(path)
    }
    return {
      ...toRefs(state),
      pageConfigs,
      screenConfigs,
      goPage
    }
  }
}
</script>
<style lang="scss" scoped>
.screen-container {
  padding: 0 15px;
  .card {
    cursor: pointer;
    border: none;
    background: #0a48a5;
    color: #fff;
    margin: 10px 0;
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
  .image {
    height: calc(100vw / 2 * 1080 / 1920);
  }
}
</style>
