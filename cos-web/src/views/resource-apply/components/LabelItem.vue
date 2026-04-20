<template>
  <basic-form-item label="标签：">
    <el-tag class="host-tag m-b-sm" size="medium" v-for="(tag, index) in tags" :key="index" closable @close="handleClose(index)">{{ `${tag.key}：${tag.value}` }}</el-tag>
    <el-button type="primary" @click="handleCreate()" v-if="!showInput">添加标签</el-button>
    <el-row :gutter="20" v-if="showInput">
      <el-col :span="8">
        <el-select v-model="addData.key" @change="setValue(addData)">
          <el-option v-for="(item1, index) in tagList" :key="index" :label="item1.name" :value="item1.name"> </el-option>
        </el-select>
      </el-col>
      <el-col :span="8">
        <el-select v-model="addData.value">
          <el-option v-for="(item1, index) in addData.valueList" :key="index" :label="item1" :value="item1"> </el-option>
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="saveTag()">确定</el-button>
        <el-button @click="showInput = false">取消</el-button>
      </el-col>
    </el-row>
  </basic-form-item>
</template>
<script>
import { getTags } from 'services/system/tag'

export default {
  props: {
    tags: {
      type: Array
    }
  },
  data() {
    return {
      addData: {},
      showInput: false,
      tagList: []
    }
  },
  created() {
    const params = {
      page: 1,
      rows: 9999
    }
    getTags(params).then((data) => {
      if (data.success) {
        this.tagList = data.data.rows
      }
    })
  },
  methods: {
    setValue(obj) {
      this.$set(this.addData, 'value', '')
      const objs = this.tagList.find((item) => item.name == obj.key)
      obj.valueList = JSON.parse(objs.content)
    },
    handleCreate() {
      this.showInput = true
      this.addData = {}
    },
    saveTag() {
      const { key, value } = this.addData
      if (key && value) {
        this.tags.push({ key, value })
        this.showInput = false
      } else {
        this.$message.error('请输入内容')
      }
    },
    handleClose(index) {
      this.tags.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.create-tag {
  height: 28px !important;
  line-height: 28px !important;
}
::v-deep {
  .host-tag + .host-tag {
    margin-left: 10px;
  }
  .host-tag:last-of-type {
    margin-right: 10px;
  }
}
</style>
