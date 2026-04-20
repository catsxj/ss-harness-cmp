<template>
  <el-tabs v-model="activeName">
    <el-tab-pane :label="item" :name="item" v-for="(item, index) in Object.keys(map)" :key="index" lazy>
      <Item :category="map[item]"></Item>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
import Item from './item.vue'
const map = {
  管理端文档: 'CMC',
  自服务文档: 'CSC'
}
export default {
  components: {
    Item
  },
  setup() {
    const state = reactive({
      activeName: '管理端文档'
    })
    return {
      ...toRefs(state),
      map
    }
  }
}
</script>

<style></style>
