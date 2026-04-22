<template>
    <el-dropdown trigger="hover" class="custom-tree-menu" size="small">
        <i class="el-icon-more rotate " />
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for='(item,index) in events' :key="index" :divided="index >0" @click.native="clickMenu(item)">
                {{item.label}}
            </el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
</template>
<script>
export default {
  props: {
    events: {
      type: Array,
      default: function() {
        return [
          {
            label: '编辑',
            funcName: 'editNode'
          },
          {
            label: '删除',
            funcName: 'deleteNode'
          },
          {
            label: '新建子节点',
            funcName: 'addNode'
          }
        ]
      }
    },
    // 注入数据
    data: {
      type: Object
    }
  },
  methods: {
    clickMenu(item) {
      this.$emit(item.funcName, this.data)
    }
  }
}
</script>
<style scoped lang="scss">
 ::v-deep .el-icon-more:before {
      content: "\E794";
}
 ::v-deep .rotate {
      cursor: pointer;
      margin-left: 5px;
      transform: rotate(90deg);
      color: rgb(64 158 255);
 }
 .rotate:focus {
      width: 20px;
      height: 20px;
      border-radius: 4em;
      background-color: rgba(130, 132, 138, 0.2);
}
</style>
