<template>
  <el-menu-item :index="itemData.code" :key="itemData.code" class="getItem" data-type="node" draggable="false" :data-icon="itemData.icon" :data-shape="shape.shape" :data-code="itemData.code" :data-size="shape.size || '170*34'" :data-color="shape.color" :data-label="itemData.name">
    <img class="img" :src="itemData.icon" alt="" />
    <span>{{ itemData.name }}</span>
  </el-menu-item>
</template>

<script>
export default {
  props: {
    itemData: {
      type: Object
    }
  },
  computed: {
    shape() {
      return this.itemData.shape
    }
  },
  data() {
    return {}
  }
}
</script>
<style lang="scss" scoped>
.el-menu-item {
  border-bottom: 1px solid #eee;
  &:hover {
    cursor: move;
  }
  .img {
    width: 18px;
    height: 18px;
    display: inline-block;
    vertical-align: middle;
    margin-right: 6px;
  }
}
</style>
