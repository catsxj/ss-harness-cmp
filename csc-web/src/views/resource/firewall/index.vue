<template>
  <el-card>
    <el-tabs ref="tab" tab-position="top" v-model="active">
      <el-tab-pane label="OpenStack" name="OPENSTACK" v-if="active == 'OPENSTACK'">
        <op></op>
      </el-tab-pane>
      <el-tab-pane label="EasyStack" name="EASYSTACK" v-if="active == 'EASYSTACK'">
        <easy-stack></easy-stack>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import op from './op/index.vue'
import easyStack from './easyStack/index'
export default {
  components: {
    op,
    easyStack
  },
  data() {
    return {
      active: 'OPENSTACK'
    }
  },
  methods: {},
  created() {},
  mounted() {},
  watch: {}
}
</script>

<style></style>
