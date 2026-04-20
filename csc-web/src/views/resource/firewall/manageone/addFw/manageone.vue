<template>
  <div>
    <basic-form-item label="名称" prop="name" validate="required">
      <el-input v-model="addData.name"></el-input>
    </basic-form-item>
    <el-form-item label="描述" prop="remark">
      <el-input v-model="addData.remark"></el-input>
    </el-form-item>
  </div>
</template>

<script>
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          name: ''
        }
      }
    },
    vendorId: {
      type: [String, Number]
    },
    title: {
      type: String
    }
  },
  data() {
    return {}
  },
  methods: {},
  created() {}
}
</script>

<style scoped></style>
