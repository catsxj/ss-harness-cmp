<template>
  <div>
    <el-tabs ref="tab" tab-position="top" type="border-card" v-model="activeName">
      <el-tab-pane label="光纤口" name="1">
        <fiber ref="fiber" v-if="activeName == '1'"></fiber>
      </el-tab-pane>
      <el-tab-pane label="物理口" name="2">
        <physics ref="physics" v-if="activeName == '2'"></physics>
      </el-tab-pane>
      <el-tab-pane label="管理口" name="3">
        <manage ref="manage" v-if="activeName == '3'"></manage>
      </el-tab-pane>
      <el-tab-pane label="隧道口" name="4">
        <tunnel ref="tunnel" v-if="activeName == '4'"></tunnel>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import fiber from './fiber.vue'
import physics from './physics.vue'
import manage from './manage.vue'
import tunnel from './tunnel.vue'

export default {
  components: {
    fiber,
    physics,
    manage,
    tunnel
  },
  props: {},
  data() {
    return {
      activeName: '1'
    }
  },
  methods: {},
  mounted() {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
