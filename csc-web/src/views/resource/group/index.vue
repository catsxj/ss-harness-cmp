<template>
  <el-card>
    <el-tabs v-model="active">
      <el-tab-pane v-for="(item, index) in typelist" :label="item | vendorName" :name="item" :key="index"> </el-tab-pane>
    </el-tabs>
    <ali v-if="active == 'ALIYUN'"></ali>
    <huawei v-if="active == 'HUAWEI'"></huawei>
    <op v-if="active == 'OPENSTACK'"></op>
    <easy-stack v-if="active == 'EASYSTACK'"></easy-stack>
    <tencent v-if="active == 'TENCENT'"></tencent>
    <tce v-if="active == 'TCE'"></tce>
    <aws v-if="active == 'AWS'"></aws>
    <azure v-if="active == 'AZURE'"></azure>
    <fusion-sphere v-if="active == 'FUSIONSPHERE'"></fusion-sphere>
    <zstack v-if="active == 'ZSTACK'"></zstack>
    <cecstack v-if="active == 'CECSTACK'"></cecstack>
  </el-card>
</template>

<script>
import ali from './ali/index.vue'
import huawei from './huawei/index.vue'
import tencent from './tencent/index.vue'
import tce from './tce/index.vue'
import op from './op/index.vue'
import easyStack from './easyStack/index.vue'
import aws from './aws/index.vue'
import azure from './azure/index.vue'
import zstack from './zstack/index.vue'
import cecstack from './cecstack/index.vue'
import fusionSphere from './fusionSphere/index.vue'
import { conditionService } from 'services/platform/index'

export default {
  components: {
    ali,
    huawei,
    tencent,
    op,
    aws,
    tce,
    azure,
    fusionSphere,
    easyStack,
    zstack,
    cecstack
  },
  data() {
    return {
      active: '',
      typelist: []
    }
  },
  methods: {},
  created() {
    const showList = ['ALIYUN', 'HUAWEI', 'OPENSTACK', 'TENCENT', 'TCE', 'AWS', 'AZURE', 'FUSIONSPHERE', 'EASYSTACK', 'ZSTACK', 'CECSTACK']
    conditionService('server').then(data => {
      if (data.success) {
        this.typelist = []
        data.data.forEach(item => {
          if (showList.indexOf(item) > -1) this.typelist.push(item)
        })
        this.active = this.$route.query.vendorType || this.typelist[0]
      }
    })
  },
  mounted() {},
  watch: {}
}
</script>

<style></style>
