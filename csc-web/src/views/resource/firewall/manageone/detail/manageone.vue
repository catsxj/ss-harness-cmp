<template>
  <div>
    <el-tabs v-model="active">
      <el-tab-pane label="关联VPC" name="3">
        <router :detail="detail" v-if="active == '3'"></router>
      </el-tab-pane>
      <el-tab-pane label="设置ACL" name="4">
        <acl :detail="detail" v-if="active == '4'"></acl>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import router from './router/index'
import acl from './acl/index'
export default {
  components: { router, acl },
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      active: '3'
    }
  },
  methods: {},
  created() {},
  mounted() {}
}
</script>

<style></style>
