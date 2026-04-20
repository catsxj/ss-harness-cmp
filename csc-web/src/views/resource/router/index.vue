<template>
  <el-card>
    <el-tabs ref="tab" tab-position="top" v-model="active">
      <el-tab-pane label="OpenStack" name="OPENSTACK">
        <op v-if="active == 'OPENSTACK'"></op>
      </el-tab-pane>
      <!-- <el-tab-pane label="EASYSTACK" name="EASYSTACK" >
        <easy-stack v-if="active == 'EASYSTACK'"></easy-stack>
      </el-tab-pane> -->
    </el-tabs>
  </el-card>
</template>

<script>
import op from './op/index.vue'
import easyStack from './easyStack/index.vue'
export default {
  components: {
    op
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
