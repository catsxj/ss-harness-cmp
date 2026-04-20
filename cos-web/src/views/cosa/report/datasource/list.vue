<template>
  <div>
    <div v-for="(list, index) in lists" :key="index" class="list">
       <!-- <el-select v-model="list.key" :disabled="list.status" v-if="type == 'header'" placeholder="键">
        <el-option v-for="item in headers" :key="item" :label="item" :value="item"></el-option>
      </el-select> -->
      <el-input v-model="list.key" placeholder="键"></el-input>
      <el-input v-model="list.value" placeholder="值"></el-input>
      <span>
        <!-- <el-button type="primary" icon="el-icon-check" circle v-if="!list.status" @click="saveList(list)"></el-button> -->
        <!-- <el-button type="primary" icon="el-icon-edit" circle v-else @click="list.status = false"></el-button> -->
        <el-button type="danger" icon="el-icon-delete" circle :disabled="lists.length == 1" @click="removeList(index)"></el-button>
        <el-button type="primary" icon="el-icon-plus" circle style="margin-bottom: 10px" @click="lists.push(model)" :disabled="!list.key || !list.value" v-if="index == lists.length - 1"></el-button>
      </span>
    </div>
  </div>
</template>
<script>
import { Message } from 'element-ui'
export default {
  props: {
    lists: {
      type: Array,
      default: () => []
    },
    model: {
      type: Object,
      default: () => ({})
    },
    headers: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'header'
    }
  },
  setup(props) {
    function saveList(data) {
      const { key, value } = data
      if (!key || !value) {
        return Message.warning('请完善参数')
      } else {
        data.status = true
      }
    }
    function removeList(idx) {
      props.lists.splice(idx, 1)
    }
    return {
      saveList,
      removeList
    }
  }
}
</script>
<style lang="scss" scoped>
.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}
.list {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  .el-input, .el-select {
    width: 40%;
  }
  &>span {
    width: 18%;
  }
}
</style>
