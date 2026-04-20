<template>
  <el-dialog :title="'关联' + $store.getters.systemConfig.projectConfigLabel" :visible.sync="config.visible" width="700px">
    <el-transfer v-model="config.value" :props="props" :data="config.projects" :titles="['未选择', '已选择']" filterable :filter-method="filterMethod" filter-placeholder="请输入搜索内容"> </el-transfer>
    <span slot="footer" class="dialog-footer">
      <el-button @click="config.visible = false">取 消</el-button>
      <el-button type="primary" @click="sumbit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      props: {
        key: 'id',
        label: 'name'
      },
      filterMethod(query, item) {
        return item.name.indexOf(query) > -1
      }
    }
  },
  methods: {
    sumbit() {
      this.config.visible = false
      console.log(this.config.value)
      this.$emit('afterRelation', this.config.value)
    },
    getPostData() {
      return {
        groupIds: this.config.value
      }
    }
  }
}
</script>

<style scoped lang="scss">
.el-transfer {
  display: flex;
  justify-content: center;
  ::v-deep .el-transfer__buttons {
    display: flex;
    align-items: center;
    button {
      margin-bottom: 0 !important;
    }
  }
}
</style>
