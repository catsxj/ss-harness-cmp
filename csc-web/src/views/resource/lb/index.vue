<template>
  <el-card>
    <el-tabs ref="tab" tab-position="top" v-model="active">
      <el-tab-pane v-for="(item, index) in list" :label="item | vendorName" :name="item" :key="index"> </el-tab-pane>
    </el-tabs>
    <ali v-if="active == 'ALIYUN'"></ali>
    <aws v-if="active == 'AWS'"></aws>
    <azure v-if="active == 'AZURE'"></azure>
  </el-card>
</template>

<script>
import ali from './ali/index.vue'
import aws from './aws/index.vue'
import azure from './azure/index.vue'
import { conditionService } from 'services/platform/index'
export default {
  components: {
    ali,
    aws,
    azure
  },
  data() {
    return {
      active: '',
      list: []
    }
  },
  methods: {},
  created() {
    conditionService('slb').then(data => {
      if (data.success) {
        this.list = data.data
        this.active = this.$route.query.vendorType || this.list[0]
      }
    })
  },
  mounted() {},
  watch: {}
}
</script>

<style></style>
