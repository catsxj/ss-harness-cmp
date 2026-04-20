<template>
  <basic-table :data="connections">
    <el-table-column prop="role" label="角色" show-overflow-tooltip width="200px"></el-table-column>
    <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
    <div slot="pagination"></div>
  </basic-table>
</template>

<script>
export default {
  props: {
    connections: {
      type: Array
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {}
}
</script>
<style scoped></style>
