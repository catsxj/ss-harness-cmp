<template>
  <el-card>
    <el-tabs ref="tab" tab-position="top" v-model="active">
      <el-tab-pane v-for="(item, index) in list" :label="item | vendorName" :name="item" :key="index"> </el-tab-pane>
    </el-tabs>
    <op v-if="active == 'OPENSTACK'"></op>
    <easy-stack v-if="active == 'EASYSTACK'"></easy-stack>
    <aws v-if="active == 'AWS'"></aws>
    <tce v-if="active == 'TCE'"></tce>
    <tencent v-if="active == 'TENCENT'"></tencent>
    <huawei v-if="active == 'HUAWEI'"></huawei>
    <ali v-if="active == 'ALIYUN'"></ali>
    <qcloud v-if="active === 'QCLOUD'"></qcloud>
    <cecstack v-if="active == 'CECSTACK'"></cecstack>
  </el-card>
</template>

<script>
import ali from './ali/index.vue'
import qcloud from './qcloud/index.vue'
import cecstack from './cecstack/index.vue'
import op from './op/index.vue'
import easyStack from './easyStack/index.vue'
import huawei from './huawei/index.vue'
import tencent from './tencent/index.vue'
import tce from './tce/index.vue'
import aws from './aws/index.vue'
import { conditionService } from 'services/platform/index'

export default {
  components: {
    ali,
    qcloud,
    cecstack,
    op,
    huawei,
    tencent,
    aws,
    tce,
    easyStack
  },
  data() {
    return {
      active: '',
      list: []
    }
  },
  created() {
    conditionService('vpc').then(data => {
      if (data.success) {
        this.list = data.data
        this.active = this.$route.query.vendorType || this.list[0]
      }
    })
  }
}
</script>

<style></style>
