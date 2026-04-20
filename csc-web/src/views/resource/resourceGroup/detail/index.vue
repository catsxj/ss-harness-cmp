<template>
  <div>
    <el-tabs ref="tab" tab-position="top" type="border-card" v-model="active">
      <el-tab-pane label="云主机" name="1">
        <vm ref="vm" :detail="detail" v-if="active == '1'"></vm>
      </el-tab-pane>
      <el-tab-pane label="MySQL" name="2">
        <mysql ref="mysql" :detail="detail" v-if="active == '2'"></mysql>
      </el-tab-pane>
      <el-tab-pane label="Redis" name="3">
        <redis ref="redis" :detail="detail" v-if="active == '3'"></redis>
      </el-tab-pane>
      <el-tab-pane label="DDoS" name="4">
        <ddos ref="ddos" :detail="detail" v-if="active == '4'"></ddos>
      </el-tab-pane>
      <el-tab-pane label="云硬盘" name="5">
        <volume ref="volume" :detail="detail" v-if="active == '5'"></volume>
      </el-tab-pane>
      <el-tab-pane label="存储账户" name="6">
        <account ref="account" :detail="detail" v-if="active == '6'"></account>
      </el-tab-pane>
      <el-tab-pane label="虚拟私有网络" name="7">
        <ip ref="ip" :detail="detail" v-if="active == '7'"></ip>
      </el-tab-pane>
      <el-tab-pane label="弹性IP" name="8">
        <publics ref="public" :detail="detail" v-if="active == '8'"></publics>
      </el-tab-pane>
      <el-tab-pane label="负载均衡" name="9">
        <lb ref="lb" :detail="detail" v-if="active == '9'"></lb>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import vm from './vm.vue'
import mysql from './mysql.vue'
import redis from './redis'
import ddos from './ddos'
import volume from './volume'
import account from './account'
import ip from './ip.vue'
import lb from './lb'
import publics from './publicIp'
export default {
  mixins: [webSocket],
  components: {
    vm,
    mysql,
    redis,
    ddos,
    volume,
    account,
    ip,
    lb,
    publics
  },
  props: {
    detail: {
      type: Object
    }
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
      total: 0,
      active: '1'
    }
  }
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
