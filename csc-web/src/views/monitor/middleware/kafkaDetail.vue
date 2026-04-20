<template>
  <div>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="instance" label="实例">
        <instance ref="instance" v-if="activeName == 'instance'" :detail-id="detailId" :detail="detail"></instance>
      </el-tab-pane>
      <el-tab-pane name="topic" label="Topic">
        <topic ref="topic" v-if="activeName == 'topic'" :detail-id="detailId"></topic>
      </el-tab-pane>
      <el-tab-pane name="consumer" label="Consumer Group">
        <consumer ref="consumer" v-if="activeName == 'consumer'" :detail-id="detailId"></consumer>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import instance from './kafkaDetailInstance.vue'
import topic from './kafkaDetailTopic'
import consumer from './kafkaDetailConsumer'
export default {
  components: { instance, topic, consumer },
  props: {
    detailId: {
      type: Number
    },
    detail: {
      type: Object
    }
  },
  data() {
    return {
      activeName: 'instance'
    }
  },
  methods: {},
  created() {},
  mounted() {}
}
</script>
<style scoped></style>
