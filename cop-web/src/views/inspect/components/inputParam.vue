<template>
  <div>
    <el-button type="primary" style="margin-bottom: 10px;" icon="el-icon-plus" @click="add">添加参数</el-button>
    <el-row :gutter="20" v-for="(param, index) in itemData.scriptParam" :key="index">
      <el-col :span="10" :offset="0">
        <basic-form-item label="参数名称：" :prop="`scriptParam.${index}.name`"
          validate="required" required-message="参数名称不能为空">
          <el-input v-model.trim="param.name" clearable ></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="10" :offset="0">
        <basic-form-item label="参数值：" :prop="`scriptParam.${index}.value`" validate="required" required-message="参数值不能为空">
          <el-input v-model.trim="param.value" clearable ></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="4" :offset="0">
        <el-button type="danger" icon="el-icon-delete" @click="del(param)">删除</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    itemData: {
      type: Object,
      required: true
    }
  },
  methods: {
    add () {
      this.itemData.scriptParam.push({
        key: Date.now(),
        name: '',
        value: ''
      })
    },
    del (row) {
      const index = this.itemData.scriptParam.indexOf(row)
      if (index !== -1) {
        this.itemData.scriptParam.splice(index, 1)
      }
    }
  }
}
</script>
