<template>
  <el-tabs v-model="activeName" type="border-card">
    <el-tab-pane name="CheckList" label="优化清单">
      <CheckList v-if="activeName == 'CheckList'"></CheckList>
    </el-tab-pane>
    <el-tab-pane name="Rule" label="规则配置">
      <Rule v-if="activeName == 'Rule'"></Rule>
    </el-tab-pane>
    <el-tab-pane name="Whitelist" label="白名单管理">
      <Whitelist v-if="activeName == 'Whitelist'"></Whitelist>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import CheckList from './checklist.vue'
import Rule from './rule.vue'
import Whitelist from './whitelist.vue'

export default {
  components: {
    CheckList,
    Rule,
    Whitelist
  },
  data() {
    return {
      activeName: 'CheckList'
    }
  }
}
</script>
