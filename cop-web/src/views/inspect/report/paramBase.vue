<template>
  <div class="param_base">
    <el-row class="top" type="flex">
      <el-col v-for="group in itemData.baseMsg" :key="group.id">
        <div class="title">{{ group.id === 1 ? '字段列表' : '已选字段'}}</div>
        <draggable v-model="group.items" group="site" class="param_list" :sort="false">
          <div class="drag-item" v-for="item in group.items" :key="item.id">
            <div class="content">
              {{ item.remark }}
            </div>
          </div>
        </draggable>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  components: { draggable },
  props: {
    itemData: {
      type: Object,
      required: true
    }
  },
  created() {
    console.log(this.itemData.baseMsg)
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.param_base {
  margin-bottom: 20px;

  .title {
    border-radius: 5px;
    box-sizing: border-box;
    background: #f5f7fa;
    padding: 5px 10px;
    width: 280px;
    margin-left: 40px;
  }

  .param_list {
    width: 300px;
    height: 240px;
    margin-left: 40px;
    .drag-item {
      width: 280px;
      height: 40px;
      line-height: 40px;
      border: 1px solid #eee;
      overflow: hidden;
      margin: 5px 0;
      cursor: move;

      .content {
        margin: 0 10px;
        text-align: left;
      }
    }
  }
}
</style>
