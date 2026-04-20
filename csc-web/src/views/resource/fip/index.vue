<template>
  <el-card>
    <el-tabs ref="tab" tab-position="top" v-model="active">
      <el-tab-pane v-for="(item, index) in list" :label="item | vendorName" :name="item" :key="index"> </el-tab-pane>
    </el-tabs>
    <aws v-if="active == 'AWS'" ref="list"></aws>
    <op v-if="active == 'OPENSTACK'" ref="list"></op>
    <easy-stack v-if="active == 'EASYSTACK'" ref="list"></easy-stack>
    <tce v-if="active == 'TCE'" ref="list"></tce>
    <tencent v-if="active == 'TENCENT'" ref="list"></tencent>
    <huawei v-if="active == 'HUAWEI'" ref="list"></huawei>
    <ali v-if="active == 'ALIYUN'" ref="list"></ali>
    <cecstack v-if="active == 'CECSTACK'" ref="list"></cecstack>
    <azure v-if="active == 'AZURE'" ref="list"></azure>
  </el-card>
</template>

<script>
import ali from './ali/index.vue'
import cecstack from './cecstack/index.vue'
import op from './op/index.vue'
import easyStack from './easyStack/index.vue'
import huawei from './huawei/index.vue'
import tencent from './tencent/index.vue'
import tce from './tce/index.vue'
import aws from './aws/index.vue'
import azure from './azure/index.vue'
import { conditionService } from 'services/platform/index'
import webSocket from '@/common/mixins/getGlobalSocket'

export default {
  mixins: [webSocket],
  components: {
    ali,
    cecstack,
    op,
    huawei,
    tencent,
    aws,
    tce,
    azure,
    easyStack
  },
  data() {
    return {
      active: '',
      list: []
    }
  },
  created() {
    conditionService('eip').then(data => {
      if (data.success) {
        this.list = data.data
        this.active = this.$route.query.vendorType || this.list[0]
      }
    })
    console.log(this.$route.query.vendorType)
  },
  methods: {
    onmessage(data) {
      console.log(data)
      if (data.operate.indexOf('ip') > -1) this.$refs.list.getData()
    }
  }
}
</script>

<style></style>
