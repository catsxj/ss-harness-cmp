<template>
  <div>
    <el-dialog title="标签" append-to-body :visible.sync="addData.dialog" width="50%">
      <span>
        <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="80px" class="m-t-md">
          <basic-form-item label="标记：">
            <el-row :gutter="5" v-for="(item, key) in addData.data.resourceLabel" :key="'tags' + key">
              <el-col :span="8">
                <basic-form-item label="KEY:" label-width="55px">
                  <el-select v-model="item.key" @change="setValue(item)">
                    <el-option v-for="(item1, index) in tagList" :key="index" :label="item1.name" :value="item1.name"> </el-option>
                  </el-select>
                </basic-form-item>
              </el-col>
              <el-col :span="8">
                <basic-form-item label="VALUE:" label-width="80px">
                  <el-select v-model="item.value">
                    <el-option v-for="(item1, index) in item.valueList" :key="index" :label="item1" :value="item1"> </el-option>
                  </el-select>
                </basic-form-item>
              </el-col>
              <el-col :span="7">
                <el-button type="danger" size="mini" @click="removeItem(key, addData.data.resourceLabel)">删除</el-button>
              </el-col>
            </el-row>
            <el-row>
              <el-button type="primary" @click="addItem(addData.data.resourceLabel)">添加</el-button>
            </el-row>
          </basic-form-item>
        </basic-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="tagOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { modifyTags } from 'services/platform/index'
import { getTags } from 'services/system/tag'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      tagList: [],
      keyList: [],
      valueList: [],
      keyValues: [],
      valueValus: []
    }
  },
  methods: {
    setValue(obj) {
      const objs = this.tagList.find(item => item.name == obj.key)
      obj.valueList = JSON.parse(objs.content)
    },
    retrieval() {
      let flag = false
      const ary = []
      this.addData.data.resourceLabel.forEach(item => {
        const tag = item.key + ':' + item.value
        if (ary.indexOf(tag) == -1) ary.push(tag)
        else flag = true
      })
      return flag
    },
    addItem(data) {
      if (this.retrieval()) return this.$message.error('标签不可重复输入')
      data.push({})
    },
    removeItem(key, data) {
      data.splice(key, 1)
    },
    tagOk() {
      if (this.retrieval()) return this.$message.error('标签不可重复输入')
      modifyTags({
        targetIds: this.addData.data.serverIds,
        vendorId: this.addData.data.vendorId,
        type: this.addData.data.type,
        resourceLabel: this.addData.data.resourceLabel.map(item => {
          return {
            key: item.key,
            value: item.value
          }
        })
      }).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.addData.dialog = false
          this.$emit('back')
        }
      })
    }
  },
  created() {
    const params = {
      page: 1,
      rows: 9999
    }
    getTags(params).then(data => {
      if (data.success) {
        this.tagList = data.data.rows
        if (this.addData.data.resourceLabel.length) {
          this.addData.data.resourceLabel.forEach(item => {
            const obj = this.tagList.find(item1 => item1.name == item.key)
            item.valueList = JSON.parse(obj.content)
          })
        }
      }
    })
  }
}
</script>

<style></style>
