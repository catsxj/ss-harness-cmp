<template>
  <div>
    <el-tabs ref="tab" tab-position="top" type="border-card" value="1" @tab-click="tabClick()">
      <el-tab-pane label="防火墙" name="1">
        <fire-wall ref="firewall"></fire-wall>
      </el-tab-pane>
      <el-tab-pane label="策略" name="2">
        <firewall-policy ref="policy"></firewall-policy>
      </el-tab-pane>
      <el-tab-pane label="规则" name="3">
        <firewall-rule ref="rule"></firewall-rule>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import fireWall from './firewall.vue'
import firewallPolicy from './firewall_policy.vue'
import firewallRule from './firewall_rule.vue'

export default {
  mixins: [webSocket],
  components: {
    fireWall,
    firewallPolicy,
    firewallRule
  },
  data() {
    return {
      tabPosition: 'top',
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      tableData: [],
      total: 0
    }
  },
  methods: {
    onmessage(data) {
      if (location.hash === '#/resource/firewall') {
        this.tabClick()
      }
    },
    tabClick() {
      switch (this.$refs.tab.currentName) {
        case '1':
          this.$refs.firewall.handleSearch()
          break
        case '2':
          this.$refs.policy.handleSearch()
          break
        case '3':
          this.$refs.rule.handleSearch()
          break
      }
    }
  },
  created() {},
  mounted() {
    this.tabClick()
  },
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
